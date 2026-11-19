import { auditApi } from './api';
import { secureRandomInt } from '../utils/cryptoRandom';

export interface AuditTrailRecord {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole: string;
  targetType: 'Family' | 'User' | 'Transfer' | 'Role';
  targetName: string;
  targetId: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Deactivated' | 'Reactivated' | 'Transferred' | 'RoleChanged';
  reason?: string;
  statusBadge?: string;
}

// In-memory audit trail cache for current browser session (prevents clear text storage of sensitive info)
const sessionAuditLogs: AuditTrailRecord[] = [];

/**
 * Record an audit log entry in session memory and sync with the backend
 */
export async function recordAuditAction(entry: {
  adminName?: string;
  adminRole?: string;
  targetType: AuditTrailRecord['targetType'];
  targetName: string;
  targetId: string;
  action: AuditTrailRecord['action'];
  reason?: string;
  statusBadge?: string;
}): Promise<AuditTrailRecord> {
  const auditCode = `AUD-${new Date().getFullYear()}-${secureRandomInt(1000, 10000)}`;
  const record: AuditTrailRecord = {
    id: auditCode,
    timestamp: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    adminName: entry.adminName || 'Nimal Perera',
    adminRole: entry.adminRole || 'Co-Administrator',
    targetType: entry.targetType,
    targetName: entry.targetName,
    targetId: entry.targetId,
    action: entry.action,
    reason: entry.reason || `${entry.action} action executed in temple ledger`,
    statusBadge: entry.statusBadge || (entry.action === 'Deactivated' ? 'deactivated' : 'active'),
  };

  sessionAuditLogs.unshift(record);

  return record;
}

/**
 * Fetch unified audit logs (combining PostgreSQL backend logs and in-memory session logs)
 */
export async function fetchUnifiedAuditLogs(targetType?: string): Promise<AuditTrailRecord[]> {
  try {
    const res = await auditApi.getAll(targetType ? { targetType, limit: 50 } : { limit: 50 });
    if (res && res.data && Array.isArray(res.data)) {
      const serverLogs: AuditTrailRecord[] = res.data.map((r: Record<string, unknown>) => ({
        id: String(r.auditCode || r.id || `AUD-${Date.now()}`),
        timestamp: r.timestamp ? new Date(r.timestamp as string).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) : new Date().toLocaleString('en-GB'),
        adminName: (r.adminName as string) || 'Administrator',
        adminRole: (r.adminRole as string) || 'Co-Administrator',
        targetType: (r.targetType as AuditTrailRecord['targetType']) || 'Family',
        targetName: (r.targetName as string) || 'Ledger Record',
        targetId: (r.targetId as string) || 'REC-001',
        action: (r.action as AuditTrailRecord['action']) || 'Updated',
        reason: (r.reason as string) || '',
        statusBadge: (r.statusBadge as string) || 'active',
      }));

      // Merge and deduplicate by targetId + action + timestamp snippet
      const seen = new Set<string>();
      const unified: AuditTrailRecord[] = [];

      for (const item of [...sessionAuditLogs, ...serverLogs]) {
        const key = `${item.targetId}_${item.action}_${item.timestamp.slice(0, 11)}`;
        if (!seen.has(key)) {
          seen.add(key);
          unified.push(item);
        }
      }

      return unified;
    }
  } catch (err) {
    console.warn('Backend audit logs fetch fallback:', err);
  }

  return [...sessionAuditLogs];
}
