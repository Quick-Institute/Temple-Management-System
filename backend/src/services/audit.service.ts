import pool from "../config/database.js";

export interface AuditLogInput {
  templeId?: string | null;
  adminName: string;
  adminRole: string;
  targetType: "User" | "Family" | "Transfer" | "Role";
  targetName: string;
  targetId: string;
  action: "Created" | "Updated" | "Deleted" | "Deactivated" | "Reactivated" | "Transferred" | "RoleChanged";
  reason?: string;
  statusBadge?: string;
}

export async function logAuditTrail(input: AuditLogInput): Promise<void> {
  try {
    const auditCode = `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await pool.query(
      `INSERT INTO audit_logs (
        "id", "auditCode", "templeId", "adminName", "adminRole",
        "targetType", "targetName", "targetId", "action", "reason", "statusBadge", "timestamp"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
      [
        id,
        auditCode,
        input.templeId || null,
        input.adminName || "System Administrator",
        input.adminRole || "Co-Administrator",
        input.targetType,
        input.targetName,
        input.targetId,
        input.action,
        input.reason || null,
        input.statusBadge || "active"
      ]
    );
  } catch (error) {
    console.error("Failed to record audit log (non-fatal):", error);
  }
}

