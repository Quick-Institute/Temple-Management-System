import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave from '../../../components/TempleFooterWave.tsx';
import { INITIAL_ROSTER, type AuditLogRecord } from '../../../data/seed';

// Helper to load user record without cascading renders
function loadUserRecord(targetId: string) {
  try {
    const savedUsers: Record<string, unknown>[] = JSON.parse(localStorage.getItem('temple_registered_users') || '[]');
    const allUsers = [...savedUsers, ...INITIAL_ROSTER];
    const found = allUsers.find((u) => String(u.id) === String(targetId)) as Record<string, unknown> | undefined;

    if (found) {
      const first = (found.firstName as string) || (found.name as string)?.split(' ')[0] || '';
      const last = (found.lastName as string) || (found.name as string)?.split(' ').slice(1).join(' ') || '';
      return {
        id: Number(found.id || targetId),
        templeName: (found.templeName as string) || 'Sri Sambodhi Maha Viharaya',
        templeCode: (found.templeCode as string) || 'TPL-2026-0482',
        firstName: first,
        lastName: last,
        name: (found.name as string) || `${first} ${last}`.trim(),
        alias: (found.alias as string) || '',
        email: (found.email as string) || '',
        phone: (found.phone as string) || '',
        nic: (found.nic as string) || 'Verified NIC (SL)',
        committeeName: (found.committeeName as string) || 'Dayaka Sabhawa',
        customCommitteeName: '',
        designation: (found.designation as string) || 'Committee Member',
        customDesignation: '',
        role: (found.role as string) || 'official',
        status: ((found.status as string) || 'active') as 'active' | 'deactivated' | 'permanent',
        isPermanent: Boolean(found.isPermanent),
        avatar: (found.avatar as string) || `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'U',
        avatarBg: (found.avatarBg as string) || 'bg-emerald-100',
        avatarColor: (found.avatarColor as string) || 'text-emerald-800',
        deactivateReason: (found.deactivateReason as string) || 'Term Completed / Routine Committee Rotation',
        deactivateNotes: (found.deactivateNotes as string) || '',
        deactivateNotifyEmail: true,
        deactivatedAt: found.deactivatedAt as string | undefined,
        permFamily: found.permFamily !== false,
        permDana: found.permDana !== false,
        permNotices: found.permNotices !== false,
        permFinance: Boolean(found.permFinance || found.designation === 'Treasurer'),
        resetPassword: false,
        newPassword: '',
        confirmPassword: ''
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export default function EditUserPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const targetId = routeId || searchParams.get('id') || '2';

  const initialRecord = useMemo(() => loadUserRecord(targetId), [targetId]);
  const loading = false;
  const userNotFound = !initialRecord;
  const [isSaving, setIsSaving] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'warning' | 'error'; title: string; desc: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  // Form State
  const [formData, setFormData] = useState(() => initialRecord || {
    id: Number(targetId),
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: '',
    lastName: '',
    name: '',
    alias: '',
    email: '',
    phone: '',
    nic: '',
    committeeName: 'Dayaka Sabhawa',
    customCommitteeName: '',
    designation: 'Committee Member',
    customDesignation: '',
    role: 'official',
    status: 'active' as 'active' | 'deactivated' | 'permanent',
    isPermanent: false,
    avatar: 'U',
    avatarBg: 'bg-emerald-100',
    avatarColor: 'text-emerald-800',
    deactivateReason: 'Term Completed / Routine Committee Rotation',
    deactivateNotes: '',
    deactivateNotifyEmail: true,
    deactivatedAt: undefined as string | undefined,
    // Permissions
    permFamily: true,
    permDana: true,
    permNotices: true,
    permFinance: false,
    // Optional password reset
    resetPassword: false,
    newPassword: '',
    confirmPassword: ''
  });

  const [initialData] = useState(() => initialRecord);

  // Record Audit Trail
  const recordAuditAction = (targetName: string, idVal: string, action: AuditLogRecord['action'], reason: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
      const newRecord: AuditLogRecord = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        adminName: 'Nimal Perera',
        adminRole: 'Co-Administrator',
        targetType: 'User',
        targetName,
        targetId: `USR-${idVal}`,
        action,
        reason,
        statusBadge: action === 'Deactivated' ? 'deactivated' : 'active'
      };
      localStorage.setItem('temple_audit_logs', JSON.stringify([newRecord, ...saved]));
    } catch (err) {
      console.error(err);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fullFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || formData.name;
    const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

    const updatedUser = {
      ...formData,
      name: fullFullName,
      avatar: formData.avatar || initials,
      deactivatedAt: formData.status === 'deactivated' ? (formData.deactivatedAt || new Date().toISOString()) : undefined,
      deactivateReason: formData.status === 'deactivated' ? formData.deactivateReason : undefined,
      deactivateNotes: formData.status === 'deactivated' ? formData.deactivateNotes : undefined,
    };

    // Save to localStorage
    try {
      const savedUsers: Record<string, unknown>[] = JSON.parse(localStorage.getItem('temple_registered_users') || '[]');
      const existingIdx = savedUsers.findIndex((u) => String(u.id) === String(formData.id));

      let updatedList = [];
      if (existingIdx >= 0) {
        updatedList = savedUsers.map((u) => (String(u.id) === String(formData.id) ? updatedUser : u));
      } else {
        const otherSaved = savedUsers.filter((u) => String(u.id) !== String(formData.id));
        updatedList = [updatedUser, ...otherSaved];
      }
      localStorage.setItem('temple_registered_users', JSON.stringify(updatedList));

      // Audit Log check
      if (initialData) {
        if (initialData.status !== 'deactivated' && updatedUser.status === 'deactivated') {
          recordAuditAction(updatedUser.name, String(updatedUser.id), 'Deactivated', updatedUser.deactivateReason || 'Deactivated via dedicated profile edit page');
        } else if (initialData.status === 'deactivated' && updatedUser.status === 'active') {
          recordAuditAction(updatedUser.name, String(updatedUser.id), 'Reactivated', 'Credentials restored via dedicated profile edit page');
        } else {
          recordAuditAction(updatedUser.name, String(updatedUser.id), 'Role Updated', `Updated committee designation to ${updatedUser.designation} (${updatedUser.committeeName})`);
        }
      }

      setNotificationMsg({
        type: 'success',
        title: 'Profile Updated Successfully',
        desc: `Official record for ${updatedUser.name} has been updated in the ecclesiastical registry.`
      });

      setTimeout(() => {
        navigate('/users-roles');
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setNotificationMsg({
        type: 'error',
        title: 'Save Failed',
        desc: 'An error occurred while saving profile changes. Please retry.'
      });
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    }
  };

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let randomPass = 'Vihara#';
    for (let i = 0; i < 7; i++) {
      randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      resetPassword: true,
      newPassword: randomPass,
      confirmPassword: randomPass
    }));
  };

  return (
    <div className="temple-portal flex h-auto min-h-screen w-full overflow-visible bg-[#F0F8FF] text-[#0F172A]">
      {/* ============ SHARED SACRED TEMPLE SIDEBAR (DESKTOP) ============ */}
      <div className="sticky top-0 hidden lg:block h-dvh shrink-0 self-start z-30">
        <Sidebar />
      </div>

      {/* ============ MOBILE SIDEBAR DRAWER ============ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-sage-950/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <Sidebar isMobile mobileOpen onNavigate={() => setMobileMenuOpen(false)} onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ============ SCROLLABLE MAIN CONTENT AREA ============ */}
      <div className="flex-1 flex flex-col h-auto min-w-0 overflow-visible">
        {/* Dashboard Sacred Top Header */}
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Sub-header Breadcrumb Bar */}
        <div className="bg-white/80 border-b border-sky-100 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/users-roles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-sky-900 bg-white hover:bg-sky-50 border border-sky-200 shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Users &amp; Roles</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-[12px] text-sky-600">
              <span>/</span>
              <span className="font-medium text-sky-800">Official Profile</span>
              <span>/</span>
              <span className="font-mono text-[#0284C7] font-bold">USR-{formData.id || targetId}</span>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[13px] text-sky-800 font-medium">Loading official devotee profile from registry...</p>
          </div>
        ) : userNotFound ? (
          <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-red-200 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">person_off</span>
            </div>
            <h3 className="text-[18px] font-bold text-gray-900">Official Devotee Record Not Found</h3>
            <p className="text-[12.5px] text-gray-600 mt-1 mb-5">
              We couldn't locate a registered user record matching ID <span className="font-mono font-bold">USR-{targetId}</span> in the temple database.
            </p>
            <Link
              to="/users-roles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              <span>Return to Users &amp; Roles Directory</span>
            </Link>
          </div>
        ) : (
          /* Main Page Content */
          <main className="p-5 sm:p-7 max-w-5xl mx-auto w-full space-y-6">
            
            {/* Page Header Hero Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0C4A6E] via-[#0369A1] to-[#0C4A6E] text-white p-6 sm:p-7 shadow-xl border border-sky-400/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-10 -translate-y-8 text-sky-200">
                <span className="material-symbols-outlined text-[220px]">manage_accounts</span>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#0C4A6E] border-2 border-sky-300 shadow-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 ring-4 ring-[#0369A1]/40">
                    {formData.avatar || formData.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30 font-bold">
                        USR-{formData.id}
                      </span>
                      {formData.status === 'permanent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-400/20 border border-sky-300/50 text-[#BAE6FD]">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Permanent Monastic Head
                        </span>
                      ) : formData.status === 'deactivated' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/25 border border-rose-400/40 text-rose-200">
                          <span className="material-symbols-outlined text-[13px]">person_off</span>
                          Account Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/25 border border-emerald-400/40 text-emerald-200">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Active Official Credential
                        </span>
                      )}
                    </div>
                    <h2 className="text-[22px] sm:text-[25px] font-bold text-white tracking-tight mt-1">
                      {formData.name || `${formData.firstName} ${formData.lastName}`}
                    </h2>
                    <p className="text-[12.5px] text-emerald-100/80 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#FFE885]">{formData.designation}</span>
                      <span>•</span>
                      <span>{formData.committeeName}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-200">{formData.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <Link
                    to="/users-roles"
                    className="px-4 py-2 rounded-xl text-[12px] font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold text-[#0C4A6E] bg-gradient-to-r from-[#FFE885] to-[#0284C7] hover:brightness-105 shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">save</span>
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Toast Alert */}
            {notificationMsg && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md animate-fade-up ${
                notificationMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : notificationMsg.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">
                  {notificationMsg.type === 'success' ? 'verified' : 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold">{notificationMsg.title}</h4>
                  <p className="text-[11.5px] opacity-90 mt-0.5">{notificationMsg.desc}</p>
                </div>
              </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Institutional Affiliation */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[19px]">temple_buddhist</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                        1. Temple Institution &amp; Parish Registry
                      </h3>
                      <p className="text-[11px] text-gray-500">Parish institution credentials and registration code</p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                    Verified Temple Institution
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.templeName', 'Temple Name')}
                    </label>
                    <input
                      type="text"
                      value={formData.templeName}
                      onChange={(e) => setFormData({ ...formData, templeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.templeCode', 'Registration Code')}
                    </label>
                    <input
                      type="text"
                      value={formData.templeCode}
                      onChange={(e) => setFormData({ ...formData, templeCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-[#0369A1] font-bold shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Devotee & Clergy Identity */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">person</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      {t('users.sec.personal', '2. Devotee & Clergy Official Identity')}
                    </h3>
                    <p className="text-[11px] text-gray-500">Official member identity and contact coordinates</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.firstName', 'First Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.lastName', 'Last Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Honorific Alias / Title
                    </label>
                    <input
                      type="text"
                      value={formData.alias}
                      onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                      placeholder='e.g. "Sunil Aiya" or "Chief Dayaka"'
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.nic', 'NIC / Monastic ID')}
                    </label>
                    <input
                      type="text"
                      value={formData.nic}
                      onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.email', 'Official Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.phone', 'Contact Phone Number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Governance & Committee Assignment */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">account_tree</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      {t('users.sec.committee', '3. Governance, Committee & Official Designation')}
                    </h3>
                    <p className="text-[11px] text-gray-500">Committee assignment, official designation and account status</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.committeeName', 'Committee Name')}
                    </label>
                    <select
                      value={formData.committeeName}
                      onChange={(e) => setFormData({ ...formData, committeeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                    >
                      <option value="Dayaka Sabhawa">Dayaka Sabhawa</option>
                      <option value="Event or Programme Committee">Event or Programme Committee</option>
                      <option value="Education & Youth Committee">Education &amp; Youth Committee</option>
                      <option value="Finance & Development Board">Finance &amp; Development Board</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('users.form.designation', 'Official Designation')}
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                    >
                      <option value="President">President</option>
                      <option value="Vice-President">Vice-President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Assistant Secretary">Assistant Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Committee Member">Committee Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      disabled={formData.isPermanent}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'deactivated' | 'permanent' })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                      {formData.isPermanent && <option value="permanent">Permanent Monastic Head</option>}
                    </select>
                  </div>
                </div>

                {/* Conditional Deactivation Reason Box */}
                {formData.status === 'deactivated' && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-[12px]">
                      <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
                      <span>Deactivation Reason &amp; Clergy Minutes</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                          Primary Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.deactivateReason}
                          onChange={(e) => setFormData({ ...formData, deactivateReason: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] border border-amber-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                        >
                          <option value="Term Completed / Routine Committee Rotation">
                            Term Completed / Routine Committee Rotation
                          </option>
                          <option value="Voluntary Resignation Requested">
                            Voluntary Resignation Requested
                          </option>
                          <option value="Relocation / Transferred from Parish">
                            Relocation / Transferred from Parish
                          </option>
                          <option value="Temporary Leave of Absence">
                            Temporary Leave of Absence
                          </option>
                          <option value="Disciplinary / Governance Review">
                            Disciplinary / Governance Review
                          </option>
                          <option value="Other Administrative Decision">
                            Other Administrative Decision
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                          Reference Minute / Clergy Notes
                        </label>
                        <input
                          type="text"
                          value={formData.deactivateNotes}
                          onChange={(e) => setFormData({ ...formData, deactivateNotes: e.target.value })}
                          placeholder="e.g. Dayaka Sabhawa Meeting Minute #14/2026"
                          className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] border border-amber-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: System Privileges & Role-Based Access */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">lock_person</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      4. System Privileges &amp; Role-Based Access
                    </h3>
                    <p className="text-[11px] text-gray-500">System module authorizations and access levels</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permFamily}
                      onChange={(e) => setFormData({ ...formData, permFamily: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#0C4A6E] border-gray-300 focus:ring-[#0C4A6E]"
                    />
                    <div>
                      <div className="text-[12.5px] font-bold text-gray-900">Family Ledger Management</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        View, register, and update devotee family ledgers
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permDana}
                      onChange={(e) => setFormData({ ...formData, permDana: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#0C4A6E] border-gray-300 focus:ring-[#0C4A6E]"
                    />
                    <div>
                      <div className="text-[12.5px] font-bold text-gray-900">Dana &amp; Alms Roster Administration</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Manage Dana roster bookings, calendar, and clergy approvals
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permNotices}
                      onChange={(e) => setFormData({ ...formData, permNotices: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#0C4A6E] border-gray-300 focus:ring-[#0C4A6E]"
                    />
                    <div>
                      <div className="text-[12.5px] font-bold text-gray-900">Announcements &amp; Communication</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Draft parish announcements, send notices, and publish bulletin updates
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permFinance}
                      onChange={(e) => setFormData({ ...formData, permFinance: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#0C4A6E] border-gray-300 focus:ring-[#0C4A6E]"
                    />
                    <div>
                      <div className="text-[12.5px] font-bold text-gray-900">Financial &amp; Merit Ledger Records</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Track parish donations, temple funds, and merit ledger records
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 5: Password & Security Reset (Optional) */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[19px]">key</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                        5. Security Credentials &amp; Password Reset
                      </h3>
                      <p className="text-[11px] text-gray-500">Update account password (optional)</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_fix</span>
                    <span>Generate Strong Password</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.resetPassword}
                      onChange={(e) => setFormData({ ...formData, resetPassword: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0C4A6E] border-gray-300 focus:ring-[#0C4A6E]"
                    />
                    <span className="text-[12.5px] font-medium text-gray-800">
                      Reset account access password for this user
                    </span>
                  </label>

                  {formData.resetPassword && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                          New Password
                        </label>
                        <input
                          type="text"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Enter new secure password"
                          className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="text"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Re-enter password to match"
                          className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-30 p-4 px-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Link
                    to="/users-roles"
                    className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-colors text-center"
                  >
                    {t('common.cancel', 'Cancel Changes')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="hidden sm:inline-flex px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer justify-center"
                  >
                    Reset Form
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/25 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">save</span>
                    <span>{isSaving ? t('common.saving', 'Saving Changes...') : t('common.save', 'Save Official Profile Changes')}</span>
                  </button>
                </div>
              </div>

            </form>
          </main>
        )}

        {/* Bottom Flowing Wave Silhouette with Floating Badge */}
        <TempleFooterWave />
      </div>
    </div>
  );
}
