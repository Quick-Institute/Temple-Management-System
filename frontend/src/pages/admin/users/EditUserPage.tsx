import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave from '../../../components/TempleFooterWave.tsx';
import { INITIAL_ROSTER, type AuditLogRecord } from '../../../data/seed';
import { usersApi } from '../../../services/api.ts';
import { useActiveTemple } from '../../../hooks/useActiveTemple';
import {
  formatSriLankanPhone,
  isValidSriLankanPhone,
  formatSriLankanNic,
  getNicValidation,
} from '../../../utils/sriLankanValidation';
import { secureRandomString } from '../../../utils/cryptoRandom';

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

// Record Audit Trail Helper
function recordAuditAction(targetName: string, idVal: string, action: AuditLogRecord['action'], reason: string) {
  try {
    const saved = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
    const newRecord: AuditLogRecord = {
      id: `AUD-2026-${Date.now().toString().slice(-4)}`,
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
}

export default function EditUserPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { temple } = useActiveTemple();
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const targetId = routeId || searchParams.get('id') || '2';

  const initialRecord = useMemo(() => loadUserRecord(targetId), [targetId]);
  const loading = false;
  const userNotFound = !initialRecord;
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'warning' | 'error'; title: string; desc: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isCrossTempleRestricted = useMemo(() => {
    if (!temple || !formData.templeName) return false;
    const isSame =
      formData.templeName.toLowerCase() === temple.name.toLowerCase() ||
      (Boolean(temple.registrationId) && Boolean(formData.templeCode) && (formData.templeCode === temple.registrationId || formData.templeCode === 'TPL-2026-0482')) ||
      (temple.name.toLowerCase().includes('sambodhi') && formData.templeName.toLowerCase().includes('sambodhi'));
    return !isSame;
  }, [temple, formData.templeName, formData.templeCode]);

  const validateEditForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      errs.firstName = 'First Name is required';
    }
    if (!formData.lastName?.trim()) {
      errs.lastName = 'Last Name / Family Name is required';
    }
    if (!formData.email?.trim()) {
      errs.email = 'Official Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. official@temple.lk)';
    }
    if (formData.phone?.trim()) {
      if (!isValidSriLankanPhone(formData.phone)) {
        errs.phone = 'Please enter a valid 10-digit Sri Lankan phone number (e.g. 071-2345678)';
      }
    }
    if (formData.nic?.trim()) {
      const nicCheck = getNicValidation(formData.nic);
      if (!nicCheck.isValid) {
        errs.nic = nicCheck.message || 'Invalid Sri Lankan National ID (NIC)';
      }
    }
    if (formData.resetPassword) {
      if (!formData.newPassword) {
        errs.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        errs.newPassword = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Confirm Password is required';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.status === 'deactivated') {
      if (!formData.deactivateReason?.trim()) {
        errs.deactivateReason = 'Deactivation reason is required';
      }
      if (!formData.deactivateNotes?.trim() || formData.deactivateNotes.trim().length < 5) {
        errs.deactivateNotes = 'Administrative notes / reference is required (minimum 5 characters)';
      }
    }

    return errs;
  };

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  // Fetch updated official user record from PostgreSQL backend API
  useEffect(() => {
    if (!targetId) return;
    usersApi.getById(targetId)
      .then((res) => {
        if (res.data) {
          const u = res.data;
          const first = u.firstName || u.name?.split(' ')[0] || '';
          const last = u.lastName || u.name?.split(' ').slice(1).join(' ') || '';
          setFormData((prev) => ({
            ...prev,
            id: Number(u.id) || prev.id,
            templeName: u.templeName || prev.templeName,
            templeCode: u.templeCode || prev.templeCode,
            firstName: first,
            lastName: last,
            name: u.name || `${first} ${last}`.trim(),
            alias: u.alias || '',
            email: u.email || '',
            phone: u.phone || '',
            nic: u.nic || 'Verified NIC (SL)',
            committeeName: u.committeeName || 'Dayaka Sabhawa',
            designation: u.designation || 'Committee Member',
            role: u.role || 'official',
            status: (u.status || 'active') as 'active' | 'deactivated' | 'permanent',
            isPermanent: Boolean(u.isPermanent),
            avatar: u.avatar || 'U',
            avatarBg: u.avatarBg || 'bg-emerald-100',
            avatarColor: u.avatarColor || 'text-emerald-800',
            deactivateReason: u.deactivateReason || prev.deactivateReason,
            deactivateNotes: u.deactivateNotes || '',
            deactivateNotifyEmail: true,
            deactivatedAt: u.deactivatedAt,
            permFamily: u.permFamily !== false,
            permDana: u.permDana !== false,
            permNotices: u.permNotices !== false,
            permFinance: Boolean(u.permFinance),
          }));
        }
      })
      .catch((err) => {
        console.warn('Backend user fetch fallback to local:', err);
      });
  }, [targetId]);

  const [initialData] = useState(() => initialRecord);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCrossTempleRestricted) {
      setNotificationMsg({
        type: 'error',
        title: 'Access Denied',
        desc: 'You do not have administrative permission to modify official user accounts of another temple.'
      });
      return;
    }

    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setNotificationMsg({
        type: 'error',
        title: 'Validation Error',
        desc: `Please resolve the ${Object.keys(errs).length} highlighted error(s) in red before saving.`
      });
      const firstField = Object.keys(errs)[0];
      const el = document.getElementById(firstField);
      if (el) el.focus();
      return;
    }

    setFieldErrors({});
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

    try {
      // Connect to PostgreSQL Backend API (FR-08, FR-14, FR-16)
      await usersApi.update(formData.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nic: formData.nic,
        committeeName: formData.committeeName,
        customCommitteeName: formData.customCommitteeName,
        designation: formData.designation,
        customDesignation: formData.customDesignation,
        role: formData.role,
        permFamily: formData.permFamily,
        permDana: formData.permDana,
        permNotices: formData.permNotices,
        permFinance: formData.permFinance,
        newPassword: formData.resetPassword ? formData.newPassword : undefined,
      });

      // Update status if changed
      if (initialData && initialData.status !== formData.status) {
        await usersApi.updateStatus(formData.id, {
          status: formData.status,
          deactivateReason: formData.deactivateReason,
          deactivateNotes: formData.deactivateNotes,
        });
      }

      // Save to localStorage as cache
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
    } catch (err: unknown) {
      console.error(err);
      setIsSaving(false);
      const msg = err instanceof Error ? err.message : 'An error occurred while saving profile changes. Please retry.';
      setNotificationMsg({
        type: 'error',
        title: 'Save Failed',
        desc: msg
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
    const randomPass = 'Vihara#' + secureRandomString(chars, 8);
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

            {/* Cross-Temple Access Restriction Alert */}
            {isCrossTempleRestricted && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
                <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">lock</span>
                <div>
                  <h4 className="font-bold text-[14px]">Restricted Cross-Temple Access</h4>
                  <p className="text-[12.5px] text-amber-800 mt-0.5 leading-relaxed">
                    This official user account belongs to <strong>{formData.templeName}</strong> ({formData.templeCode}). You are currently logged in under <strong>{temple?.name}</strong>. Only administrators belonging to that temple are authorized to modify this official profile.
                  </p>
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="firstName">
                      {t('users.form.firstName', 'First Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.firstName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10'}`}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.firstName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="lastName">
                      {t('users.form.lastName', 'Last Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.lastName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10'}`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.lastName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="alias">
                      Honorific Alias / Title
                    </label>
                    <input
                      id="alias"
                      type="text"
                      value={formData.alias}
                      onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                      placeholder='e.g. "Sunil Aiya" or "Chief Dayaka"'
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="nic">
                      {t('users.form.nic', 'NIC / Monastic ID')}
                    </label>
                    <input
                      id="nic"
                      type="text"
                      value={formData.nic}
                      onChange={(e) => {
                        const next = formatSriLankanNic(e.target.value);
                        setFormData({ ...formData, nic: next });
                        if (fieldErrors.nic) setFieldErrors({ ...fieldErrors, nic: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs ${fieldErrors.nic ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10'}`}
                    />
                    {fieldErrors.nic ? (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.nic}</span>
                      </p>
                    ) : formData.nic && getNicValidation(formData.nic).isValid ? (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>{getNicValidation(formData.nic).type} Verified</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-1">9 digits + V/X or 12 digits</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="email">
                      {t('users.form.email', 'Official Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10'}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="phone">
                      {t('users.form.phone', 'Contact Phone Number')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const next = formatSriLankanPhone(e.target.value);
                        setFormData({ ...formData, phone: next });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10'}`}
                    />
                    {fieldErrors.phone ? (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.phone}</span>
                      </p>
                    ) : formData.phone && isValidSriLankanPhone(formData.phone) ? (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Valid Sri Lankan Phone ({formData.phone})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-1">Auto-formats to 07X-XXXXXXX</p>
                    )}
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
                          id="deactivateReason"
                          value={formData.deactivateReason}
                          onChange={(e) => {
                            setFormData({ ...formData, deactivateReason: e.target.value });
                            if (fieldErrors.deactivateReason) setFieldErrors({ ...fieldErrors, deactivateReason: '' });
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-[12.5px] border focus:outline-none transition-all cursor-pointer ${
                            fieldErrors.deactivateReason
                              ? 'border-red-500 bg-red-50/20 text-red-950 focus:border-red-500'
                              : 'border-amber-300 focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs'
                          }`}
                        >
                          <option value="">-- Select Deactivation Reason (Required) --</option>
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
                        {fieldErrors.deactivateReason && (
                          <p className="text-[11.5px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">error</span>
                            {fieldErrors.deactivateReason}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-950 mb-1.5">
                          Reference Minute / Clergy Notes <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="deactivateNotes"
                          type="text"
                          value={formData.deactivateNotes}
                          onChange={(e) => {
                            setFormData({ ...formData, deactivateNotes: e.target.value });
                            if (fieldErrors.deactivateNotes) setFieldErrors({ ...fieldErrors, deactivateNotes: '' });
                          }}
                          placeholder="e.g. Dayaka Sabhawa Meeting Minute #14/2026"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-[12.5px] border focus:outline-none transition-all ${
                            fieldErrors.deactivateNotes
                              ? 'border-red-500 bg-red-50/20 text-red-950 focus:border-red-500'
                              : 'border-amber-300 focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs'
                          }`}
                        />
                        {fieldErrors.deactivateNotes && (
                          <p className="text-[11.5px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">error</span>
                            {fieldErrors.deactivateNotes}
                          </p>
                        )}
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
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="newPassword">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="newPassword"
                          type="text"
                          value={formData.newPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, newPassword: e.target.value });
                            if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
                          }}
                          placeholder="Enter new secure password"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.newPassword ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                        />
                        {fieldErrors.newPassword && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">error</span>
                            <span>{fieldErrors.newPassword}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="confirmPassword">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="confirmPassword"
                          type="text"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                          }}
                          placeholder="Re-enter password to match"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.confirmPassword ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                        />
                        {fieldErrors.confirmPassword && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">error</span>
                            <span>{fieldErrors.confirmPassword}</span>
                          </p>
                        )}
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
                    disabled={isSaving || isCrossTempleRestricted}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 disabled:cursor-not-allowed border border-sky-400/50 shadow-md shadow-sky-600/25 transition-all cursor-pointer"
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
