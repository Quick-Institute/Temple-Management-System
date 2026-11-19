
import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave from '../../../components/TempleFooterWave.tsx';
import { INITIAL_FAMILIES, SRI_LANKA_DISTRICTS, type FamilyMember } from '../../../data/seed';
import { familiesApi } from '../../../services/api.ts';
import { useActiveTemple } from '../../../hooks/useActiveTemple';
import {
  formatSriLankanPhone,
  isValidSriLankanPhone,
  formatSriLankanNic,
  getNicValidation,
} from '../../../utils/sriLankanValidation';
import { saveSessionFamily, getSessionFamilies } from '../../../utils/sessionCache';

// Helper to load family from session or seed fallback without cascading effect renders
function loadFamilyRecord(targetId: string) {
  try {
    const savedFamilies = getSessionFamilies();
    const allFamilies = [...savedFamilies, ...INITIAL_FAMILIES];
    const found = allFamilies.find((f) => String(f.id).toLowerCase() === String(targetId).toLowerCase());
    if (found) {
      const first = (found.firstName as string) || (found.name as string)?.split(' ')[0] || '';
      const last = (found.lastName as string) || (found.name as string)?.split(' ').slice(1).join(' ') || '';
      return {
        id: String(found.id || targetId),
        templeName: (found.templeName as string) || 'Sri Sambodhi Maha Viharaya',
        templeCode: (found.templeCode as string) || 'TPL-2026-0482',
        name: (found.name as string) || `${first} ${last}`.trim(),
        firstName: first,
        lastName: last,
        nic: (found.nic as string) || 'Verified NIC (SL)',
        phone: (found.phone as string) || '',
        email: (found.email as string) || '',
        address: (found.address as string) || '',
        village: (found.village as string) || 'Temple Road',
        district: (found.district as string) || 'Hambantota',
        postalCode: (found.postalCode as string) || '82200',
        ward: (found.ward as string) || 'Meda Gama',
        status: ((found.status as string) || 'Active') as 'Active' | 'Transferred' | 'Deactivated',
        enrollmentMode: (found.enrollmentMode as string) || 'Manual Clerical Entry',
        enrollmentType: ((found.enrollmentType as string) || 'manual') as 'qr' | 'transfer' | 'manual',
        certificateNumber: (found.certificateNumber as string) || '',
        members: Array.isArray(found.members) ? [...(found.members as FamilyMember[])] : [],
        deactivateReason: (found.deactivateReason as string) || 'Relocated outside parish boundary',
        deactivateNotes: (found.deactivateNotes as string) || '',
        danaTurnNotes: (found.danaTurnNotes as string) || 'Allocated for Vesak / Poson rotation',
        clericalNotes: (found.clericalNotes as string) || ''
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export default function EditFamilyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { temple } = useActiveTemple();
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const targetId = routeId || searchParams.get('id') || 'FAM-2026-001';

  const initialRecord = useMemo(() => loadFamilyRecord(targetId), [targetId]);
  const loading = false;
  const familyNotFound = !initialRecord;
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'warning' | 'error'; title: string; desc: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => initialRecord || {
    id: targetId,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    name: '',
    firstName: '',
    lastName: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
    village: 'Temple Road',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'Meda Gama',
    status: 'Active' as 'Active' | 'Transferred' | 'Deactivated',
    enrollmentMode: 'Manual Clerical Entry',
    enrollmentType: 'manual' as 'qr' | 'transfer' | 'manual',
    certificateNumber: '',
    members: [] as FamilyMember[],
    deactivateReason: 'Relocated outside parish boundary',
    deactivateNotes: '',
    danaTurnNotes: 'Allocated for Vesak / Poson rotation',
    clericalNotes: ''
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
    if (!formData.phone?.trim()) {
      errs.phone = 'Primary Contact Phone is required';
    } else if (!isValidSriLankanPhone(formData.phone)) {
      errs.phone = 'Please enter a valid 10-digit Sri Lankan phone number (e.g. 071-2345678)';
    }
    if (formData.nic?.trim()) {
      const nicCheck = getNicValidation(formData.nic);
      if (!nicCheck.isValid) {
        errs.nic = nicCheck.message || 'Invalid Sri Lankan National ID (NIC)';
      }
    }
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. devotee@example.com)';
    }
    if (!formData.address?.trim()) {
      errs.address = 'Street Address is required';
    }
    if (formData.status === 'Deactivated') {
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

  // Fetch updated record from PostgreSQL backend API
  useEffect(() => {
    if (!targetId) return;
    familiesApi.getById(targetId)
      .then((res) => {
        if (res.data) {
          const f = res.data;
          const first = f.firstName || f.name?.split(' ')[0] || '';
          const last = f.lastName || f.name?.split(' ').slice(1).join(' ') || '';
          setFormData((prev) => ({
            ...prev,
            id: f.familyCode || f.id || prev.id,
            templeName: f.templeName || prev.templeName,
            templeCode: f.templeCode || prev.templeCode,
            name: f.name || `${first} ${last}`.trim(),
            firstName: first,
            lastName: last,
            nic: f.nic || prev.nic,
            phone: f.phone || prev.phone,
            email: f.email || prev.email,
            address: f.address || prev.address,
            village: f.village || prev.village,
            district: f.district || prev.district,
            postalCode: f.postalCode || prev.postalCode,
            ward: f.ward || prev.ward,
            status: ((f.status as string) || prev.status) as 'Active' | 'Transferred' | 'Deactivated',
            enrollmentMode: f.enrollmentMode || prev.enrollmentMode,
            enrollmentType: (f.enrollmentType || prev.enrollmentType) as 'qr' | 'transfer' | 'manual',
            certificateNumber: f.certificateNumber || prev.certificateNumber,
            members: Array.isArray(f.members) && f.members.length > 0 ? f.members.map((m) => ({
              name: m.name || '',
              role: m.role || 'Member',
              age: Number(m.age) || 25,
              gender: (m.gender || 'Male') as 'Male' | 'Female'
            })) : prev.members,
            deactivateReason: f.deactivateReason || prev.deactivateReason,
            deactivateNotes: f.deactivateNotes || prev.deactivateNotes,
            danaTurnNotes: f.danaTurnNotes || prev.danaTurnNotes,
            clericalNotes: f.clericalNotes || prev.clericalNotes,
          }));
        }
      })
      .catch((err) => {
        console.warn('Backend family fetch fallback to local:', err);
      });
  }, [targetId]);

  const [initialData] = useState(() => initialRecord);

  // Family Members Management
  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: '',
          role: 'Member',
          age: 25,
          gender: 'Male'
        }
      ]
    }));
  };

  const handleMemberChange = (index: number, field: keyof FamilyMember, val: string | number) => {
    setFormData((prev) => {
      const copy = [...prev.members];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, members: copy };
    });
  };

  const handleRemoveMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, idx) => idx !== index)
    }));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCrossTempleRestricted) {
      setNotificationMsg({
        type: 'error',
        title: 'Access Denied',
        desc: 'You do not have administrative permission to modify family records of another temple.'
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

    const updatedFamily = {
      ...formData,
      name: fullFullName
    };

    try {
      // Connect to PostgreSQL Backend API (FR-31, FR-14)
      await familiesApi.update(formData.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        village: formData.village,
        district: formData.district,
        postalCode: formData.postalCode,
        ward: formData.ward,
        status: formData.status,
        danaTurnNotes: formData.danaTurnNotes,
        clericalNotes: formData.clericalNotes,
        members: formData.members.map((m) => ({
          name: m.name,
          role: m.role,
          age: Number(m.age) || null,
          gender: m.gender || 'Male',
        })),
      });

      // Update in-memory session cache without persisting unencrypted sensitive data to localStorage
      saveSessionFamily(updatedFamily);

      setNotificationMsg({
        type: 'success',
        title: 'Family Ledger Record Updated',
        desc: `Parish record for ${updatedFamily.name} (${updatedFamily.id}) updated successfully.`
      });

      setTimeout(() => {
        navigate('/families');
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      setIsSaving(false);
      const msg = err instanceof Error ? err.message : 'Unable to save family record changes. Please try again.';
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
              to="/families"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-sky-900 bg-white hover:bg-sky-50 border border-sky-200 shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Families Directory</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-[12px] text-sky-600">
              <span>/</span>
              <span className="font-medium text-sky-800">Family Ledger</span>
              <span>/</span>
              <span className="font-mono text-[#0284C7] font-bold">{formData.id || targetId}</span>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[13px] text-sky-800 font-medium">Loading family ledger record...</p>
          </div>
        ) : familyNotFound ? (
          <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-red-200 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">family_restroom</span>
            </div>
            <h3 className="text-[18px] font-bold text-gray-900">Family Ledger Record Not Found</h3>
            <p className="text-[12.5px] text-gray-600 mt-1 mb-5">
              Could not find a registered devotee household with ID <span className="font-mono font-bold">{targetId}</span>.
            </p>
            <Link
              to="/families"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              <span>Return to Families Directory</span>
            </Link>
          </div>
        ) : (
          /* Main Page Content */
          <main className="p-5 sm:p-7 max-w-5xl mx-auto w-full space-y-6">

            {/* Hero Header Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0C4A6E] via-[#0369A1] to-[#0C4A6E] text-white p-6 sm:p-7 shadow-xl border border-sky-400/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-10 -translate-y-8 text-sky-200">
                <span className="material-symbols-outlined text-[220px]">family_restroom</span>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#0C4A6E] border-2 border-sky-300 shadow-lg flex items-center justify-center text-[#BAE6FD] font-bold text-2xl flex-shrink-0 ring-4 ring-[#0369A1]/40">
                    <span className="material-symbols-outlined text-[34px]">family_restroom</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30 font-bold">
                        {formData.id}
                      </span>
                      {formData.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/25 border border-emerald-400/40 text-emerald-200">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Active Parish Devotee
                        </span>
                      ) : formData.status === 'Transferred' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/25 border border-blue-400/40 text-blue-200">
                          <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                          Parish Transferred
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/25 border border-rose-400/40 text-rose-200">
                          <span className="material-symbols-outlined text-[13px]">person_off</span>
                          Record Deactivated
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-emerald-200/90 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                        {formData.members?.length || 0} Registered Members
                      </span>
                    </div>

                    <h2 className="text-[22px] sm:text-[25px] font-bold text-white tracking-tight mt-1">
                      {formData.name || `${formData.firstName} ${formData.lastName}`}
                    </h2>
                    <p className="text-[12.5px] text-emerald-100/80 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{formData.address}</span>
                      <span>•</span>
                      <span>{formData.village}</span>
                      <span>•</span>
                      <span className="font-mono text-[#FFE885]">{formData.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <Link
                    to="/families"
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
                    <span>{isSaving ? 'Saving Changes...' : 'Save Family Changes'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Alert */}
            {notificationMsg && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md animate-fade-up ${notificationMsg.type === 'success'
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
            {/* Cross-Temple Access Restriction Alert */}
            {isCrossTempleRestricted && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
                <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">lock</span>
                <div>
                  <h4 className="font-bold text-[14px]">Restricted Cross-Temple Access</h4>
                  <p className="text-[12.5px] text-amber-800 mt-0.5 leading-relaxed">
                    This family record belongs to <strong>{formData.templeName}</strong> ({formData.templeCode}). You are currently logged in under <strong>{temple?.name}</strong>. Only administrators belonging to that temple are authorized to modify this ledger record.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Institution & Ledger ID */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[19px]">badge</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                        {t('families.form.templeDetails', '1. Temple Institution & Ledger ID')}
                      </h3>
                      <p className="text-[11px] text-gray-500">Parish institution credentials and family ledger ID</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                    {formData.enrollmentMode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Family Ledger ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.id}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300 shadow-2xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('families.form.templeName', 'Temple Name')}
                    </label>
                    <input
                      type="text"
                      value={formData.templeName}
                      onChange={(e) => setFormData({ ...formData, templeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('families.form.templeCode', 'Temple Code')}
                    </label>
                    <input
                      type="text"
                      value={formData.templeCode}
                      onChange={(e) => setFormData({ ...formData, templeCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-[#0369A1] font-bold shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Household Head Identity */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">person</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      {t('families.form.householdHead', '2. Household Head & Contact Details')}
                    </h3>
                    <p className="text-[11px] text-gray-500">Primary household head credentials and contact numbers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="firstName">
                      {t('families.form.firstName', 'First Name')} <span className="text-red-500">*</span>
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
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.firstName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
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
                      {t('families.form.lastName', 'Last Name / Family Name')} <span className="text-red-500">*</span>
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
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.lastName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.lastName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="nic">
                      {t('families.form.nic', 'NIC Number')}
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
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs ${fieldErrors.nic ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="phone">
                      {t('families.form.phone', 'Primary Contact Phone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const next = formatSriLankanPhone(e.target.value);
                        setFormData({ ...formData, phone: next });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                    />
                    {fieldErrors.phone ? (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.phone}</span>
                      </p>
                    ) : isValidSriLankanPhone(formData.phone) ? (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Valid Sri Lankan Phone ({formData.phone})</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-1">Auto-formats to 07X-XXXXXXX</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="email">
                      {t('families.form.email', 'Email Address')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="e.g. devotee@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Residential Location & Parish Ward */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">home_pin</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      {t('families.form.residential', '3. Residential Address & Parish Ward')}
                    </h3>
                    <p className="text-[11px] text-gray-500">Residential address, parish ward, and district</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="address">
                      {t('families.form.address', 'Street Address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] border focus:outline-none bg-white text-gray-900 shadow-2xs transition-colors ${fieldErrors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 focus:border-[#0C4A6E]'}`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        <span>{fieldErrors.address}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('families.form.village', 'Village / Parish Ward')}
                    </label>
                    <select
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                    >
                      <option value="Temple Road">Temple Road</option>
                      <option value="Meda Gama">Meda Gama</option>
                      <option value="North Ward">North Ward</option>
                      <option value="Pahala Gama">Pahala Gama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      {t('families.form.district', 'District')}
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Dynamic Family Members Editor */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[19px]">diversity_3</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                        {t('families.form.dependents', '4. Registered Family Members')} ({formData.members.length})
                      </h3>
                      <p className="text-[11px] text-gray-500">Household members and dependents roster</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>{t('families.form.addMember', '+ Add Member')}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.members.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-2xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10.5px] font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={m.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          placeholder="Member Full Name"
                          className="w-full px-3 py-2 rounded-lg text-[13px] border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10.5px] font-semibold text-gray-500 uppercase mb-1">Relationship</label>
                        <input
                          type="text"
                          value={m.role}
                          onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                          placeholder="Spouse, Son, Daughter, etc."
                          className="w-full px-3 py-2 rounded-lg text-[13px] border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-semibold text-gray-500 uppercase mb-1">Age</label>
                        <input
                          type="number"
                          value={m.age}
                          onChange={(e) => handleMemberChange(idx, 'age', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg text-[13px] font-mono border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-semibold text-gray-500 uppercase mb-1">Gender</label>
                        <select
                          value={m.gender}
                          onChange={(e) => handleMemberChange(idx, 'gender', e.target.value as 'Male' | 'Female')}
                          className="w-full px-2.5 py-2 rounded-lg text-[13px] border border-gray-300 bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-[#0C4A6E]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="p-2 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                          title="Remove Member"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.members.length === 0 && (
                    <div className="p-6 text-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50">
                      <p className="text-[12.5px] text-gray-500 mb-2">No individual family members recorded yet.</p>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-[#0284C7] bg-white border border-sky-200 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>+ Add First Member</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Dana Roster Allocation & Parish Status */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A6E]/8 text-[#0C4A6E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">volunteer_activism</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
                      5. Dana Roster &amp; Parish Status
                    </h3>
                    <p className="text-[11px] text-gray-500">Dana roster turn and ledger registration status</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Parish Ledger Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Transferred' | 'Deactivated' })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Dana Roster Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.danaTurnNotes}
                      onChange={(e) => setFormData({ ...formData, danaTurnNotes: e.target.value })}
                      placeholder="e.g. Monthly 15th noon alms"
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                    />
                  </div>

                  {formData.status === 'Deactivated' && (
                    <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50 border border-amber-200/90 space-y-3">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[12px]">
                        <span className="material-symbols-outlined text-[17px] text-amber-700">warning</span>
                        <span>Deactivation Specification</span>
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
                            <option value="Relocated outside parish boundary">
                              Relocated outside parish boundary
                            </option>
                            <option value="Devotee voluntary withdrawal / Household request">
                              Devotee voluntary withdrawal / Household request
                            </option>
                            <option value="Deceased without living successors in household">
                              Deceased without living successors in household
                            </option>
                            <option value="Extended non-attendance / Clergy directive">
                              Extended non-attendance / Clergy directive
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
                            Administrative Notes <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="deactivateNotes"
                            type="text"
                            value={formData.deactivateNotes}
                            onChange={(e) => {
                              setFormData({ ...formData, deactivateNotes: e.target.value });
                              if (fieldErrors.deactivateNotes) setFieldErrors({ ...fieldErrors, deactivateNotes: '' });
                            }}
                            placeholder="e.g. Approved in monthly Dayaka meeting"
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

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Clerical Remarks &amp; Special Directives
                    </label>
                    <textarea
                      rows={2}
                      value={formData.clericalNotes}
                      onChange={(e) => setFormData({ ...formData, clericalNotes: e.target.value })}
                      placeholder="e.g. Household served on Vihara renovation committee; eligible for special Katina Pinkama..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-30 p-4 px-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Link
                    to="/families"
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
                    <span>{isSaving ? t('common.saving', 'Saving Changes...') : t('common.save', 'Save Family Changes')}</span>
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
