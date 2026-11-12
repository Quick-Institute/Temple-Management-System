import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave, { GoldenLotusIcon } from '../../../components/TempleFooterWave.tsx';
import { INITIAL_ROSTER, type UserOfficial } from '../../../data/seed';

export default function UsersRolesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserOfficial[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('temple_registered_users') || '[]');
      const sanitized = saved.map((u: UserOfficial) => (u.avatar === 'MA' ? u : u));
      return [...sanitized, ...INITIAL_ROSTER];
    } catch {
      return INITIAL_ROSTER;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('temple_registered_users') || '[]');
      let updated = false;
      const sanitized = saved.map((u: UserOfficial) => {
        if (u.avatar === 'MA') {
          updated = true;
          return { ...u, avatar: 'MA' };
        }
        return u;
      });
      if (updated) {
        localStorage.setItem('temple_registered_users', JSON.stringify(sanitized));
      }
    } catch {
      // ignore
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserOfficial | null>(null);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserOfficial | null>(null);
  const [isDeactivateUserOpen, setIsDeactivateUserOpen] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<UserOfficial | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('Term Completed / Routine Committee Rotation');
  const [deactivateNotes, setDeactivateNotes] = useState('');
  const [deactivateNotifyEmail, setDeactivateNotifyEmail] = useState(true);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<UserOfficial | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserOfficial | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: string; title: string; desc: string } | null>(null);

  // Official Devotee ID Card Print Modal State
  const [isUserCardModalOpen, setIsUserCardModalOpen] = useState(false);
  const [selectedUserForCard, setSelectedUserForCard] = useState<UserOfficial | null>(null);

  const handleOpenUserCard = (user: UserOfficial) => {
    setSelectedUserForCard(user);
    setIsUserCardModalOpen(true);
  };

  // CSV Export Handler
  const exportUsersToCSV = () => {
    const headers = ['ID', 'Full Name', 'Designation', 'Committee', 'Email', 'Phone', 'NIC', 'Status'];
    const rows = users.map((u) => [
      `USR-${u.id}`,
      `"${(u.name || `${u.firstName || ''} ${u.lastName || ''}`).replace(/"/g, '""')}"`,
      `"${(u.designation || '').replace(/"/g, '""')}"`,
      `"${(u.committeeName || '').replace(/"/g, '""')}"`,
      u.email || '',
      `"${u.phone || ''}"`,
      `"${u.nic || ''}"`,
      u.status || 'active'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Temple_Officials_Registry_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotificationMsg({
      type: 'success',
      title: 'Registry Exported',
      desc: `Exported ${users.length} official devotee records to Temple_Officials_Registry_2026.csv.`
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };



  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.templeName && u.templeName.toLowerCase().includes(q)) ||
        (u.templeCode && u.templeCode.toLowerCase().includes(q)) ||
        (u.committeeName && u.committeeName.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);

      const matchesCommittee =
        committeeFilter === "all" ||
        u.committeeName === committeeFilter ||
        (committeeFilter === "other" && u.committeeName !== "Dayaka Sabhawa" && u.committeeName !== "Event or Programme Committee");

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (u.status === "active" || u.status === "permanent")) ||
        (statusFilter === "deactivated" && u.status === "deactivated");

      return matchesSearch && matchesCommittee && matchesStatus;
    });
  }, [users, searchQuery, committeeFilter, statusFilter]);

  // Deactivate & Reactivate Actions with Reason Support
  const handleOpenDeactivateUser = (user: UserOfficial) => {
    if (user.isPermanent) {
      alert('Permanent Monastic Head records cannot be deactivated.');
      return;
    }
    setDeactivatingUser(user);
    setDeactivateReason('Term Completed / Routine Committee Rotation');
    setDeactivateNotes('');
    setDeactivateNotifyEmail(true);
    setIsDeactivateUserOpen(true);
  };

  const handleConfirmDeactivateUser = () => {
    if (!deactivatingUser) return;

    const updatedUsers = users.map((u) => {
      if (u.id === deactivatingUser.id) {
        return {
          ...u,
          status: 'deactivated' as const,
          deactivateReason: deactivateReason,
          deactivateNotes: deactivateNotes.trim(),
          deactivatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    try {
      localStorage.setItem('temple_registered_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.error(err);
    }

    if (selectedUserForDetails && selectedUserForDetails.id === deactivatingUser.id) {
      setSelectedUserForDetails((prev) => (prev ? {
        ...prev,
        status: 'deactivated',
        deactivateReason: deactivateReason,
        deactivateNotes: deactivateNotes.trim(),
        deactivatedAt: new Date().toISOString()
      } : null));
    }

    setIsDeactivateUserOpen(false);
    setNotificationMsg({
      type: 'warning',
      title: 'User Account Deactivated',
      desc: `${deactivatingUser.name} has been suspended. Reason: "${deactivateReason}". Recorded in ledger audit trail.`
    });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleReactivateUser = (user: UserOfficial) => {
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          status: 'active' as const,
          deactivateReason: undefined,
          deactivateNotes: undefined,
          deactivatedAt: undefined
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    try {
      localStorage.setItem('temple_registered_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.error(err);
    }

    if (selectedUserForDetails && selectedUserForDetails.id === user.id) {
      setSelectedUserForDetails((prev) => (prev ? {
        ...prev,
        status: 'active',
        deactivateReason: undefined,
        deactivateNotes: undefined,
        deactivatedAt: undefined
      } : null));
    }

    setNotificationMsg({
      type: 'success',
      title: 'User Account Reactivated',
      desc: `${user.name} has been restored with full active committee privileges.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleOpenPermissions = (user: UserOfficial) => {
    setSelectedUserForPerms(user);
    setIsPermissionsOpen(true);
  };

  const handleOpenDetails = (user: UserOfficial) => {
    setSelectedUserForDetails(user);
    setIsDetailsOpen(true);
  };

  // Edit User Handlers - Navigates to Dedicated Full Edit Page
  const handleOpenEditUser = (user: UserOfficial) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedName = editingUser.name || `${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim();
    const initials = `${(editingUser.firstName?.[0] || '')}${(editingUser.lastName?.[0] || '')}`.toUpperCase() || editingUser.avatar || 'U';

    const originalUser = users.find((u) => u.id === editingUser.id);
    const finalized: UserOfficial = {
      ...editingUser,
      name: updatedName,
      avatar: editingUser.avatar || initials
    };

    if (originalUser && originalUser.status !== 'deactivated' && finalized.status === 'deactivated') {
      finalized.deactivatedAt = new Date().toISOString();
    } else if (originalUser && originalUser.status === 'deactivated' && finalized.status === 'active') {
      finalized.deactivateReason = undefined;
      finalized.deactivateNotes = undefined;
      finalized.deactivatedAt = undefined;
    }

    const updatedUsers = users.map((u) => (u.id === finalized.id ? finalized : u));
    setUsers(updatedUsers);

    try {
      localStorage.setItem('temple_registered_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.error(err);
    }

    if (selectedUserForDetails && selectedUserForDetails.id === finalized.id) {
      setSelectedUserForDetails(finalized);
    }

    setIsEditUserOpen(false);
    setNotificationMsg({
      type: 'success',
      title: 'User Profile Updated',
      desc: `Official record for ${finalized.name} updated successfully.`
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Delete User Handlers
  const handleOpenDeleteUser = (user) => {
    setDeletingUser(user);
    setIsDeleteUserOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;

    if (deletingUser.isPermanent) {
      alert('Permanent Monastic Head records cannot be deleted.');
      setIsDeleteUserOpen(false);
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== deletingUser.id);
    setUsers(updatedUsers);

    try {
      localStorage.setItem('temple_registered_users', JSON.stringify(updatedUsers));
    } catch (err) {
      console.error(err);
    }

    if (selectedUserForDetails && selectedUserForDetails.id === deletingUser.id) {
      setIsDetailsOpen(false);
      setSelectedUserForDetails(null);
    }

    setIsDeleteUserOpen(false);
    setNotificationMsg({
      type: 'warning',
      title: 'User Account Deleted',
      desc: `${deletingUser.name} has been permanently removed from the ledger.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
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

        {/* Users & Roles Main Content Body (Matched to Dashboard Width & Styling) */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 space-y-3.5 sm:space-y-5 max-w-[1550px] w-full mx-auto">

          {/* ======================================================== */}
          {/* SECTION 1: SERENE TEMPLE SKY BLUE HERO BANNER            */}
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
              <span className="text-[12px] sm:text-[13px] font-medium text-sky-800 leading-none mb-1">
                {t('users.title', 'User & Role Management')},
              </span>
              <h1 className="font-serif text-[22px] sm:text-[27px] font-bold text-[#0C4A6E] tracking-tight leading-tight">
                Sri Sambodhi Maha Viharaya!
              </h1>
              <div className="flex items-center gap-2 mt-1.5 mb-2 flex-wrap">
                <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0C4A6E]">
                  <span className="material-symbols-outlined text-[15px] text-[#0284C7]">location_on</span>
                  <span>Kadokkele, Gampaha</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#BAE6FD]/70 text-[#0369A1] border border-sky-300/60 shadow-2xs">
                  Temple Admin
                </span>
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
          {/* SECTION 2: FIVE STAT KPI CARDS (PROFESSIONAL PALETTE)    */}
          {/* ======================================================== */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 animate-fade-up delay-1">
            {/* 1. Total Registered (Sky Blue) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#E0F2FE] text-[#0284C7] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">manage_accounts</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium">{t('users.kpi.total', 'Total Officials')}</div>
                  <div className="text-[17px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">{users.length}</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>↑ 2 this month</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-sky-400 text-[17px] hidden sm:block">chevron_right</span>
            </div>

            {/* 2. Dayaka Sabhawa (Mint Green) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#DCFCE7] text-[#16A34A] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">groups</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium">{t('users.kpi.dayaka', 'Dayaka Sabhawa')}</div>
                  <div className="text-[17px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {users.filter(u => u.committeeName === 'Dayaka Sabhawa').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>Executive Board</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-400 text-[17px] hidden sm:block">chevron_right</span>
            </div>

            {/* 3. Event Committee (Warm Honey Amber) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-amber-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">event_seat</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium">{t('users.kpi.event', 'Event Committee')}</div>
                  <div className="text-[17px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {users.filter(u => u.committeeName === 'Event or Programme Committee').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>Coordinating</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-amber-400 text-[17px] hidden sm:block">chevron_right</span>
            </div>

            {/* 4. Active Credentials (Soft Lilac / Purple) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#F3E8FF] text-[#9333EA] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">verified_user</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium">{t('users.kpi.roles', 'Active Logins')}</div>
                  <div className="text-[17px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {users.filter(u => u.status === 'active' || u.status === 'permanent').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>Verified Logins</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-purple-400 text-[17px] hidden sm:block">chevron_right</span>
            </div>

            {/* 5. Deactivated (Soft Rose Pink) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-rose-300 transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#FFE4E6] text-[#E11D48] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">person_off</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium">{t('families.kpi.deactivated', 'Deactivated')}</div>
                  <div className="text-[17px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {users.filter(u => u.status === 'deactivated').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>Revoked Access</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-rose-400 text-[17px] hidden sm:block">chevron_right</span>
            </div>
          </section>

          {/* Filter Bar */}
          <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-fade-up delay-1 bg-white border border-sky-100">
                <div className="flex flex-1 items-center gap-3 max-w-2xl">
                  <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none text-sky-500">search</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13.5px] focus:outline-none transition-all bg-[#F0F9FF] border border-[#BAE6FD] text-[#0C4A6E] focus:ring-2 focus:ring-sky-500/20"
                      placeholder={t('users.searchPlaceholder', 'Search by Devotee Name, Temple Code, Committee, Designation, or Contact...')}
                    />
                  </div>
                  <div className="relative flex-shrink-0 w-52">
                    <select
                      value={committeeFilter}
                      onChange={(e) => setCommitteeFilter(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-[13.5px] focus:outline-none cursor-pointer bg-white border border-sky-200 text-[#0C4A6E] focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="all">{t('users.filter.allCommittees', 'All Committees')}</option>
                      <option value="Dayaka Sabhawa">{t('users.kpi.dayaka', 'Dayaka Sabhawa')}</option>
                      <option value="Event or Programme Committee">{t('users.kpi.event', 'Event or Programme Committee')}</option>
                      <option value="other">Other Committees</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-sky-500">expand_more</span>
                  </div>
                  <div className="relative flex-shrink-0 w-36">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-[13.5px] focus:outline-none cursor-pointer bg-white border border-sky-200 text-[#0C4A6E] focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="all">{t('families.filter.allStatus', 'All Status')}</option>
                      <option value="active">{t('families.filter.active', 'Active Only')}</option>
                      <option value="deactivated">{t('families.filter.deactivated', 'Deactivated')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-sky-500">expand_more</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-auto">
                  <span className="text-[12px] font-medium text-sky-700 hidden sm:inline">{filteredUsers.length} Officials Listed</span>
                  <button
                    type="button"
                    onClick={exportUsersToCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all hover:bg-sky-50 bg-white text-sky-800 border border-sky-200 shadow-2xs"
                    title="Download CSV spreadsheet"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">file_download</span>
                    <span>{t('families.btn.exportCsv', 'Export CSV')}</span>
                  </button>
                  <Link
                    to="/add-user"
                    className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] flex items-center gap-2 shadow-sm transition-all border border-[#38BDF8]/50 shadow-sky-600/30"
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">person_add</span>
                    <span>+ {t('users.addUser', 'Add User')}</span>
                  </Link>
                </div>
              </div>

              {/* Users Table Card */}
              <div className="card overflow-hidden flex flex-col animate-fade-up delay-2 border border-sky-100">
                <div className="p-4 flex items-center justify-between border-b bg-[#F0F9FF] border-sky-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-[#0284C7]">badge</span>
                    <h2 className="text-[15px] font-semibold text-[#0C4A6E]">{t('users.tab.officials', 'Registered Governance & Committee Officials')}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                      {filteredUsers.length} Recorded
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-sky-700">
                      <span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block"></span>
                      <span>Committee Ledger Synced</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 text-[11.5px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-4 font-bold">{t('users.table.official', 'User Details')}</th>
                        <th className="py-3.5 px-4 font-bold">{t('users.table.committee', 'Committee & Designation')}</th>
                        <th className="py-3.5 px-4 font-bold">{t('users.table.contact', 'Contact Phone')}</th>
                        <th className="py-3.5 px-4 font-bold">{t('users.table.status', 'Status')}</th>
                        <th className="py-3.5 px-4 font-bold text-right">{t('users.table.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[14px] border-slate-100">
                      {filteredUsers.map((u) => {
                        const isDeactivated = u.status === "deactivated";
                        return (
                          <tr key={u.id} className={`hover:bg-sky-50/40 transition-colors ${isDeactivated ? 'bg-slate-50/60' : ''}`}>

                            {/* 1. User First & Last Name */}
                            <td className="py-4 px-4 align-top">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-bold shadow-sm"
                                  style={{ background: u.avatarBg || '#E0F2FE', color: u.avatarColor || '#0369A1' }}
                                >
                                  {u.avatar}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[14px] font-bold truncate ${isDeactivated ? 'line-through text-slate-400' : 'text-[#0F172A]'}`}>
                                    {u.name}
                                  </span>
                                  <span className="text-[12px] text-slate-500">
                                    {u.alias ? `"${u.alias}"` : `${u.firstName || ''} ${u.lastName || ''}`}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Committee Name & Designation */}
                            <td className="py-4 px-4 align-top">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold border ${u.committeeName === 'Dayaka Sabhawa'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : u.committeeName === 'Event or Programme Committee'
                                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                  <span className="material-symbols-outlined text-[13px]">groups</span>
                                  {u.committeeName || 'Dayaka Sabhawa'}
                                </span>
                                <span className="text-[13px] font-semibold text-[#0F172A]">
                                  {u.designation || u.roleDisplay || 'Committee Member'}
                                </span>
                              </div>
                            </td>

                            {/* 3. Contact Phone */}
                            <td className="py-4 px-4 align-top">
                              <div className={`flex flex-col text-[12px] space-y-0.5 ${isDeactivated ? 'opacity-60' : ''}`}>
                                <span className="font-mono text-[#0F172A] text-[13px] flex items-center gap-1.5 font-semibold">
                                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">call</span>
                                  {u.phone}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Primary Contact
                                </span>
                              </div>
                            </td>

                            {/* 4. Status */}
                            <td className="py-4 px-4 align-top">
                              {u.status === 'permanent' || u.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {u.status === 'permanent' ? 'Permanent' : 'Active'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Deactivated
                                </span>
                              )}
                            </td>

                            {/* 5. Operational Actions */}
                            <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View All Details Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetails(u)}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-sky-100 text-[#0284C7] bg-sky-50 border border-sky-200 shadow-2xs cursor-pointer"
                                  title="View All Details"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>

                                {/* Edit User Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 text-slate-700 bg-white border border-slate-200 shadow-2xs cursor-pointer"
                                  title="Edit User Profile"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>

                                {/* Edit Delegated Permissions Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenPermissions(u)}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-200 shadow-2xs cursor-pointer"
                                  title="Edit Delegated Permissions"
                                >
                                  <span className="material-symbols-outlined text-[18px]">shield_person</span>
                                </button>

                                {!u.isPermanent && (
                                  <>
                                    {u.status === 'active' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeactivateUser(u)}
                                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                                        title="Deactivate Account with Reason"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">person_off</span>
                                        <span>Deactivate</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleReactivateUser(u)}
                                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                                        title="Reactivate Account"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                        <span>Reactivate</span>
                                      </button>
                                    )}

                                    {/* Delete User Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDeleteUser(u)}
                                      className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-[#B91C1C] bg-[#FEE2E2] border border-red-200/80"
                                      title="Delete User Record"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                            No committee officials match the selected search or filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (Hidden on desktop, shown on mobile) */}
                <div className="block md:hidden p-2.5 sm:p-4 bg-[#F0F9FF] space-y-2.5">
                  {filteredUsers.length === 0 ? (
                    // Mobile Rich Empty State
                    <div className="py-12 px-4 text-center bg-white rounded-2xl border border-sky-100 shadow-xs space-y-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mx-auto shadow-xs">
                        <span className="material-symbols-outlined text-[32px]">person_search</span>
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-800">No Committee Officials Found</h4>
                        <p className="text-[12px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                          {searchQuery ? `No records matching "${searchQuery}".` : 'No records match your active search filters.'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 pt-1 max-w-xs mx-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setCommitteeFilter('all');
                            setStatusFilter('all');
                          }}
                          className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-white border border-sky-200 text-[#0284C7] hover:bg-sky-50 transition-all cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                        <Link
                          to="/users-roles/add"
                          className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-all shadow-sm cursor-pointer text-center"
                        >
                          + Register Official
                        </Link>
                      </div>
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isDeactivated = u.status === 'deactivated';
                      return (
                        <div
                          key={u.id}
                          className={`bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E8E6DF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#0284C7]/50 transition-all ${
                            isDeactivated ? 'opacity-75 bg-gray-50/70' : ''
                          }`}
                        >
                          {/* Card Top: Avatar, Name, ID, Status */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shadow-sm flex-shrink-0"
                                style={{ background: u.avatarBg || '#E0F2FE', color: u.avatarColor || '#0369A1' }}
                              >
                                {u.avatar}
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetails(u)}
                                  className={`text-left text-[14px] font-bold truncate block leading-tight ${
                                    isDeactivated ? 'line-through text-slate-400' : 'text-[#0F172A] hover:text-[#0284C7]'
                                  }`}
                                >
                                  {u.name}
                                </button>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[9.5px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                    {u.id}
                                  </span>
                                  <span className="text-[11.5px] text-slate-500 truncate">
                                    {u.alias ? `"${u.alias}"` : `${u.firstName || ''} ${u.lastName || ''}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              {u.status === 'permanent' || u.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {u.status === 'permanent' ? 'Permanent' : 'Active'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  Deactivated
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Committee & Designation Strip */}
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                                  u.committeeName === 'Dayaka Sabhawa'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : u.committeeName === 'Event or Programme Committee'
                                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[12px]">groups</span>
                                <span>{u.committeeName || 'Dayaka Sabhawa'}</span>
                              </span>
                              <span className="text-[11.5px] font-semibold text-[#0F172A] truncate">
                                {u.designation || u.roleDisplay || 'Committee Member'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 font-mono text-[11px] text-[#0C4A6E]">
                              <span className="material-symbols-outlined text-[13px] text-[#0284C7] shrink-0">call</span>
                              <a href={`tel:${u.phone}`} className="font-semibold hover:underline">
                                {u.phone}
                              </a>
                            </div>
                          </div>

                          {/* Action Buttons (Responsive Architecture like FamiliesPage) */}
                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                            {/* Row 1: Primary Action & Quick Edit */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(u)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-[11.5px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap shadow-sky-600/30"
                              >
                                <span className="material-symbols-outlined text-[15px] text-white">visibility</span>
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-[#92400E] border border-amber-200/80 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                title="Edit User Profile"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPermissions(u)}
                                className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                title="Edit Delegated Permissions"
                              >
                                <span className="material-symbols-outlined text-[14px]">shield_person</span>
                                <span>Perms</span>
                              </button>
                            </div>

                            {/* Row 2: Secondary Utilities (Deactivate/Reactivate, Delete) */}
                            {!u.isPermanent && (
                              <div className="flex items-center gap-1.5">
                                {u.status === 'active' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDeactivateUser(u)}
                                    className="flex-1 py-1 px-2.5 rounded-lg text-[10.5px] font-medium text-red-600 hover:bg-red-50 border border-red-200 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                    title="Deactivate Account"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">person_off</span>
                                    <span>Deactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReactivateUser(u)}
                                    className="flex-1 py-1 px-2.5 rounded-lg text-[10.5px] font-medium text-[#0284C7] hover:bg-sky-50 border border-sky-200 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                    title="Reactivate Account"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    <span>Reactivate</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteUser(u)}
                                  className="p-1 px-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
                                  title="Delete User Record"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] border-t bg-[#F0F9FF] border-sky-100 text-sky-800">
                  <span>Displaying <strong>1 - {filteredUsers.length}</strong> of <strong>{users.length}</strong> Committee Officials</span>
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 rounded opacity-50 cursor-not-allowed bg-white border border-sky-200 text-sky-400">Previous</button>
                    <button className="px-2.5 py-1 rounded font-semibold border bg-[#0284C7] text-white border-sky-400/50 shadow-xs">1</button>
                    <button className="px-2.5 py-1 rounded border bg-white border-sky-200 text-sky-800 hover:bg-sky-50 cursor-pointer">2</button>
                    <button className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 cursor-pointer">Next</button>
                  </div>
                </div>
              </div>

          {/* Canonical Permissions Matrix Reference */}
          <div className="card overflow-hidden flex flex-col animate-fade-up delay-3">
            <div className="p-4 border-b bg-[#FAFAFA] border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#1F2937]">security</span>
                <h3 className="text-[14px] font-bold text-[#111827]">Canonical RBAC Governance Authority Matrix </h3>
              </div>
              <p className="text-[12px] mt-0.5 text-[#6B7280]">
                Institutional role rights certified across Dayaka committee designations.
              </p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]">
                    <th className="py-3 px-4 font-semibold">Parish Operational Domain</th>
                    <th className="py-3 px-4 font-semibold text-center">President / Nayaka Thero</th>
                    <th className="py-3 px-4 font-semibold text-center">Vice-President / Co-Admin</th>
                    <th className="py-3 px-4 font-semibold text-center">Secretary / Member</th>
                    <th className="py-3 px-4 font-semibold text-center">Treasurer</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[#E5E7EB]">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3.5 px-4">
                      <span className="text-[13px] font-semibold block text-[#111827]">Dayaka Family Registry</span>
                      <span className="text-[11px] text-[#6B7280]">Household census, inter-temple parish transfer approvals</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#111827]">Full Authority</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Edit &amp; Register</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#6B7280]">Read Only</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#6B7280]">View Dues</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="py-3.5 px-4">
                      <span className="text-[13px] font-semibold block text-[#111827]">Dana &amp; Alms Scheduling Matrix</span>
                      <span className="text-[11px] text-[#6B7280]">Heel &amp; Dawal Dana, Pirith chanting, Katina robes sponsorship</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#111827]">Sole Blessing Override</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Manage Calendar</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Record Allocation</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Record Donations</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="py-3.5 px-4">
                      <span className="text-[13px] font-semibold block text-[#111827]">Religious Events &amp; Programmes </span>
                      <span className="text-[11px] text-[#6B7280]">Poya days, Katina festival, Dhamma school assemblies</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#111827]">Publish &amp; Broadcast</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">campaign</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Draft &amp; Broadcast</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Coordinate Events</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4F0DC] text-[#1E412D]">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                      </span>
                      <span className="block text-[10px] font-medium mt-0.5 text-[#1F2937]">Manage Budget</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
        <TempleFooterWave />
      </div>

      {/* ========================================== */}
      {/* MODAL 1: USER DETAILS MODAL (Exact Details) */}
      {/* ========================================== */}
      {isDetailsOpen && selectedUserForDetails && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up">

            {/* Header */}
            <div className="p-6 text-white relative overflow-hidden flex items-start justify-between bg-gradient-to-r from-[#0C4A6E] via-[#0284C7] to-[#0369A1] border-b border-sky-400/30">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4 text-white">
                <span className="material-symbols-outlined text-[130px]">temple_buddhist</span>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[18px] tracking-wide shadow-md ring-2 ring-white/60 ring-offset-2 ring-offset-[#0284C7] bg-white text-[#0284C7] flex-shrink-0"
                >
                  {selectedUserForDetails.avatar || 'SJ'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {selectedUserForDetails.status === 'deactivated' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide bg-rose-950/70 border border-rose-400/30 text-rose-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Deactivated Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide bg-white/20 border border-white/30 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active Credential
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sky-950/40 text-sky-200 border border-sky-300/40 tracking-wider">
                      <span className="material-symbols-outlined text-[13px] text-sky-200">temple_buddhist</span>
                      <span>{selectedUserForDetails.templeCode || 'TPL-2026-0482'}</span>
                    </span>
                  </div>
                  <h2 className="text-[20px] font-bold text-white tracking-tight leading-snug">
                    {selectedUserForDetails.name || `${selectedUserForDetails.firstName || ''} ${selectedUserForDetails.lastName || ''}`}
                  </h2>
                  <div className="text-[12px] mt-1 text-sky-100/90 flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-white">{selectedUserForDetails.templeName || 'Sri Sambodhi Maha Viharaya'}</span>
                    <span className="text-sky-300/60">•</span>
                    <span className="text-sky-100">{selectedUserForDetails.designation || selectedUserForDetails.roleDisplay}</span>
                    <span className="text-sky-300/60">•</span>
                    <span className="text-sky-100/80">{selectedUserForDetails.committeeName || 'Dayaka Sabhawa'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body: All Required Details Grid */}
            <div className="p-5 sm:p-6 space-y-4 bg-[#F8F9FA] max-h-[72vh] overflow-y-auto">

              {/* Deactivation Status Banner (if deactivated) */}
              {selectedUserForDetails.status === 'deactivated' && (
                <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-xs animate-fade-up">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-[12.5px] text-amber-950">
                      <span className="material-symbols-outlined text-[18px] text-amber-700">person_off</span>
                      <span>Account Suspended / Deactivated</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300">
                      Suspended
                    </span>
                  </div>
                  <div className="text-[12px] text-amber-900 mt-1">
                    <span className="font-semibold text-amber-950">Reason: </span>
                    <span>{selectedUserForDetails.deactivateReason || 'Administrative rotation / term completed'}</span>
                  </div>
                  {selectedUserForDetails.deactivateNotes && (
                    <div className="text-[11.5px] text-amber-800 mt-1 pl-2 border-l-2 border-amber-400 italic">
                      "{selectedUserForDetails.deactivateNotes}"
                    </div>
                  )}
                  {selectedUserForDetails.deactivatedAt && (
                    <div className="text-[10.5px] text-amber-700 mt-1.5">
                      Suspended on: {new Date(selectedUserForDetails.deactivatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              )}

              {/* 1. Institution Information */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">temple_buddhist</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Temple Institution
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Temple Name
                    </span>
                    <span className="text-[13.5px] font-semibold text-gray-900 block">
                      {selectedUserForDetails.templeName || 'Sri Sambodhi Maha Viharaya'}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Official Registered Viharaya
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Temple Registration Code
                    </span>
                    <span className="font-mono text-[13.5px] font-semibold text-[#0369A1] block">
                      {selectedUserForDetails.templeCode || 'TPL-2026-0482'}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Department of Buddhist Affairs Code
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Official Member Identity & Verification */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">badge</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Member Identity &amp; Verification
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Full Devotee / Monastic Name
                    </span>
                    <span className="text-[13.5px] font-semibold text-gray-900 block">
                      {selectedUserForDetails.name || `${selectedUserForDetails.firstName || ''} ${selectedUserForDetails.lastName || ''}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Honorific Alias / Title
                    </span>
                    <span className="text-[13px] font-medium text-gray-700 block">
                      {selectedUserForDetails.alias ? `"${selectedUserForDetails.alias}"` : 'Devotee Official'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      National Identity Card (NIC) / Monastic ID
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-gray-400">verified_user</span>
                      {selectedUserForDetails.nic || '197418900450'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Ordained / Enrolment Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      {selectedUserForDetails.ordainedYear || 'Verified NIC (SL)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Committee Governance & Designation */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">account_tree</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Committee Governance &amp; Designation
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Assigned Committee
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-emerald-50 text-[#0C4A6E] border border-emerald-200/80 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                      {selectedUserForDetails.committeeName || 'Dayaka Sabhawa'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Official Designation
                    </span>
                    <span className="text-[13.5px] font-semibold text-gray-900 block mt-0.5">
                      {selectedUserForDetails.designation || selectedUserForDetails.roleDisplay || 'Committee Member'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                      Institutional Authority Scope
                    </span>
                    <p className="text-[12px] text-gray-600 leading-relaxed font-normal">
                      {selectedUserForDetails.roleSubtitle || 'Dayaka Sabhawa • Parish Administration & Governance Oversight'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Complete Contact Coordinates (Including Email) */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">contact_phone</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Direct Contact Coordinates
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/70 border border-gray-200/60 hover:border-gray-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 flex-shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                        Primary Email Address
                      </span>
                      <a
                        href={`mailto:${selectedUserForDetails.email || 'sunil.j@gmail.com'}`}
                        className="font-mono text-[12.5px] font-semibold text-gray-900 hover:text-[#0C4A6E] hover:underline block truncate mt-0.5"
                      >
                        {selectedUserForDetails.email || 'sunil.j@gmail.com'}
                      </a>
                      <span className="text-[10.5px] text-gray-400 mt-0.5 block">Official Digital Notification Mail</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/70 border border-gray-200/60 hover:border-gray-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#0C4A6E] flex-shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                        Primary Contact Number
                      </span>
                      <a
                        href={`tel:${selectedUserForDetails.phone || '+94 71 889 0012'}`}
                        className="font-mono text-[12.5px] font-semibold text-gray-900 hover:text-[#0C4A6E] hover:underline block truncate mt-0.5"
                      >
                        {selectedUserForDetails.phone || '+94 71 889 0012'}
                      </a>
                      <span className="text-[10.5px] text-gray-400 mt-0.5 block">Direct Mobile / Voice Line</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-gray-200">
              {/* Left: Delete & Deactivate Actions */}
              <div className="flex items-center gap-2">
                {!selectedUserForDetails.isPermanent ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenDeleteUser(selectedUserForDetails);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title="Delete User Account"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Delete User</span>
                    </button>

                    {selectedUserForDetails.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenDeactivateUser(selectedUserForDetails);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 transition-colors"
                        title="Deactivate Account with Reason"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_off</span>
                        <span>Deactivate</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleReactivateUser(selectedUserForDetails);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-sky-700 hover:text-sky-800 hover:bg-sky-50 border border-sky-200 transition-colors"
                        title="Reactivate Account"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Reactivate</span>
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">
                    Institutional Sovereign Account · Immutable
                  </span>
                )}
              </div>

              {/* Right: Close, Edit, Print */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditUser(selectedUserForDetails);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium text-sky-900 bg-white hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer"
                  title="Edit Official Profile"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">edit</span>
                  <span>Edit User</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUserCard(selectedUserForDetails)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/40 shadow-sm shadow-sky-600/30 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-white">badge</span>
                  <span>Print Devotee Card</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: EDIT PERMISSIONS MODAL            */}
      {/* ========================================== */}
      {isPermissionsOpen && selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-fade-up">
            <div className="px-5 py-4 flex items-center justify-between border-b bg-[#FAFAFA] border-[#E5E7EB]">
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827]">Edit Delegated Permissions</h3>
                <p className="text-[12px] text-[#6B7280]">
                  User: {selectedUserForPerms.name} • {selectedUserForPerms.designation || selectedUserForPerms.roleDisplay} ({selectedUserForPerms.committeeName || 'Dayaka Sabhawa'})
                </p>
              </div>
              <button
                onClick={() => setIsPermissionsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-[12px] text-[#6B7280]">Toggle module entitlements permitted under Canonical Governance Rule :</p>
              <div className="flex flex-col divide-y divide-[#E5E7EB]">
                <label className="py-3 flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#111827]">Dayaka Registry &amp; Family Trees</span>
                    <span className="text-[11px] text-[#6B7280]">Manage donor households, addresses, and village wards.</span>
                  </div>
                  <input defaultChecked className="w-4 h-4 rounded accent-[#1F2937]" type="checkbox" />
                </label>
                <label className="py-3 flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#111827]">Dana Calendar &amp; Heel Dana Approvals</span>
                    <span className="text-[11px] text-[#6B7280]">Assign morning and midday monastic offerings to sponsors.</span>
                  </div>
                  <input defaultChecked className="w-4 h-4 rounded accent-[#1F2937]" type="checkbox" />
                </label>
                <label className="py-3 flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#111827]">Broadcast Notices &amp; Poya Circulars</span>
                    <span className="text-[11px] text-[#6B7280]">Issue announcements on the temple web bulletin.</span>
                  </div>
                  <input defaultChecked className="w-4 h-4 rounded accent-[#1F2937]" type="checkbox" />
                </label>
                <label className="py-3 flex items-center justify-between cursor-pointer opacity-50 cursor-not-allowed">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#6B7280]">Security Audits &amp; Incumbent Governance</span>
                    <span className="text-[11px] text-[#6B7280]">Exclusive to Chief Monk (Immutable  lock).</span>
                  </div>
                  <input className="w-4 h-4 rounded cursor-not-allowed" disabled type="checkbox" />
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsPermissionsOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#F3F4F6] text-[#6B7280] hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Permissions updated successfully.');
                    setIsPermissionsOpen(false);
                  }}
                  className="btn-primary px-4 py-2 rounded-lg text-[12px] font-semibold"
                >
                  Save Role Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: EDIT USER MODAL                   */}
      {/* ========================================== */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up my-6">

            {/* Modal Header */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0C4A6E] via-[#0369A1] to-[#0C4A6E] text-white flex items-center justify-between border-b border-[#0284C7]/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-4 -translate-y-4">
                <span className="material-symbols-outlined text-[130px]">edit_note</span>
              </div>
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#0284C7] text-[#FFE885] ring-2 ring-[#0284C7]/50 ring-offset-2 ring-offset-[#0C4A6E] flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="text-[19px] font-bold text-white tracking-tight leading-snug">Edit Official Profile</h3>
                  <p className="text-[12px] text-sky-100/90 mt-0.5">
                    Official Devotee Record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditUser} className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto bg-[#F8F9FA]">

              {/* Section 1: Temple Institution Information */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">temple_buddhist</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Temple Institution
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Temple Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.templeName || 'Sri Sambodhi Maha Viharaya'}
                      onChange={(e) => setEditingUser({ ...editingUser, templeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Registration Code
                    </label>
                    <input
                      type="text"
                      value={editingUser.templeCode || 'TPL-2026-0482'}
                      onChange={(e) => setEditingUser({ ...editingUser, templeCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-[#0369A1] font-semibold shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Official Devotee Identity */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">person</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Official Devotee Identity
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUser.lastName}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Honorific Title / Alias
                    </label>
                    <input
                      type="text"
                      value={editingUser.alias || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, alias: e.target.value })}
                      placeholder='e.g. "Sunil Aiya" or "Chief Dayaka"'
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      National Identity Card (NIC) / Monastic ID
                    </label>
                    <input
                      type="text"
                      value={editingUser.nic || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, nic: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Contact Coordinates */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">contact_phone</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Contact Coordinates
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Contact Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Governance & Committee Assignment */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">account_tree</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Governance &amp; Committee Assignment
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Committee Name
                    </label>
                    <select
                      value={editingUser.committeeName}
                      onChange={(e) => setEditingUser({ ...editingUser, committeeName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-[12.5px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 cursor-pointer shadow-2xs transition-all"
                    >
                      <option value="Dayaka Sabhawa">Dayaka Sabhawa</option>
                      <option value="Event or Programme Committee">Event or Programme Committee</option>
                      <option value="Education & Youth Committee">Education &amp; Youth Committee</option>
                      <option value="Finance & Development Board">Finance &amp; Development Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Official Designation
                    </label>
                    <select
                      value={editingUser.designation}
                      onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-[12.5px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 cursor-pointer shadow-2xs transition-all"
                    >
                      <option value="President">President</option>
                      <option value="Vice-President">Vice-President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Committee Member">Committee Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Account Status
                    </label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser(editingUser ? { ...editingUser, status: e.target.value as 'active' | 'deactivated' | 'permanent' } : null)}
                      className="w-full px-3 py-2.5 rounded-lg text-[12.5px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 cursor-pointer shadow-2xs transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                      {editingUser.isPermanent && <option value="permanent">Permanent</option>}
                    </select>
                  </div>
                </div>

                {/* Conditional Deactivation Reason in Edit Modal */}
                {editingUser.status === 'deactivated' && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11.5px]">
                      <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
                      <span>Deactivation Specification</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-amber-900/80 mb-1">
                          Primary Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingUser.deactivateReason || 'Term Completed / Routine Committee Rotation'}
                          onChange={(e) => setEditingUser(editingUser ? { ...editingUser, deactivateReason: e.target.value } : null)}
                          className="w-full px-3 py-2 rounded-lg text-[12px] border border-amber-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 cursor-pointer shadow-2xs"
                        >
                          <option value="Term Completed / Routine Committee Rotation">Term Completed / Routine Committee Rotation</option>
                          <option value="Voluntary Resignation Requested">Voluntary Resignation Requested</option>
                          <option value="Relocation / Transferred from Parish">Relocation / Transferred from Parish</option>
                          <option value="Temporary Leave of Absence">Temporary Leave of Absence</option>
                          <option value="Disciplinary / Governance Review">Disciplinary / Governance Review</option>
                          <option value="Other Administrative Decision">Other Administrative Decision</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-amber-900/80 mb-1">
                          Reference Notes / Clergy Minute
                        </label>
                        <input
                          type="text"
                          value={editingUser.deactivateNotes || ''}
                          onChange={(e) => setEditingUser(editingUser ? { ...editingUser, deactivateNotes: e.target.value } : null)}
                          placeholder="e.g. Committee Minute #14/2026"
                          className="w-full px-3 py-2 rounded-lg text-[12px] border border-amber-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FFE885]">save</span>
                  <span>Save Profile Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: DELETE USER CONFIRMATION MODAL   */}
      {/* ========================================== */}
      {isDeleteUserOpen && deletingUser && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-red-200 animate-fade-up">

            {/* Header */}
            <div className="p-5 px-6 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">person_remove</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white">Delete User Account</h3>
                  <p className="text-[11px] text-red-100">Permanently Remove Governance Official</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteUserOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 bg-white">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {deletingUser.avatar || deletingUser.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-gray-900 truncate">{deletingUser.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-red-200 text-red-700">
                      {deletingUser.designation || 'Official'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    {deletingUser.committeeName} • {deletingUser.email}
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this user account? All administrative privileges, committee assignments, and login credentials will be revoked immediately.
              </p>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11.5px] text-amber-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600 flex-shrink-0">warning</span>
                <span>This action is permanent and cannot be undone.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteUserOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-gray-200 bg-white text-gray-700 border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm shadow-red-900/20"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 5: DEACTIVATE USER WITH REASON MODAL */}
      {/* ========================================== */}
      {isDeactivateUserOpen && deactivatingUser && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-up my-6">

            {/* Header: Royal Navy to Slate Gradient with Rose Badge */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0C4A6E] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between border-b border-sky-900/40 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[22px]">person_off</span>
                </div>
                <div>
                  <h3 className="font-serif text-[17.5px] font-bold text-white tracking-tight leading-snug">Deactivate Official Account</h3>
                  <p className="text-[12px] text-sky-100/80 mt-0.5">
                    Committee Governance Clearance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeactivateUserOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#F8FAFC]">

              {/* User Snapshot Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                  {deactivatingUser.avatar || deactivatingUser.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[14.5px] font-bold text-[#0F172A] truncate">{deactivatingUser.name}</h4>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7]">
                      {deactivatingUser.designation || 'Official'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 truncate mt-0.5">
                    {deactivatingUser.committeeName} • <span className="font-mono">{deactivatingUser.email}</span>
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1 font-mono font-medium">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">badge</span>
                      USR-{deactivatingUser.id}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">phone</span>
                      {deactivatingUser.phone || '077 123 4567'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Deactivation Reason Selector */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Deactivation Reason <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium border border-slate-300 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 bg-white text-[#0F172A] transition-all cursor-pointer"
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
                <p className="text-[11px] text-slate-500 mt-1.5">
                  This canonical reason will be permanently archived into the Viharaya ledger audit trail.
                </p>
              </div>

              {/* Administrative Notes / Clergy Minute Reference */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Reference Minute / Clergy Notes
                </label>
                <textarea
                  rows={2}
                  value={deactivateNotes}
                  onChange={(e) => setDeactivateNotes(e.target.value)}
                  placeholder="e.g. Dayaka Sabhawa Meeting Minute #14/2026. Suspension confirmed by Chief Incumbent..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] border border-slate-300 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 bg-white text-[#0F172A] transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Security & Access Impact Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[12px]">
                  <span className="material-symbols-outlined text-[17px] text-amber-600">shield</span>
                  <span>Governance &amp; Access Impact</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-950/80 pl-0.5 text-[11.5px] leading-relaxed">
                  <li>Portal login credentials and administrative privileges will be suspended immediately.</li>
                  <li>Historical contributions, dana ledger approvals, and merit records remain preserved.</li>
                  <li>This user account can be reactivated at any time by an authorized administrator.</li>
                </ul>
              </div>

              {/* Notify Devotee Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={deactivateNotifyEmail}
                  onChange={(e) => setDeactivateNotifyEmail(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#0284C7] border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0284C7]">mail</span>
                    <span>Send Official Formal Notification</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Dispatch an official system notice to <span className="font-mono text-slate-800 font-semibold">{deactivatingUser.email}</span> detailing the reason for suspension.
                  </div>
                </div>
              </label>

            </div>

            {/* Footer Actions */}
            <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeactivateUserOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-slate-200 bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivateUser}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] shadow-sm shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-white">person_off</span>
                <span>Confirm Deactivation</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PRINTABLE OFFICIAL DEVOTEE ID CARD MODAL        */}
      {/* ======================================================== */}
      {isUserCardModalOpen && selectedUserForCard && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up my-6">

            {/* Modal Header */}
            <div className="p-4 px-6 bg-[#0C4A6E] text-white flex items-center justify-between border-b border-[#0284C7]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/30 text-sky-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">badge</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">Official Devotee Identity Card</h3>
                  <p className="text-[11px] text-sky-200/80">Official Devotee Identity Card • Printable View</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Printable ID Card Container */}
            <div className="p-6 bg-gray-100/70 flex justify-center">
              <div
                id="printable-devotee-card"
                className="w-full max-w-md bg-gradient-to-br from-white via-sky-50 to-sky-100 rounded-2xl border-2 border-sky-300 p-5 shadow-xl relative overflow-hidden text-gray-900 select-text"
              >
                {/* Background Watermark */}
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.04] translate-x-8 translate-y-8">
                  <span className="material-symbols-outlined text-[240px] text-[#0C4A6E]">temple_buddhist</span>
                </div>

                {/* Card Top: Government / Ecclesiastical Header */}
                <div className="text-center pb-3 border-b-2 border-[#0284C7]/40 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <GoldenLotusIcon className="w-6 h-5 text-[#0369A1]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C4A6E]">
                      Democratic Socialist Republic of Sri Lanka
                    </span>
                    <GoldenLotusIcon className="w-6 h-5 text-[#0369A1]" />
                  </div>
                  <h4 className="text-[14.5px] font-bold text-[#0C4A6E] font-serif leading-tight">
                    {selectedUserForCard.templeName || 'Sri Sambodhi Maha Viharaya'}
                  </h4>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    Registration No: <span className="font-bold text-[#0369A1]">{selectedUserForCard.templeCode || 'TPL-2026-0482'}</span> • Department of Buddhist Affairs
                  </p>
                </div>

                {/* Card Middle: Devotee Photo & Official Info */}
                <div className="py-4 flex items-center gap-4 relative z-10">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-[#0C4A6E] border-2 border-[#0284C7] shadow-md flex items-center justify-center text-[#FFE885] font-bold text-2xl ring-4 ring-[#0C4A6E]/20">
                      {selectedUserForCard.avatar || selectedUserForCard.name?.charAt(0) || 'U'}
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-[#0C4A6E] text-[#FFE885] border border-[#0284C7] rounded text-[9px] font-mono font-bold">
                      USR-{selectedUserForCard.id}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {selectedUserForCard.designation || 'Committee Official'}
                      </span>
                      {selectedUserForCard.status === 'deactivated' ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">Suspended</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#166534]">Active</span>
                      )}
                    </div>

                    <h3 className="text-[16px] font-bold text-gray-900 font-serif leading-snug mt-1 truncate">
                      {selectedUserForCard.name || `${selectedUserForCard.firstName || ''} ${selectedUserForCard.lastName || ''}`}
                    </h3>

                    {selectedUserForCard.alias && (
                      <p className="text-[11px] text-gray-600 italic">"{selectedUserForCard.alias}"</p>
                    )}

                    <div className="text-[11px] text-gray-700 mt-1 space-y-0.5 font-sans">
                      <div className="truncate"><span className="text-gray-500 font-medium">Committee:</span> <strong>{selectedUserForCard.committeeName}</strong></div>
                      <div><span className="text-gray-500 font-medium">NIC:</span> <span className="font-mono">{selectedUserForCard.nic || 'Verified SL'}</span></div>
                      <div><span className="text-gray-500 font-medium">Phone:</span> <span className="font-mono">{selectedUserForCard.phone || '077 123 4567'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Temple Seal & Chief Incumbent Signature */}
                <div className="pt-3 border-t-2 border-[#0284C7]/40 flex items-end justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 rounded-full border-2 border-red-700/80 bg-red-50 text-red-800 flex flex-col items-center justify-center text-[7.5px] font-bold uppercase leading-none shadow-xs">
                      <span>SEAL</span>
                      <span className="text-[9px] font-mono">2026</span>
                      <span>VIHARA</span>
                    </div>
                    <div className="text-[9px] text-gray-500 leading-tight">
                      <div>Issued: 28 Oct 2026</div>
                      <div>Valid: Indefinite</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-[12px] font-serif text-[#0C4A6E] italic leading-tight underline decoration-[#0284C7]">
                      Ven. Dr. Medhananda Thero
                    </div>
                    <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                      Chief Incumbent
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-gray-200 bg-white flex items-center justify-between">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-emerald-700">verified</span>
                Verified Ecclesiastical Identity Credential
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-800 border border-sky-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-white">print</span>
                  <span>Print ID Card</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* TOAST NOTIFICATION                         */}
      {/* ========================================== */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-[90] max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-fade-up">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notificationMsg.type === 'success' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}>
            <span className="material-symbols-outlined text-[20px]">
              {notificationMsg.type === 'success' ? 'verified' : 'info'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#111827]">{notificationMsg.title}</h4>
            <p className="text-[11px] text-[#6B7280] mt-0.5">{notificationMsg.desc}</p>
          </div>
        </div>
      )}

    </div>
  );
}
