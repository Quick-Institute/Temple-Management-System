import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave, { GoldenLotusIcon } from '../../../components/TempleFooterWave.tsx';

export default function AddUserPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form State with user's required fields
  const [formData, setFormData] = useState({
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    committeeName: 'Dayaka Sabhawa',
    customCommitteeName: '',
    designation: 'President',
    customDesignation: '',
    password: '',
    confirmPassword: '',
    nic_id: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  // Permissions State
  const [permissions, setPermissions] = useState({
    perm_family: true,
    perm_dana: true,
    perm_notices: true,
  });

  // Smooth scroll to form section
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Live progress score calculation
  const formProgress = useMemo(() => {
    let score = 1; // Temple Info prefilled
    if (formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.phoneNumber.trim()) score++;
    if (formData.committeeName && formData.designation) score++;
    if (formData.password && formData.password === formData.confirmPassword) score++;
    if (permissions.perm_family || permissions.perm_dana || permissions.perm_notices) score++;
    return score;
  }, [formData, permissions]);

  // Auto-generate strong password
  const handleAutoGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let randomPass = 'Lotus#';
    for (let i = 0; i < 8; i++) {
      randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: randomPass,
      confirmPassword: randomPass
    }));
    setShowPassword(true);
    setShowConfirmPassword(true);
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.password;
      delete copy.confirmPassword;
      return copy;
    });
    setErrorMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = (data = formData): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!data.templeName.trim()) {
      errs.templeName = 'Temple Name is required';
    }
    if (!data.templeCode.trim()) {
      errs.templeCode = 'Temple Code is required';
    }
    if (!data.firstName.trim()) {
      errs.firstName = 'First Name is required';
    }
    if (!data.lastName.trim()) {
      errs.lastName = 'Last Name is required';
    }
    if (!data.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com)';
    }
    if (!data.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone Number is required';
    } else {
      const digits = data.phoneNumber.replace(/[^0-9]/g, '');
      if (digits.length < 9) {
        errs.phoneNumber = 'Please enter a valid phone number (min 9 digits)';
      }
    }
    if (!data.committeeName) {
      errs.committeeName = 'Committee selection is required';
    } else if (data.committeeName === 'Other..' && !data.customCommitteeName.trim()) {
      errs.customCommitteeName = 'Please specify the Committee Name';
    }
    if (!data.designation) {
      errs.designation = 'Designation selection is required';
    } else if (data.designation === 'Other' && !data.customDesignation.trim()) {
      errs.customDesignation = 'Please specify the Designation';
    }
    if (!data.password) {
      errs.password = 'Password is required';
    } else if (data.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!data.confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required';
    } else if (data.password !== data.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const count = Object.keys(errs).length;
      setErrorMessage(`Please fill in all ${count} mandatory fields highlighted below.`);

      const firstField = Object.keys(errs)[0];
      if (['templeName', 'templeCode'].includes(firstField)) {
        scrollToSection('sec-temple');
      } else if (['firstName', 'lastName', 'email', 'phoneNumber'].includes(firstField)) {
        scrollToSection('sec-personal');
      } else if (['committeeName', 'customCommitteeName', 'designation', 'customDesignation'].includes(firstField)) {
        scrollToSection('sec-committee');
      } else if (['password', 'confirmPassword'].includes(firstField)) {
        scrollToSection('sec-password');
      }

      setTimeout(() => {
        const el = document.getElementById(firstField);
        if (el) el.focus();
      }, 250);
      return;
    }

    const effectiveCommittee = formData.committeeName === 'Other..'
      ? formData.customCommitteeName.trim()
      : formData.committeeName;

    const effectiveDesignation = formData.designation === 'Other'
      ? formData.customDesignation.trim()
      : formData.designation;

    const initials = `${(formData.firstName[0] || '').toUpperCase()}${(formData.lastName[0] || '').toUpperCase()}` || 'U';

    const newUser = {
      id: Date.now(),
      templeName: formData.templeName,
      templeCode: formData.templeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phoneNumber,
      committeeName: effectiveCommittee,
      designation: effectiveDesignation,
      role: 'committee',
      roleDisplay: effectiveDesignation,
      roleSubtitle: `${effectiveCommittee} • ${formData.templeName}`,
      nic: formData.nic_id || 'Verified NIC (SL)',
      status: 'active',
      avatar: initials,
      avatarBg: '#D4F0DC',
      avatarColor: '#1E412D',
      isPermanent: false
    };

    // Save to localStorage so UsersRolesPage immediately picks it up
    try {
      const existing = JSON.parse(localStorage.getItem('temple_registered_users') || '[]');
      localStorage.setItem('temple_registered_users', JSON.stringify([newUser, ...existing]));

      // Record into immutable audit logs
      const auditRecord = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        adminName: 'Nimal Perera',
        adminRole: 'Co-Administrator',
        targetType: 'User',
        targetName: newUser.name,
        targetId: `USR-${newUser.id}`,
        action: 'Created',
        reason: `New official onboarding (${effectiveDesignation} - ${effectiveCommittee})`,
        statusBadge: 'active'
      };
      const auditExisting = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
      localStorage.setItem('temple_audit_logs', JSON.stringify([auditRecord, ...auditExisting]));
    } catch (err) {
      console.error('Storage error:', err);
    }

    setNotificationMsg(`User "${newUser.name}" (${effectiveDesignation} - ${effectiveCommittee}) registered successfully!`);
    setTimeout(() => {
      navigate('/users-roles');
    }, 1200);
  };

  const handleSaveDraft = () => {
    setNotificationMsg('User registration draft saved successfully.');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const committeeOptions = [
    'Dayaka Sabhawa',
    'Event or Programme Committee',
    'Other..'
  ];

  const designationOptions = [
    'President',
    'Vice-President',
    'Secretary',
    'Assistant Secretary',
    'Treasurer',
    'Committee Member',
    'Other'
  ];

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

        {/* Add User Main Form Container (Uniform max-w-[1260px] layout matching AddFamilyPage) */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1260px] w-full mx-auto">

          {/* Notification / Error Alerts */}
          {notificationMsg && (
            <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#166534] text-[#166534] text-sm font-semibold flex items-center gap-2 animate-fade-up shadow-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="flex-1">{notificationMsg}</span>
              <button
                type="button"
                onClick={() => setNotificationMsg(null)}
                className="p-1 rounded-lg hover:bg-[#166534]/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#991B1B] text-[#991B1B] text-sm font-semibold flex items-center gap-2 animate-fade-up shadow-sm">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="p-1 rounded-lg hover:bg-[#991B1B]/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP SACRED PANORAMIC IMAGE HERO BANNER                   */}
          {/* ======================================================== */}
          <section className="relative overflow-hidden rounded-2xl border border-[#BAE6FD] shadow-[0_4px_20px_rgba(2,132,199,0.08)] bg-gradient-to-r from-[#D0E8F9] via-[#E4F2FD] to-[#D5EDFD] min-h-[160px] sm:min-h-[185px] flex items-center justify-between px-5 sm:px-8 lg:px-9 py-5 sm:py-6 select-text animate-fade-up">
            {/* Stupa Panoramic Image on right seamlessly fading into sky blue */}
            <div className="absolute right-0 top-0 bottom-0 w-[48%] pointer-events-none select-none overflow-hidden">
              <img
                src="/kataragama_stupa.jpg"
                alt="Sacred Stupa"
                className="w-full h-full object-cover object-right"
                style={{
                  maskImage: 'linear-gradient(to left, black 40%, rgba(0,0,0,0.6) 65%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to left, black 40%, rgba(0,0,0,0.6) 65%, transparent 95%)'
                }}
              />
            </div>

            {/* Subtle Sacred Bodhi Leaf Watermark in background */}
            <div className="absolute left-[36%] sm:left-[39%] top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-20 text-sky-500">
              <svg className="w-40 sm:w-56 h-40 sm:h-56" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 8 C62 26 84 45 80 70 C76 88 56 94 50 84 C44 94 24 88 20 70 C16 45 38 26 50 8 Z" opacity="0.6" />
                <path d="M50 15 L50 80 M50 35 C60 40 70 50 72 60 M50 45 C40 50 30 60 28 60 M50 55 C60 60 68 70 66 75 M50 65 C40 70 32 75 34 78" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              </svg>
            </div>

            {/* Left Content Column */}
            <div className="relative z-10 flex flex-col max-w-xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link
                  to="/users-roles"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all hover:bg-white bg-white/80 text-sky-900 border border-sky-300 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Back to Users &amp; Roles</span>
                </Link>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#BAE6FD]/70 text-[#0369A1] border border-sky-300/60 shadow-2xs">
                  Temple Admin
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  Audit Trail
                </span>
              </div>

              <span className="text-[12px] sm:text-[13px] font-medium text-sky-800 leading-none mb-1">
                Register New Member / User,
              </span>
              <h1 className="font-serif text-[22px] sm:text-[27px] font-bold text-[#0C4A6E] tracking-tight leading-tight">
                Sri Sambodhi Maha Viharaya!
              </h1>
              <div className="flex items-center gap-2 mt-1.5 mb-2 flex-wrap">
                <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0C4A6E]">
                  <span className="material-symbols-outlined text-[15px] text-[#0284C7]">location_on</span>
                  <span>Kadokkele, Gampaha</span>
                </div>
              </div>
              <p className="text-[12px] sm:text-[13px] text-sky-900/80 font-normal leading-relaxed">
                Together we preserve our heritage and serve the community.
              </p>
            </div>

            {/* Center Sacred Verse */}
            <div className="relative z-10 hidden sm:flex flex-col items-center justify-center text-center px-4 max-w-[280px] mx-auto flex-shrink-0 select-text">
              <div className="mb-1 text-[#0284C7]">
                <GoldenLotusIcon className="w-8 h-7 text-[#0284C7]" />
              </div>
              <p className="font-serif italic font-normal text-[13.5px] sm:text-[14.5px] text-[#0C4A6E] leading-snug">
                “May all beings be happy,<br />healthy and at peace.”
              </p>
            </div>

            {/* Right Spacer to preserve the visual space for the White Stupa */}
            <div className="hidden lg:block w-[28%] xl:w-[32%] flex-shrink-0 pointer-events-none" aria-hidden="true" />
          </section>

          {/* ======================================================== */}
          {/* CREATIVE 5-STEP JOURNEY STRIP WITH THEMED COLOR ACCENTS  */}
          {/* ======================================================== */}
          <div className="card p-3.5 sm:p-4 border border-[#E2E8F0] shadow-xs bg-white animate-fade-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">

              {/* Step 1: Sky Blue */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-temple')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-sky-50 text-left border border-transparent hover:border-sky-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100 text-[#0284C7] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">temple_buddhist</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#0284C7]">Step 1</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">{t('users.step.temple', 'Temple Details')}</div>
                </div>
              </button>

              {/* Step 2: Emerald Green */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-personal')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-sky-50 text-left border border-transparent hover:border-sky-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-[#059669] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">person</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#059669]">Step 2</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">{t('users.step.personal', 'Personal Info')}</div>
                </div>
              </button>

              {/* Step 3: Warm Amber */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-committee')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-amber-50 text-left border border-transparent hover:border-amber-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-[#D97706] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">diversity_3</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#D97706]">Step 3</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">{t('users.step.committee', 'Committee & Role')}</div>
                </div>
              </button>

              {/* Step 4: Royal Indigo */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-password')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-indigo-50 text-left border border-transparent hover:border-indigo-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-[#4F46E5] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">lock</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#4F46E5]">Step 4</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">{t('users.step.password', 'Password')}</div>
                </div>
              </button>

              {/* Step 5: Purple Violet */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-permissions')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-purple-50 text-left border border-transparent hover:border-purple-200 group col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-[#7E22CE] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#7E22CE] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">verified_user</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#7E22CE]">Step 5</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">{t('users.step.permissions', 'Permissions')}</div>
                </div>
              </button>

            </div>

            {/* Live Progress Bar */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-semibold text-[#0C4A6E]">Form Completion:</span>
                <span>{formProgress} of 5 sections complete</span>
              </div>
              <div className="w-36 sm:w-48 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#38BDF8] via-[#059669] to-[#0C4A6E] transition-all duration-500 rounded-full"
                  style={{ width: `${(formProgress / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MAIN ORDERLY REGISTRATION CARD                           */}
          {/* ======================================================== */}
          <div className="card overflow-hidden animate-fade-up border border-sky-100 shadow-md bg-white">
            {/* Decorative Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0369A1]"></div>

            {/* Card Header Strip */}
            <div className="p-6 md:p-8 flex items-start gap-5 border-b bg-[#F0F9FF] border-sky-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white text-[#0284C7] border-2 border-sky-300">
                <span className="material-symbols-outlined text-[26px]">person_add</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sky-700">Institutional Official Ledger</span>
                  <span className="text-[10px] text-sky-300">•</span>
                  <span className="text-[10px] font-mono text-sky-700 font-semibold">Form ID: ADM-2026-USR</span>
                </div>
                <h2 className="text-[17px] sm:text-[19px] font-bold leading-tight text-[#0C4A6E]">
                  Member Registration Form
                </h2>
                <p className="text-[13px] mt-1 text-sky-800/80">
                  Complete temple details, committee assignments, personal contact information, security password, and access permissions.
                </p>
              </div>
            </div>

            {/* Registration Form with Vertical Sequential Flow */}
            <form noValidate onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

              {/* ============ SECTION 1: TEMPLE DETAILS (SKY BLUE THEME) ============ */}
              <div id="sec-temple">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-sky-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100 text-[#0284C7] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">temple_buddhist</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('users.sec.temple', '1. Temple Details')}</span>

                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                    Institutional Seal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Temple Name */}
                  <div>
                    <label className="form-label" htmlFor="templeName">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">temple_buddhist</span>
                      <span>{t('users.form.templeName', 'Temple Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-medium ${fieldErrors.templeName ? 'has-error' : ''}`}
                        id="templeName"
                        name="templeName"
                        value={formData.templeName}
                        onChange={handleChange}
                        placeholder="e.g., Sri Sambodhi Maha Viharaya"
                        type="text"
                      />
                    </div>
                    {fieldErrors.templeName ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.templeName}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Official registered name of the Viharaya</p>
                    )}
                  </div>

                  {/* Temple Code */}
                  <div>
                    <label className="form-label" htmlFor="templeCode">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">tag</span>
                      <span>{t('users.form.templeCode', 'Temple Code')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-mono font-semibold ${fieldErrors.templeCode ? 'has-error' : ''}`}
                        id="templeCode"
                        name="templeCode"
                        value={formData.templeCode}
                        onChange={handleChange}
                        placeholder="e.g., TPL-2026-0482"
                        type="text"
                      />
                    </div>
                    {fieldErrors.templeCode ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.templeCode}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Unique institutional identification code</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ============ SECTION 2: PERSONAL & CONTACT INFORMATION (EMERALD GREEN THEME) ============ */}
              <div id="sec-personal">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-emerald-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-[#059669] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">person</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('users.sec.personal', '2. Personal & Contact Details')}</span>

                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* First Name */}
                  <div>
                    <label className="form-label" htmlFor="firstName">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">person</span>
                      <span>{t('users.form.firstName', 'First Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.firstName ? 'has-error' : ''}`}
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="e.g., Sunil"
                        type="text"
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.firstName}</span>
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="form-label" htmlFor="lastName">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">badge</span>
                      <span>{t('users.form.lastName', 'Last Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.lastName ? 'has-error' : ''}`}
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="e.g., Jayawardena"
                        type="text"
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.lastName}</span>
                      </p>
                    )}
                  </div>

                  {/* National ID (NIC) */}
                  <div>
                    <label className="form-label" htmlFor="nic_id">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">credit_card</span>
                      <span>{t('users.form.nic', 'National ID (NIC)')}</span>
                    </label>
                    <div className="relative group">
                      <input
                        className="form-input font-mono uppercase"
                        id="nic_id"
                        name="nic_id"
                        value={formData.nic_id}
                        onChange={handleChange}
                        placeholder="e.g., 197521400120 or 752140120V"
                        type="text"
                      />
                    </div>
                    <p className="form-hint">Official identification verification for temple register</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="form-label" htmlFor="phoneNumber">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">phone</span>
                      <span>{t('users.form.phone', 'Phone Number')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-mono font-semibold ${fieldErrors.phoneNumber ? 'has-error' : ''}`}
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+94 77 123 4567"
                        type="tel"
                      />
                    </div>
                    {fieldErrors.phoneNumber ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.phoneNumber}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Used for SMS alerts and WhatsApp notices</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="md:col-span-2">
                    <label className="form-label" htmlFor="email">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">alternate_email</span>
                      <span>{t('users.form.email', 'Email Address')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., sunil.j@gmail.com"
                        type="email"
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.email}</span>
                      </p>
                    ) : (
                      <p className="form-hint">For credential dispatch and ledger notifications</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ============ SECTION 3: COMMITTEE & DESIGNATION (WARM AMBER THEME) ============ */}
              <div id="sec-committee">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-amber-100 bg-gradient-to-r from-amber-50/70 via-amber-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-[#D97706] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">groups</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('users.sec.committee', '3. Committee Assignment & Designation')}</span>

                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Governance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Committee Name */}
                  <div>
                    <label className="form-label" htmlFor="committeeName">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">diversity_3</span>
                      <span>{t('users.form.committeeName', 'Committee Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        className={`form-input appearance-none pr-10 cursor-pointer font-medium ${fieldErrors.committeeName ? 'has-error' : ''}`}
                        id="committeeName"
                        name="committeeName"
                        value={formData.committeeName}
                        onChange={handleChange}
                      >
                        {committeeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] text-[#64748B]">
                        expand_more
                      </span>
                    </div>
                    {fieldErrors.committeeName ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.committeeName}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Select parish committee assignment</p>
                    )}

                    {/* Custom Committee Name (If 'Other..' selected) */}
                    {formData.committeeName === 'Other..' && (
                      <div className="mt-3">
                        <label className="form-label text-[11px] text-[#0284C7]" htmlFor="customCommitteeName">
                          Specify Other Committee Name <span className="text-[#8C2F2F] font-bold">*</span>
                        </label>
                        <input
                          className={`form-input text-sm ${fieldErrors.customCommitteeName ? 'has-error' : ''}`}
                          id="customCommitteeName"
                          name="customCommitteeName"
                          value={formData.customCommitteeName}
                          onChange={handleChange}
                          placeholder="e.g., Temple Renovation Trust"
                          type="text"
                        />
                        {fieldErrors.customCommitteeName && (
                          <p className="form-error-msg">
                            <span className="material-symbols-outlined text-[15px]">error</span>
                            <span>{fieldErrors.customCommitteeName}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="form-label" htmlFor="designation">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">military_tech</span>
                      <span>{t('users.form.designation', 'Designation')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        className={`form-input appearance-none pr-10 cursor-pointer font-medium ${fieldErrors.designation ? 'has-error' : ''}`}
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                      >
                        {designationOptions.map((desig) => (
                          <option key={desig} value={desig}>
                            {desig}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] text-[#64748B]">
                        expand_more
                      </span>
                    </div>
                    {fieldErrors.designation ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.designation}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Official executive rank or board membership</p>
                    )}

                    {/* Custom Designation (If 'Other' selected) */}
                    {formData.designation === 'Other' && (
                      <div className="mt-3">
                        <label className="form-label text-[11px] text-[#0284C7]" htmlFor="customDesignation">
                          Specify Other Designation <span className="text-[#8C2F2F] font-bold">*</span>
                        </label>
                        <input
                          className={`form-input text-sm ${fieldErrors.customDesignation ? 'has-error' : ''}`}
                          id="customDesignation"
                          name="customDesignation"
                          value={formData.customDesignation}
                          onChange={handleChange}
                          placeholder="e.g., Senior Legal Advisor"
                          type="text"
                        />
                        {fieldErrors.customDesignation && (
                          <p className="form-error-msg">
                            <span className="material-symbols-outlined text-[15px]">error</span>
                            <span>{fieldErrors.customDesignation}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ============ SECTION 4: SECURITY PASSWORD (ROYAL INDIGO THEME) ============ */}
              <div id="sec-password">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-2.5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-indigo-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-[#4F46E5] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">lock</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F172A] flex flex-wrap items-center gap-1.5 leading-snug">
                      <span>{t('users.sec.password', '4. Security Password')}</span>

                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="self-start sm:self-auto text-[11.5px] font-semibold text-indigo-700 bg-white sm:bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg sm:rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_mode</span>
                    <span>{t('users.form.autoGen', 'Auto-generate Password')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Password */}
                  <div>
                    <label className="form-label" htmlFor="password">
                      <span className="material-symbols-outlined text-[16px] text-indigo-600">lock</span>
                      <span>{t('users.form.password', 'Password')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input pr-12 font-mono ${fieldErrors.password ? 'has-error' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter secure password"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors hover:text-[#0C4A6E] text-[#64748B]"
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.password}</span>
                      </p>
                    ) : (
                      <p className="form-hint">At least 8 characters with numbers &amp; symbols</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="form-label" htmlFor="confirmPassword">
                      <span className="material-symbols-outlined text-[16px] text-indigo-600">lock_clock</span>
                      <span>{t('users.form.confirmPassword', 'Confirm Password')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input pr-12 font-mono ${fieldErrors.confirmPassword || (formData.confirmPassword && formData.password !== formData.confirmPassword)
                            ? 'has-error'
                            : ''
                          }`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle confirm password visibility"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors hover:text-[#0C4A6E] text-[#64748B]"
                      >
                        <span className="material-symbols-outlined">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {fieldErrors.confirmPassword ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.confirmPassword}</span>
                      </p>
                    ) : formData.confirmPassword ? (
                      <p className={`form-hint flex items-center gap-1 ${formData.password === formData.confirmPassword ? 'text-[#166534]' : 'text-[#991B1B]'
                        }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {formData.password === formData.confirmPassword ? 'check_circle' : 'cancel'}
                        </span>
                        {formData.password === formData.confirmPassword
                          ? 'Passwords match'
                          : 'Passwords do not match'}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ============ SECTION 5: PERMISSIONS (PURPLE VIOLET THEME) ============ */}
              <div id="sec-permissions">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-purple-100 bg-gradient-to-r from-purple-50/70 via-purple-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-[#7E22CE] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">verified_user</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('users.sec.permissions', '5. Permitted Module Actions')}</span>

                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                    System Authorization
                  </span>
                </div>

                <div className="space-y-3.5">
                  <label className="flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all hover:border-[#7E22CE] select-none bg-gradient-to-r from-purple-50/25 via-white to-purple-50/10 border-2 border-purple-200 shadow-2xs">
                    <input
                      type="checkbox"
                      name="perm_family"
                      checked={permissions.perm_family}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#7E22CE]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13.5px] font-bold block leading-tight text-[#0F172A]">
                        Manage Dayaka Family Accounts &amp; Registry
                      </span>
                      <span className="text-[12px] block mt-1 text-[#64748B]">
                        Permits registering households, updating contacts, and monitoring parish transfers.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                      Active
                    </span>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all hover:border-[#7E22CE] select-none bg-gradient-to-r from-purple-50/25 via-white to-purple-50/10 border-2 border-purple-200 shadow-2xs">
                    <input
                      type="checkbox"
                      name="perm_dana"
                      checked={permissions.perm_dana}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#7E22CE]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13.5px] font-bold block leading-tight text-[#0F172A]">
                        Schedule Dana almsgiving slots &amp; Poya Ceremonies
                      </span>
                      <span className="text-[12px] block mt-1 text-[#64748B]">
                        Assign morning (Heel) &amp; midday (Dawal) alms and religious program bookings.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                      Active
                    </span>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all hover:border-[#7E22CE] select-none bg-gradient-to-r from-purple-50/25 via-white to-purple-50/10 border-2 border-purple-200 shadow-2xs">
                    <input
                      type="checkbox"
                      name="perm_notices"
                      checked={permissions.perm_notices}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#7E22CE]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13.5px] font-bold block leading-tight text-[#0F172A]">
                        Broadcast parish notices via SMS &amp; WhatsApp
                      </span>
                      <span className="text-[12px] block mt-1 text-[#64748B]">
                        Post community circulars, Dhamma school updates, and festival announcements.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              {/* Mandatory Fields Error Summary Banner */}
              {Object.keys(fieldErrors).length > 0 && (
                <div className="p-4 rounded-2xl bg-red-50/95 border-2 border-red-300 shadow-sm animate-fade-up">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] text-red-600 flex-shrink-0 mt-0.5">error</span>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-red-950">
                        Mandatory Fields Missing ({Object.keys(fieldErrors).length} fields required)
                      </h4>
                      <p className="text-[12.5px] text-red-800 mt-0.5 leading-relaxed">
                        Please complete all highlighted mandatory fields above before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions Footer with Responsive, Compact & Elegant Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-5 sm:pt-7 border-t border-slate-200 gap-3">
                <Link
                  to="/users-roles"
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all hover:bg-slate-100 bg-white text-slate-700 border border-slate-300 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[17px]">close</span>
                  <span>{t('users.form.cancel', 'Cancel')}</span>
                </Link>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto py-2.5 px-4 sm:px-5 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all hover:bg-slate-50 bg-white border border-slate-300 text-[#0F172A] flex items-center justify-center gap-2 shadow-2xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0284C7] shrink-0">bookmark_border</span>
                    <span>{t('users.form.saveDraft', 'Save Draft')}</span>
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-2.5 px-5 sm:px-6 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold inline-flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white active:scale-95 shadow-md shadow-sky-600/25 transition-all cursor-pointer border border-sky-400/50 text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[19px] shrink-0">how_to_reg</span>
                    <span>{t('users.form.submit', 'Register Official')}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Audit Footnote */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-2 text-[11px] gap-2 text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#0C4A6E]">history_edu</span>
              <span>Every user creation is permanently timestamped in the Temple Immutable Audit Vault.</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#CBD5E1] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#166534] inline-block"></span>
              <span className="font-semibold text-[#0F172A]">AES-256 Encrypted</span>
            </div>
          </div>

        </main>

        {/* Bottom Flowing Wave Silhouette with Floating Badge */}
        <TempleFooterWave />

      </div>

    </div>
  );
}
