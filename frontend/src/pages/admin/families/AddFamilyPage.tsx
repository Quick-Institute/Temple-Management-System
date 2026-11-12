import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave, { GoldenLotusIcon } from '../../../components/TempleFooterWave.tsx';
import { SRI_LANKA_DISTRICTS, INITIAL_FAMILIES, KNOWN_DEVOTEES_REGISTRY } from '../../../data/seed';

interface FamilyMemberInput {
  id: number;
  fullName: string;
  relationship: string;
  age: string;
  gender: 'Male' | 'Female';
}

export default function AddFamilyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form State
  const [formData, setFormData] = useState({
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: '',
    lastName: '',
    nic: '',
    email: '',
    phone: '',
    address: '',
    village: 'Temple Road',
    district: 'Hambantota',
    postalCode: '82200',
    password: '',
    confirmPassword: '',
    clericalNotes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notificationMsg, setNotificationMsg] = useState('');
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  // Dynamic Family Members State
  const [members, setMembers] = useState<FamilyMemberInput[]>([]);

  // Real-time Duplicate Account Detection
  const duplicateMatch = (() => {
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    const cleanNic = formData.nic.trim().toLowerCase();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanPhone && !cleanNic && !cleanEmail) return null;

    // 1. Check against KNOWN_DEVOTEES_REGISTRY (inter-temple database)
    for (const dev of KNOWN_DEVOTEES_REGISTRY) {
      if (cleanNic && cleanNic.length >= 8 && dev.nic.toLowerCase() === cleanNic) {
        return { ...dev, matchType: 'NIC Number' };
      }
      if (cleanPhone && cleanPhone.length >= 7 && (dev.cleanPhone.includes(cleanPhone) || cleanPhone.includes(dev.cleanPhone))) {
        return { ...dev, matchType: 'Mobile Phone Number' };
      }
    }

    // 2. Check against local database & existing families
    try {
      const saved = JSON.parse(localStorage.getItem('temple_registered_families') || '[]');
      const allFamilies = [...saved, ...INITIAL_FAMILIES];
      for (const fam of allFamilies) {
        const famPhoneClean = fam.phone ? fam.phone.replace(/[^0-9]/g, '') : '';
        if (cleanPhone && cleanPhone.length >= 7 && (famPhoneClean.includes(cleanPhone) || cleanPhone.includes(famPhoneClean))) {
          return {
            name: fam.name,
            nic: 'Registered Household NIC',
            phone: fam.phone,
            cleanPhone: famPhoneClean,
            familyId: fam.id,
            templeName: fam.templeName,
            village: fam.village,
            matchType: 'Phone Number'
          };
        }
        if (cleanEmail && fam.email && fam.email.toLowerCase() === cleanEmail) {
          return {
            name: fam.name,
            nic: 'Registered Email',
            phone: fam.phone,
            cleanPhone: famPhoneClean,
            familyId: fam.id,
            templeName: fam.templeName,
            village: fam.village,
            matchType: 'Email Address'
          };
        }
      }
    } catch {
      // ignore parse errors
    }

    return null;
  })();

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Completion calculation for live progress indicator
  const formProgress = useMemo(() => {
    let score = 1; // Temple info prefilled
    if (formData.firstName.trim() && formData.lastName.trim() && formData.phone.trim() && formData.email.trim()) score++;
    if (formData.address.trim() && formData.village.trim() && formData.district.trim()) score++;
    if (formData.password && formData.password === formData.confirmPassword) score++;
    if (members.length > 0) score++;
    return score;
  }, [formData, members]);

  // Auto-generate strong password
  const handleAutoGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let randomPass = 'Dayaka#';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        fullName: '',
        relationship: 'Spouse',
        age: '28',
        gender: 'Male'
      }
    ]);
  };

  const handleRemoveMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: number, field: keyof FamilyMemberInput, value: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveDraft = () => {
    setNotificationMsg('Dayaka family registration draft saved successfully.');
    setTimeout(() => setNotificationMsg(''), 4000);
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
    if (!data.phone.trim()) {
      errs.phone = 'Mobile Phone Number is required';
    } else {
      const digits = data.phone.replace(/[^0-9]/g, '');
      if (digits.length < 9) {
        errs.phone = 'Please enter a valid phone number (min 9 digits)';
      }
    }
    if (!data.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com)';
    }
    if (!data.address.trim()) {
      errs.address = 'Street Address is required';
    }
    if (!data.village.trim()) {
      errs.village = 'Village / Ward is required';
    }
    if (!data.district.trim()) {
      errs.district = 'District selection is required';
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
      setErrorMessage(`Please fill in all ${count} mandatory fields highlighted in red below.`);

      const firstField = Object.keys(errs)[0];
      if (['templeName', 'templeCode'].includes(firstField)) {
        scrollToSection('sec-temple');
      } else if (['firstName', 'lastName', 'phone', 'email'].includes(firstField)) {
        scrollToSection('sec-head');
      } else if (['address', 'village', 'district'].includes(firstField)) {
        scrollToSection('sec-location');
      } else if (['password', 'confirmPassword'].includes(firstField)) {
        scrollToSection('sec-credentials');
      }

      setTimeout(() => {
        const el = document.getElementById(firstField);
        if (el) el.focus();
      }, 250);
      return;
    }

    // Prevent accidental creation of duplicate devotee accounts
    if (duplicateMatch && !duplicateAcknowledged) {
      setErrorMessage(`Duplicate Devotee Account Detected (${duplicateMatch.matchType} matches "${duplicateMatch.name}"). Please review warning or approve Clergy Exception.`);
      scrollToSection('sec-head');
      return;
    }

    setIsSubmitting(true);
    const generatedFamilyId = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const familyHeadName = `${formData.firstName} ${formData.lastName}`.trim();

    const newFamilyRecord = {
      key: `fam-${Date.now()}`,
      id: generatedFamilyId,
      templeName: formData.templeName,
      templeCode: formData.templeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: familyHeadName,
      alias: `Household of ${familyHeadName}`,
      nic: formData.nic || 'Verified NIC (SL)',
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      village: formData.village,
      district: formData.district,
      postalCode: formData.postalCode,
      ward: formData.village.toLowerCase().includes('north') ? 'north-ward' : 'temple-road',
      status: 'Active',
      enrollmentMode: 'Admin-Assisted Clergy Registration',
      enrollmentType: 'manual',
      clericalNotes: formData.clericalNotes || '',
      members: members.length > 0 ? members.map(m => ({
        name: m.fullName || 'Household Member',
        role: m.relationship || 'Dependent',
        age: Number(m.age) || 25,
        gender: m.gender || 'Male'
      })) : [
        { name: familyHeadName, role: 'Head of Household', age: 45, gender: 'Male' }
      ]
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('temple_registered_families') || '[]');
      localStorage.setItem('temple_registered_families', JSON.stringify([newFamilyRecord, ...existing]));

      // Log into immutable audit logs
      const auditRecord = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        adminName: 'Nimal Perera',
        adminRole: 'Co-Administrator',
        targetType: 'Family',
        targetName: familyHeadName,
        targetId: generatedFamilyId,
        action: 'Created',
        reason: `New Dayaka family enrollment (${formData.village}) - ${members.length} dependents`,
        statusBadge: 'active'
      };
      const auditExisting = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
      localStorage.setItem('temple_audit_logs', JSON.stringify([auditRecord, ...auditExisting]));
    } catch (err) {
      console.error('Storage error:', err);
    }

    setNotificationMsg(`Family "${familyHeadName}" (${generatedFamilyId}) registered successfully!`);
    setTimeout(() => {
      navigate('/families');
    }, 1200);
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

        {/* Add Family Page Main Container (Spacious max-w-[1260px] layout) */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-[1260px] w-full mx-auto">

          {/* Toast Notification Alert */}
          {notificationMsg && (
            <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#166534] text-[#166534] text-sm font-semibold flex items-center gap-2 animate-fade-up shadow-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="flex-1">{notificationMsg}</span>
              <button
                type="button"
                onClick={() => setNotificationMsg('')}
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
                  to="/families"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all hover:bg-white bg-white/80 text-sky-900 border border-sky-300 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Back to Registry</span>
                </Link>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#BAE6FD]/70 text-[#0369A1] border border-sky-300/60 shadow-2xs">
                  Temple Admin
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  Duplicate Shield
                </span>
              </div>

              <span className="text-[12px] sm:text-[13px] font-medium text-sky-800 leading-none mb-1">
                Register New Dayaka Family,
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

              {/* Step 1: Sky Blue Accent */}
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
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">Temple Details</div>
                </div>
              </button>

              {/* Step 2: Emerald Green Accent */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-head')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-sky-50 text-left border border-transparent hover:border-sky-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-[#059669] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">person</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#059669]">Step 2</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">Household Head</div>
                </div>
              </button>

              {/* Step 3: Warm Amber Accent */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-location')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-amber-50 text-left border border-transparent hover:border-amber-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-[#D97706] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">home_pin</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#D97706]">Step 3</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">Ward &amp; Address</div>
                </div>
              </button>

              {/* Step 4: Royal Indigo Accent */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-credentials')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-indigo-50 text-left border border-transparent hover:border-indigo-200 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-[#4F46E5] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">lock</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#4F46E5]">Step 4</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">Portal Access</div>
                </div>
              </button>

              {/* Step 5: Purple Violet Accent */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-members')}
                className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-purple-50 text-left border border-transparent hover:border-purple-200 group col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-[#7E22CE] font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#7E22CE] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[17px]">diversity_3</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#7E22CE]">Step 5</div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">
                    {members.length > 0 ? `${members.length} Members` : 'Dependents'}
                  </div>
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
          <div className="card overflow-hidden animate-fade-up border border-[#BAE6FD] shadow-md bg-white">
            {/* Decorative Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0C4A6E] via-[#0284C7] to-[#0EA5E9]"></div>

            {/* Card Header Strip */}
            <div className="p-6 md:p-8 flex items-start gap-5 border-b bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 border-[#BAE6FD]">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-sky-100 text-[#0284C7] border-2 border-sky-200">
                <span className="material-symbols-outlined text-[26px]">group_add</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#0284C7]">Institutional Dayaka Ledger</span>
                  <span className="text-[10px] text-sky-200">•</span>
                  <span className="text-[10px] font-mono text-sky-700 font-semibold">Form ID: FAM-2026-REG</span>
                </div>
                <h2 className="text-[17px] sm:text-[19px] font-bold leading-tight text-[#0C4A6E]">
                  Dayaka Family Registration Form
                </h2>
                <p className="text-[13px] mt-1 text-sky-700/80">
                  Complete temple affiliation, primary household head credentials, residential ward, security access, and family dependents.
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
                      <span>{t('families.form.templeDetails', '1. Temple Affiliation & Parish Ledger')}</span>
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                    Parish Seal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Temple Name */}
                  <div>
                    <label className="form-label" htmlFor="templeName">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">temple_buddhist</span>
                      <span>{t('families.form.templeName', 'Temple Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-medium ${fieldErrors.templeName ? 'has-error' : ''}`}
                        id="templeName"
                        name="templeName"
                        value={formData.templeName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sri Sambodhi Maha Viharaya"
                        type="text"
                      />
                    </div>
                    {fieldErrors.templeName ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.templeName}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Official parish temple in the Hambantota Sasana division</p>
                    )}
                  </div>

                  {/* Temple Code */}
                  <div>
                    <label className="form-label" htmlFor="templeCode">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">tag</span>
                      <span>{t('families.form.templeCode', 'Temple Code')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-mono font-semibold ${fieldErrors.templeCode ? 'has-error' : ''}`}
                        id="templeCode"
                        name="templeCode"
                        value={formData.templeCode}
                        onChange={handleInputChange}
                        placeholder="e.g. TPL-2026-0482"
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

              {/* ============ SECTION 2: HOUSEHOLD HEAD & CONTACT (EMERALD GREEN THEME) ============ */}
              <div id="sec-head">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-emerald-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-[#059669] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">person</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('families.form.householdHead', '2. Devotee Household Head & Contact')}</span>
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto text-[10.5px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 sm:py-1 rounded-full border border-[#86EFAC]">
                    Live Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* First Name */}
                  <div>
                    <label className="form-label" htmlFor="firstName">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">person</span>
                      <span>{t('families.form.firstName', 'First Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.firstName ? 'has-error' : ''}`}
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
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
                      <span>{t('families.form.lastName', 'Last Name')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.lastName ? 'has-error' : ''}`}
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
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
                    <label className="form-label" htmlFor="nic">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">credit_card</span>
                      <span>{t('families.form.nic', 'National ID (NIC)')}</span>
                    </label>
                    <div className="relative group">
                      <input
                        className="form-input font-mono uppercase"
                        id="nic"
                        name="nic"
                        value={formData.nic}
                        onChange={handleInputChange}
                        placeholder="e.g., 197214500210 or 721450210V"
                        type="text"
                      />
                    </div>
                    <p className="form-hint">12-digit new format or 9-digit + V old format</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="form-label" htmlFor="phone">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">phone</span>
                      <span>{t('families.form.phone', 'Mobile Phone Number')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input font-mono font-semibold ${fieldErrors.phone ? 'has-error' : ''}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+94 77 123 4567"
                        type="tel"
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.phone}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Used for SMS alerts and Dana turn notices</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="md:col-span-2">
                    <label className="form-label" htmlFor="email">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">alternate_email</span>
                      <span>{t('families.form.email', 'Email Address')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
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
                      <p className="form-hint">For credential dispatch and digital merit certificates </p>
                    )}
                  </div>
                </div>

                {/* Real-Time Duplicate Account Warning Banner */}
                {duplicateMatch && (
                  <div className="mt-5 p-4.5 rounded-2xl bg-amber-50/95 border-2 border-amber-300 shadow-sm animate-fade-up">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[22px]">warning</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[13.5px] font-bold text-amber-950">
                            Duplicate Devotee Account Detected
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                            Active Protection
                          </span>
                        </div>
                        <p className="text-[12.5px] text-amber-900 mt-1 leading-relaxed">
                          This <strong>{duplicateMatch.matchType}</strong> is already registered under devotee <strong>"{duplicateMatch.name}"</strong> at <strong>{duplicateMatch.templeName}</strong> ({duplicateMatch.village}).
                        </p>

                        <div className="mt-3 p-3 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Existing Family Record</span>
                            <span className="font-semibold">{duplicateMatch.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Assigned Temple / Ward</span>
                            <span className="font-semibold truncate block">{duplicateMatch.templeName}</span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setDuplicateAcknowledged(prev => !prev)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs ${duplicateAcknowledged
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {duplicateAcknowledged ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            <span>{duplicateAcknowledged ? 'Clergy Override Approved (Verified)' : 'Acknowledge Duplicate & Request Clergy Exception'}</span>
                          </button>
                          <Link
                            to="/families"
                            className="text-xs font-semibold text-amber-800 underline hover:text-amber-950 flex items-center gap-1"
                          >
                            <span>Search Ledger</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============ SECTION 3: RESIDENTIAL LOCATION & WARD (WARM AMBER THEME) ============ */}
              <div id="sec-location">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 mb-4 pb-2.5 border-b border-amber-100 bg-gradient-to-r from-amber-50/70 via-amber-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-[#D97706] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">home_pin</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold flex flex-wrap items-center gap-1.5 text-[#0F172A] leading-snug">
                      <span>{t('families.form.residential', '3. Residential Location & Parish Ward')}</span>
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 sm:py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Parish Ward
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="form-label" htmlFor="address">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">home</span>
                      <span>{t('families.form.address', 'Street Address')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.address ? 'has-error' : ''}`}
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g. No. 42, Temple Road"
                        type="text"
                      />
                    </div>
                    {fieldErrors.address && (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Village / Ward */}
                  <div>
                    <label className="form-label" htmlFor="village">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">holiday_village</span>
                      <span>{t('families.form.village', 'Village / Ward')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input ${fieldErrors.village ? 'has-error' : ''}`}
                        id="village"
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        placeholder="e.g. Temple Road"
                        type="text"
                      />
                    </div>
                    {fieldErrors.village ? (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.village}</span>
                      </p>
                    ) : (
                      <p className="form-hint">Grama Niladhari division within the parish</p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="form-label" htmlFor="district">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">map</span>
                      <span>{t('families.form.district', 'District')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        className={`form-input appearance-none pr-10 cursor-pointer font-medium ${fieldErrors.district ? 'has-error' : ''}`}
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                      >
                        {SRI_LANKA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] text-[#64748B]">
                        expand_more
                      </span>
                    </div>
                    {fieldErrors.district && (
                      <p className="form-error-msg">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        <span>{fieldErrors.district}</span>
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="form-label" htmlFor="postalCode">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">markunread_mailbox</span>
                      <span>{t('families.form.postalCode', 'Postal Code')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className="form-input font-mono"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 82200"
                        required
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ============ SECTION 4: SECURITY PASSWORD (ROYAL INDIGO THEME) ============ */}
              <div id="sec-credentials">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-2.5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-indigo-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-[#4F46E5] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">lock</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F172A] flex flex-wrap items-center gap-1.5 leading-snug">
                      <span>{t('families.form.security', '4. Dayaka Portal Security Credentials')}</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="self-start sm:self-auto text-[11.5px] font-semibold text-indigo-700 bg-white sm:bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg sm:rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_mode</span>
                    <span>{t('families.form.autoGen', 'Auto-generate Password')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Password */}
                  <div>
                    <label className="form-label" htmlFor="password">
                      <span className="material-symbols-outlined text-[16px] text-indigo-600">lock</span>
                      <span>{t('families.form.password', 'Password')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className={`form-input pr-12 font-mono ${fieldErrors.password ? 'has-error' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
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
                      <span>{t('families.form.confirmPassword', 'Confirm Password')}</span> <span className="text-[#8C2F2F] font-bold">*</span>
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
                        onChange={handleInputChange}
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

              {/* ============ SECTION 5: FAMILY MEMBERS & DEPENDENTS (SKY BLUE THEME) ============ */}
              <div id="sec-members">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-2.5 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-sky-50/20 to-transparent p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100 text-[#0284C7] shadow-2xs flex-shrink-0">
                      <span className="material-symbols-outlined text-[19px]">diversity_3</span>
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0C4A6E] flex flex-wrap items-center gap-1.5 leading-snug">
                      <span>{t('families.form.dependents', '5. Family Members & Dependents')}</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11.5px] sm:text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-all shadow-sm cursor-pointer whitespace-nowrap border border-sky-400/40 shadow-sky-600/30"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[17px]">add</span>
                    <span>{t('families.form.addMember', '+ Add Family Member')}</span>
                  </button>
                </div>

                {members.length > 0 ? (
                  <div className="space-y-4">
                    {members.map((m, index) => (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/30 via-white to-purple-50/15 hover:border-purple-300 transition-all shadow-xs space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-[#7E22CE] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                              Household Member #{index + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-4 items-start">
                          {/* Full Name */}
                          <div className="md:col-span-4">
                            <label className="form-label text-[12px]">
                              <span className="material-symbols-outlined text-[16px] text-purple-600">person</span>
                              <span>{t('families.form.fullName', 'Full Name')}</span> <span className="text-[#8C2F2F]">*</span>
                            </label>
                            <div className="relative group">
                              <input
                                type="text"
                                value={m.fullName}
                                onChange={(e) => handleMemberChange(m.id, 'fullName', e.target.value)}
                                className="form-input text-sm"
                                placeholder="Full name of member"
                                required
                              />
                            </div>
                          </div>

                          {/* Relationship */}
                          <div className="md:col-span-3">
                            <label className="form-label text-[12px]">
                              <span>{t('families.form.relationship', 'Relationship')}</span> <span className="text-[#8C2F2F]">*</span>
                            </label>
                            <div className="relative group">
                              <select
                                value={m.relationship}
                                onChange={(e) => handleMemberChange(m.id, 'relationship', e.target.value)}
                                className="form-input text-sm cursor-pointer appearance-none pr-9 font-medium"
                              >
                                <option value="Spouse">Spouse</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Other Dependent">Other Dependent</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] text-[#64748B]">
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* Age */}
                          <div className="md:col-span-2">
                            <label className="form-label text-[12px]">
                              <span>{t('families.form.age', 'Age')}</span>
                            </label>
                            <input
                              type="number"
                              value={m.age}
                              onChange={(e) => handleMemberChange(m.id, 'age', e.target.value)}
                              className="form-input text-sm text-center font-mono font-medium"
                              placeholder="Age"
                              min="0"
                              max="120"
                            />
                          </div>

                          {/* Gender */}
                          <div className="md:col-span-3">
                            <label className="form-label text-[12px]">
                              <span>{t('families.form.gender', 'Gender')}</span>
                            </label>
                            <div className="relative group">
                              <select
                                value={m.gender}
                                onChange={(e) => handleMemberChange(m.id, 'gender', e.target.value as 'Male' | 'Female')}
                                className="form-input text-sm cursor-pointer appearance-none pr-9 font-medium"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px] text-[#64748B]">
                                expand_more
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-2xs">
                      <span className="material-symbols-outlined text-[26px]">diversity_3</span>
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-sm font-bold text-[#0F172A]">No Family Dependents Added Yet</h4>
                      <p className="text-xs text-[#64748B] mt-1">
                        Optional: Register spouse, children, or elderly parents living in this household to record merit and Dana participation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-purple-600">add_circle</span>
                      <span>Add First Household Member</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ============ SECTION 6: CLERICAL NOTES (SLATE THEME) ============ */}
              <div>
                <h3 className="text-[15px] font-bold mb-3 flex items-center gap-2.5 text-[#0C4A6E]">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-700 shadow-xs">
                    <span className="material-symbols-outlined text-[19px]">edit_note</span>
                  </span>
                  <span>6. Clerical &amp; Pastoral Remarks</span>

                </h3>
                <textarea
                  name="clericalNotes"
                  value={formData.clericalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-input text-sm"
                  placeholder="Enter any special temple notes, ancestral pirith preferences, or dana seniority remarks..."
                ></textarea>
                <p className="form-hint">Internal administrative remarks visible only to temple clergy</p>
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

              {/* Form Actions Footer with Responsive, Compact & Elegant Sky Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-5 sm:pt-7 border-t border-slate-200 gap-3">
                <Link
                  to="/families"
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all hover:bg-slate-100 bg-white text-slate-700 border border-slate-300 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[17px]">close</span>
                  <span>{t('common.cancel', 'Cancel')}</span>
                </Link>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto py-2.5 px-4 sm:px-5 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all hover:bg-slate-50 bg-white border border-slate-300 text-[#0F172A] flex items-center justify-center gap-2 shadow-2xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0284C7] shrink-0">bookmark_border</span>
                    <span>{t('families.form.saveDraft', 'Save Draft')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto py-2.5 px-5 sm:px-6 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold inline-flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white active:scale-95 shadow-md shadow-sky-600/25 transition-all cursor-pointer border border-sky-400/50 text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[19px] shrink-0">
                      {isSubmitting ? 'sync' : 'how_to_reg'}
                    </span>
                    <span>{isSubmitting ? 'Registering...' : t('families.form.submit', 'Register Family')}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Audit Footnote */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-2 text-[11px] gap-2 text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#0C4A6E]">history_edu</span>
              <span>Every family registration is permanently timestamped in the Temple Immutable Audit Vault.</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#CBD5E1] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#166534] inline-block"></span>
              <span className="font-semibold text-[#0F172A]">Verified Duplicate Protection</span>
            </div>
          </div>

        </main>

        {/* Bottom Flowing Wave Silhouette with Floating Badge */}
        <TempleFooterWave />

      </div>

    </div>
  );
}
