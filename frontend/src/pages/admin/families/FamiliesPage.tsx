import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import DashboardHeader from '../../../components/temple-admin/DashboardHeader';
import TempleFooterWave, { GoldenLotusIcon } from '../../../components/TempleFooterWave.tsx';
import {
  INITIAL_FAMILIES,
  INITIAL_INCOMING_TRANSFERS,
  AFFILIATED_TEMPLES,
  SRI_LANKA_DISTRICTS,
  type FamilyRecord
} from '../../../data/seed';

interface ClearanceCertState {
  family: FamilyRecord;
  transferInfo: {
    destinationDistrict?: string;
    destinationTemple?: string;
    destinationTempleCode?: string;
    transferReason?: string;
    effectiveDate?: string;
    authorizedBy?: string;
    clergyRemarks?: string;
    certificateNumber?: string;
  };
}

export default function FamiliesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [families, setFamilies] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('temple_registered_families') || '[]');
      return [...saved, ...INITIAL_FAMILIES];
    } catch {
      return INITIAL_FAMILIES;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener('toggle-temple-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-temple-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 650);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);

  // Modals state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFamilyCardModalOpen, setIsFamilyCardModalOpen] = useState(false);
  const [selectedFamilyForCard, setSelectedFamilyForCard] = useState<FamilyRecord | null>(null);
  const [isClearanceCertModalOpen, setIsClearanceCertModalOpen] = useState(false);
  const [selectedTransferCert, setSelectedTransferCert] = useState<ClearanceCertState | null>(null);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [editingFamily, setEditingFamily] = useState(null);
  const [deletingFamily, setDeletingFamily] = useState(null);

  // Deactivate modal form states
  const [deactivateReason, setDeactivateReason] = useState('Relocated outside parish boundary');
  const [deactivateNotes, setDeactivateNotes] = useState('');
  const [deactivateAcknowledged, setDeactivateAcknowledged] = useState(false);

  // Transfer modal form states
  const [transferData, setTransferData] = useState({
    destinationDistrict: 'Hambantota',
    destinationTemple: 'Bodhirukkaramaya — Walasmulla',
    destinationTempleCustom: '',
    destinationTempleCode: 'TPL-2024-0198',
    transferReason: 'Permanent Residence Relocation',
    effectiveDate: new Date().toISOString().split('T')[0],
    authorizedBy: 'Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)',
    issueCertificate: true,
    transferDanaHistory: true,
    notifyReceivingTemple: true,
    clergyRemarks: ''
  });

  // Incoming Transfers from other temples state
  const [incomingTransfers, setIncomingTransfers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('temple_incoming_transfers') || '[]');
      if (saved && Array.isArray(saved)) return saved;
      return INITIAL_INCOMING_TRANSFERS;
    } catch {
      return INITIAL_INCOMING_TRANSFERS;
    }
  });

  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [selectedIncoming, setSelectedIncoming] = useState(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  // Acceptance form state
  const [acceptFormData, setAcceptFormData] = useState({
    assignedFamilyId: 'FAM-0945',
    assignedWard: 'meda-gama',
    assignedVillage: 'Meda Gama',
    onboardDana: true,
    importMerits: true,
    sendWelcomeSms: true,
    clergyEndorsement: 'Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)',
    acceptanceNotes: ''
  });

  // Notification message
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Filtered families
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.firstName && f.firstName.toLowerCase().includes(q)) ||
        (f.lastName && f.lastName.toLowerCase().includes(q)) ||
        (f.templeName && f.templeName.toLowerCase().includes(q)) ||
        (f.templeCode && f.templeCode.toLowerCase().includes(q)) ||
        (f.alias && f.alias.toLowerCase().includes(q)) ||
        (f.address && f.address.toLowerCase().includes(q)) ||
        (f.village && f.village.toLowerCase().includes(q)) ||
        (f.district && f.district.toLowerCase().includes(q)) ||
        (f.postalCode && f.postalCode.includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        f.phone.includes(q);

      const matchesWard =
        wardFilter === 'all' ||
        f.ward === wardFilter ||
        (f.village && f.village.toLowerCase().includes(wardFilter.replace('-', ' ')));

      const matchesStatus =
        statusFilter === 'all' ||
        f.status === statusFilter;

      return matchesSearch && matchesWard && matchesStatus;
    });
  }, [families, searchQuery, wardFilter, statusFilter]);

  // Handlers
  const handleOpenDetails = (family) => {
    setSelectedFamily(family);
    setIsDetailsOpen(true);
  };

  // Edit Family Handlers - Navigates to Dedicated Full Edit Page
  const handleOpenEdit = (family: { id: string | number }) => {
    navigate(`/families/edit/${family.id}`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingFamily) return;

    const updatedName = editingFamily.name || `${editingFamily.firstName || ''} ${editingFamily.lastName || ''}`.trim();
    const finalized = { ...editingFamily, name: updatedName };

    setFamilies((prev) =>
      prev.map((f) => (f.id === finalized.id ? finalized : f))
    );
    if (selectedFamily && selectedFamily.id === finalized.id) {
      setSelectedFamily(finalized);
    }
    setIsEditOpen(false);
    setNotificationMsg({
      type: 'success',
      title: 'Family Details Updated',
      desc: `Ledger record for ${finalized.name} (${finalized.id}) updated successfully.`
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleAddMemberToEdit = () => {
    if (!editingFamily) return;
    setEditingFamily((prev) => ({
      ...prev,
      members: [
        ...(prev.members || []),
        { name: '', role: 'Family Member', age: 25, gender: 'Male' }
      ]
    }));
  };

  const handleRemoveMemberFromEdit = (idx) => {
    if (!editingFamily) return;
    setEditingFamily((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx)
    }));
  };

  const handleMemberChangeInEdit = (idx, field, value) => {
    if (!editingFamily) return;
    const updated = [...editingFamily.members];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingFamily((prev) => ({ ...prev, members: updated }));
  };

  // Delete Family Handlers
  const handleOpenDelete = (family) => {
    setDeletingFamily(family);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFamily) return;

    setFamilies((prev) => prev.filter((f) => f.id !== deletingFamily.id));
    if (selectedFamily && selectedFamily.id === deletingFamily.id) {
      setIsDetailsOpen(false);
      setSelectedFamily(null);
    }
    setIsDeleteOpen(false);
    setNotificationMsg({
      type: 'warning',
      title: 'Family Record Deleted',
      desc: `${deletingFamily.name} (${deletingFamily.id}) permanently removed from the ledger.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Card and Certificate Modal Handlers
  const handleOpenFamilyCard = (family: FamilyRecord) => {
    setSelectedFamilyForCard(family);
    setIsFamilyCardModalOpen(true);
  };

  const handleOpenClearanceCert = (family: FamilyRecord, customTransferData?: ClearanceCertState['transferInfo']) => {
    const info = customTransferData || {
      destinationDistrict: family.district || 'Hambantota',
      destinationTemple: transferData.destinationTemple === 'Other' ? (transferData.destinationTempleCustom || 'Affiliated Temple') : transferData.destinationTemple,
      destinationTempleCode: transferData.destinationTempleCode || 'TPL-2024-0198',
      transferReason: transferData.transferReason || 'Permanent Residence Relocation',
      effectiveDate: transferData.effectiveDate || new Date().toISOString().split('T')[0],
      authorizedBy: transferData.authorizedBy || 'Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)',
      clergyRemarks: transferData.clergyRemarks || 'All parish dues, Dana quotas, and records reconciled.'
    };
    setSelectedTransferCert({ family, transferInfo: info });
    setIsClearanceCertModalOpen(true);
  };

  // Export Registered Families to CSV
  const exportFamiliesToCSV = () => {
    const headers = [
      'Family ID',
      'Household Head Name',
      'Alias / Title',
      'Primary Phone',
      'Email',
      'Street Address',
      'Village',
      'District',
      'Postal Code',
      'Parish Ward',
      'Enrollment Mode',
      'Ledger Status',
      'Household Members Count',
      'Household Members Summary'
    ];

    const rows = families.map((f: Record<string, unknown>) => [
      `"${f.id || ''}"`,
      `"${((f.name as string) || `${(f.firstName as string) || ''} ${(f.lastName as string) || ''}`).replace(/"/g, '""')}"`,
      `"${((f.alias as string) || '').replace(/"/g, '""')}"`,
      `"${f.phone || ''}"`,
      `"${f.email || ''}"`,
      `"${((f.address as string) || '').replace(/"/g, '""')}"`,
      `"${((f.village as string) || '').replace(/"/g, '""')}"`,
      `"${((f.district as string) || '').replace(/"/g, '""')}"`,
      `"${f.postalCode || ''}"`,
      `"${f.ward || ''}"`,
      `"${f.enrollmentMode || ''}"`,
      `"${f.status || 'Active'}"`,
      f.members ? (f.members as unknown[]).length : 1,
      `"${((f.members as { name: string; role: string }[]) || []).map((m) => `${m.name} (${m.role})`).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Temple_Families_Ledger_2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotificationMsg({
      type: 'success',
      title: 'Family Ledger Exported',
      desc: `Exported ${families.length} devotee household records into CSV format.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Print Official Dayaka Ledger Report
  const handlePrintRegistry = () => {
    setNotificationMsg({
      type: 'info',
      title: 'Preparing Printable Roster',
      desc: `Formatting parish ledger with ${filteredFamilies.length} records for A4 print and PDF generation.`
    });
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleOpenDeactivate = (family) => {
    setSelectedFamily(family);
    setDeactivateReason('Relocated outside parish boundary');
    setDeactivateNotes('');
    setDeactivateAcknowledged(false);
    setIsDeactivateOpen(true);
  };

  const handleConfirmDeactivate = () => {
    if (!selectedFamily) return;
    const updated = families.map((f) =>
      f.id === selectedFamily.id
        ? {
          ...f,
          status: 'Deactivated',
          deactivationReason: deactivateReason,
          deactivationNotes: deactivateNotes,
          deactivatedAt: new Date().toISOString()
        }
        : f
    );
    setFamilies(updated);
    try {
      localStorage.setItem('temple_registered_families', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    if (selectedFamily) {
      setSelectedFamily({
        ...selectedFamily,
        status: 'Deactivated',
        deactivationReason: deactivateReason,
        deactivationNotes: deactivateNotes
      });
    }

    // Record into immutable audit logs
    const auditRecord = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      adminName: 'Nimal Perera',
      adminRole: 'Co-Administrator',
      targetType: 'Family',
      targetName: selectedFamily.name,
      targetId: selectedFamily.id,
      action: 'Deactivated',
      reason: `${deactivateReason} ${deactivateNotes ? `• ${deactivateNotes}` : ''}`,
      statusBadge: 'deactivated'
    };
    try {
      const existing = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
      localStorage.setItem('temple_audit_logs', JSON.stringify([auditRecord, ...existing]));
    } catch (err) {
      console.error(err);
    }

    setIsDeactivateOpen(false);
    setNotificationMsg({
      type: 'warning',
      title: 'Family Ledger Record Deactivated',
      desc: `${selectedFamily.name} (${selectedFamily.id}) has been formally deactivated in the parish ledger. Administrative action logged.`
    });
    setTimeout(() => setNotificationMsg(null), 5500);
  };

  const handleReactivateFamily = (family) => {
    const updated = families.map((f) =>
      f.id === family.id
        ? {
          ...f,
          status: 'Active',
          deactivationReason: undefined,
          deactivationNotes: undefined
        }
        : f
    );
    setFamilies(updated);
    try {
      localStorage.setItem('temple_registered_families', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save families to localStorage:', err);
    }

    if (selectedFamily && selectedFamily.id === family.id) {
      setSelectedFamily({
        ...selectedFamily,
        status: 'Active',
        deactivationReason: undefined,
        deactivationNotes: undefined
      });
    }

    // Record into immutable audit logs
    const auditRecord = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      adminName: 'Nimal Perera',
      adminRole: 'Co-Administrator',
      targetType: 'Family',
      targetName: family.name,
      targetId: family.id,
      action: 'Reactivated',
      reason: 'Reinstated to active parish register / devotions resumed',
      statusBadge: 'active'
    };
    try {
      const existing = JSON.parse(localStorage.getItem('temple_audit_logs') || '[]');
      localStorage.setItem('temple_audit_logs', JSON.stringify([auditRecord, ...existing]));
    } catch (err) {
      console.error('Failed to update audit logs:', err);
    }

    setNotificationMsg({
      type: 'success',
      title: 'Family Account Reactivated',
      desc: `${family.name} (${family.id}) has been successfully reinstated into the active Dayaka register.`
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleOpenTransfer = (family) => {
    setSelectedFamily(family);
    setTransferData({
      destinationDistrict: family.district || 'Hambantota',
      destinationTemple: 'Bodhirukkaramaya — Walasmulla',
      destinationTempleCustom: '',
      destinationTempleCode: 'TPL-2024-0198',
      transferReason: 'Permanent Residence Relocation',
      effectiveDate: new Date().toISOString().split('T')[0],
      authorizedBy: 'Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)',
      issueCertificate: true,
      transferDanaHistory: true,
      notifyReceivingTemple: true,
      clergyRemarks: ''
    });
    setIsTransferOpen(true);
  };

  const handleDestinationTempleSelect = (val) => {
    if (val === 'Other') {
      setTransferData((prev) => ({
        ...prev,
        destinationTemple: 'Other',
        destinationTempleCode: ''
      }));
    } else {
      const match = AFFILIATED_TEMPLES.find((t) => t.name === val);
      setTransferData((prev) => ({
        ...prev,
        destinationTemple: val,
        destinationTempleCode: match ? match.code : '',
        destinationDistrict: match ? match.district : prev.destinationDistrict
      }));
    }
  };

  const handleConfirmTransfer = (e) => {
    e.preventDefault();
    if (!selectedFamily) return;
    const destName = transferData.destinationTemple === 'Other'
      ? (transferData.destinationTempleCustom || 'Affiliated Temple')
      : transferData.destinationTemple;

    const certNo = `CERT-TR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = families.map((f) =>
      f.id === selectedFamily.id
        ? {
          ...f,
          status: 'Transferred',
          enrollmentMode: `Transferred to ${destName.split('—')[0].trim()}`,
          enrollmentType: 'transfer',
          transferData: {
            destinationTemple: destName,
            destinationDistrict: transferData.destinationDistrict,
            destinationTempleCode: transferData.destinationTempleCode,
            transferReason: transferData.transferReason,
            effectiveDate: transferData.effectiveDate,
            authorizedBy: transferData.authorizedBy,
            clergyRemarks: transferData.clergyRemarks,
            certificateNumber: certNo
          }
        }
        : f
    );
    setFamilies(updated);
    try {
      localStorage.setItem('temple_registered_families', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save families to localStorage:', err);
    }

    setIsTransferOpen(false);
    setNotificationMsg({
      type: 'success',
      title: 'Inter-Temple Transfer Dispatched',
      desc: `Official clearance issued for ${selectedFamily.name} (${selectedFamily.id}) to ${destName}. Clearance Certificate #${certNo} generated.`
    });
    setTimeout(() => setNotificationMsg(null), 6500);
  };

  // Incoming Transfer Handlers
  const handleStartAcceptIncoming = (incoming) => {
    setSelectedIncoming(incoming);
    const nextIdNum = Math.floor(820 + Math.random() * 170);
    setAcceptFormData({
      assignedFamilyId: `FAM-0${nextIdNum}`,
      assignedWard: incoming.ward || 'meda-gama',
      assignedVillage: incoming.newVillage || 'Meda Gama',
      onboardDana: true,
      importMerits: true,
      sendWelcomeSms: true,
      clergyEndorsement: 'Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)',
      acceptanceNotes: `Transferred under clearance cert ${incoming.certificateNumber} from ${incoming.originTempleName}.`
    });
    setIsAcceptModalOpen(true);
  };

  const handleConfirmAcceptIncoming = (e) => {
    e.preventDefault();
    if (!selectedIncoming) return;

    const newEnrolledFamily = {
      key: `transfer_${Date.now()}`,
      id: acceptFormData.assignedFamilyId,
      templeName: 'Sri Sambodhi Maha Viharaya',
      templeCode: 'TPL-2026-0482',
      firstName: selectedIncoming.firstName,
      lastName: selectedIncoming.lastName,
      name: selectedIncoming.name,
      alias: `Transferred from ${selectedIncoming.originTempleName.split('—')[0].trim()}`,
      email: selectedIncoming.email,
      phone: selectedIncoming.phone,
      address: selectedIncoming.newAddress,
      village: acceptFormData.assignedVillage,
      district: selectedIncoming.district || 'Hambantota',
      postalCode: selectedIncoming.postalCode || '82200',
      ward: acceptFormData.assignedWard,
      status: 'Active',
      enrollmentMode: `Transferred from ${selectedIncoming.originTempleName.split('—')[0].trim()}`,
      enrollmentType: 'transfer',
      certificateNumber: selectedIncoming.certificateNumber,
      members: selectedIncoming.members || []
    };

    const updatedFamilies = [newEnrolledFamily, ...families];
    setFamilies(updatedFamilies);
    try {
      localStorage.setItem('temple_registered_families', JSON.stringify(updatedFamilies));
    } catch (err) {
      console.error(err);
    }

    const remainingIncoming = incomingTransfers.filter((t) => t.id !== selectedIncoming.id);
    setIncomingTransfers(remainingIncoming);
    try {
      localStorage.setItem('temple_incoming_transfers', JSON.stringify(remainingIncoming));
    } catch (err) {
      console.error(err);
    }

    setIsAcceptModalOpen(false);
    if (remainingIncoming.length === 0) {
      setIsIncomingModalOpen(false);
    }

    setNotificationMsg({
      type: 'success',
      title: 'Parish Transfer Accepted & Enrolled',
      desc: `${selectedIncoming.name} from ${selectedIncoming.originTempleName.split('—')[0].trim()} has been formally enrolled into the Dayaka Ledger as ${acceptFormData.assignedFamilyId}.`
    });
    setTimeout(() => setNotificationMsg(null), 6500);
  };

  const handleRejectIncoming = (incomingId, name) => {
    if (!window.confirm(`Are you sure you want to decline the incoming transfer request for ${name}?`)) return;
    const remainingIncoming = incomingTransfers.filter((t) => t.id !== incomingId);
    setIncomingTransfers(remainingIncoming);
    try {
      localStorage.setItem('temple_incoming_transfers', JSON.stringify(remainingIncoming));
    } catch (err) {
      console.error(err);
    }
    setNotificationMsg({
      type: 'warning',
      title: 'Transfer Request Returned',
      desc: `Incoming transfer request for ${name} was returned with notification dispatched to the origin viharaya.`
    });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://temple.lk/join/TMPL-00482');
    alert('Temple enrollment direct link copied to clipboard!');
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

        {/* Toast Notification (Floating Glassmorphism Animated Alert) */}
        {notificationMsg && (
          <div className="fixed top-20 right-4 sm:right-6 z-[100] max-w-md w-full bg-white/95 backdrop-blur-md border border-sky-300 rounded-2xl shadow-[0_16px_36px_rgba(2,132,199,0.18)] p-4 overflow-hidden animate-fade-up">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${notificationMsg.type === 'success'
                ? 'bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white'
                : notificationMsg.type === 'error'
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {notificationMsg.type === 'success' ? 'check_circle' : notificationMsg.type === 'error' ? 'error' : 'info'}
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h5 className="text-[13.5px] font-bold text-[#0C4A6E] leading-tight">{notificationMsg.title}</h5>
                <p className="text-[12px] text-slate-600 mt-1 leading-snug">{notificationMsg.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationMsg(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-100">
              <div className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] toast-progress-bar"></div>
            </div>
          </div>
        )}

        {/* Families Page Main Content Body (Matched to Dashboard Width & Styling) */}
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
                {t('families.title', 'Dayaka Family Registry')},
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
          {/* SECTION 2: FIVE STAT KPI CARDS (COMPACT & BALANCED)      */}
          {/* ======================================================== */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 animate-fade-up delay-1">
            {/* 1. Total Registered Families (Sky Blue) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full flex items-center justify-center bg-[#E0F2FE] text-[#0284C7] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">family_restroom</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium truncate">{t('families.kpi.total', 'Total Families')}</div>
                  <div className="text-[16px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">{families.length}</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>↑ 12 active</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:block material-symbols-outlined text-sky-400 text-[17px]">chevron_right</span>
            </div>

            {/* 2. Active Households (Mint Green) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full flex items-center justify-center bg-[#DCFCE7] text-[#16A34A] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">home</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium truncate">{t('families.kpi.active', 'Active Dayakas')}</div>
                  <div className="text-[16px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {families.filter(f => f.status === 'Active').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>{t('families.kpi.parish', 'Parish Devotees')}</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:block material-symbols-outlined text-emerald-400 text-[17px]">chevron_right</span>
            </div>

            {/* 3. Incoming Transfers (Warm Honey Amber) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-amber-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full flex items-center justify-center bg-[#FEF3C7] text-[#D97706] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">move_to_inbox</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium truncate">{t('families.kpi.transfersIn', 'Transfers In')}</div>
                  <div className="text-[16px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">{incomingTransfers.length}</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-[#D97706] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>{t('families.kpi.pending', 'Pending')} ({incomingTransfers.length})</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:block material-symbols-outlined text-amber-400 text-[17px]">chevron_right</span>
            </div>

            {/* 4. Parish Wards (Soft Lilac / Purple) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full flex items-center justify-center bg-[#F3E8FF] text-[#9333EA] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">map</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium truncate">{t('families.kpi.wards', 'Parish Wards')}</div>
                  <div className="text-[16px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">4 Wards</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-purple-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>{t('families.kpi.synced', 'Villages Synced')}</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:block material-symbols-outlined text-purple-400 text-[17px]">chevron_right</span>
            </div>

            {/* 5. Deactivated / Transferred (Soft Rose Pink) */}
            <div className="bg-white rounded-xl p-2.5 sm:p-3.5 border border-[#EDECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-rose-300 transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-full flex items-center justify-center bg-[#FFE4E6] text-[#E11D48] shadow-2xs flex-shrink-0">
                  <span className="material-symbols-outlined text-[17px] sm:text-[20px]">archive</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium truncate">{t('families.kpi.deactivated', 'Deactivated')}</div>
                  <div className="text-[16px] sm:text-[22px] font-bold text-gray-900 leading-tight mt-0.5">
                    {families.filter(f => f.status === 'Deactivated' || f.status === 'Transferred').length}
                  </div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>{t('families.kpi.archived', 'Archived Records')}</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:block material-symbols-outlined text-rose-400 text-[17px]">chevron_right</span>
            </div>
          </section>

          {/* Action Buttons Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-up">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsIncomingModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all hover:bg-blue-50 bg-white text-[#1E40AF] border border-blue-200 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#2563EB]">move_to_inbox</span>
                <span>{t('families.kpi.transfersIn', 'Transfers In')} ({incomingTransfers.length})</span>
              </button>
              <button
                type="button"
                onClick={exportFamiliesToCSV}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all hover:bg-sky-50 bg-white text-[#0C4A6E] border border-sky-200 shadow-2xs hover:border-[#0284C7] cursor-pointer"
                title="Download complete registry in CSV format"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0284C7]">download</span>
                <span>{t('families.btn.exportCsv', 'Export (CSV)')}</span>
              </button>
              <button
                type="button"
                onClick={handlePrintRegistry}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all hover:bg-sky-50 bg-white text-slate-700 border border-slate-200 shadow-2xs hover:border-[#0284C7] cursor-pointer"
                title="Print formal parish Dayaka Ledger report / PDF"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-600">print</span>
                <span>{t('families.btn.printReport', 'Print Report')}</span>
              </button>
              <button
                type="button"
                onClick={handleRefreshData}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all hover:bg-sky-50 bg-white text-[#0284C7] border border-sky-200 shadow-2xs hover:border-[#0284C7] cursor-pointer"
                title="Refresh Ledger Data"
              >
                <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                <span className="hidden md:inline">{t('families.btn.refresh', 'Refresh')}</span>
              </button>
            </div>
            <Link
              to="/families/add"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-[#38BDF8]/50 shadow-sm cursor-pointer shadow-sky-600/30"
            >
              <span className="material-symbols-outlined text-[18px] text-white">person_add</span>
              <span>+ {t('families.addFamily', 'Register Family')}</span>
            </Link>
          </div>

          {/* Featured Temple QR Code Card */}
          <div className="card relative overflow-hidden animate-fade-up delay-1 border border-sky-100">
            <div className="h-1 w-full bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0284C7]"></div>
            <div className="p-3.5 sm:p-6 lg:p-7 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 sm:gap-6 relative bg-white">
              <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] translate-x-12 translate-y-12">
                <svg className="text-[#0284C7]" fill="currentColor" height="420" viewBox="0 0 100 100" width="420">
                  <path d="M50 5 C55 25 75 35 95 50 C75 65 55 75 50 95 C45 75 25 65 5 50 C25 35 45 25 50 5 Z"></path>
                </svg>
              </div>

              {/* QR Code Container */}
              <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                <div className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-2xs flex flex-col items-center border bg-[#F0F9FF] border-sky-100">
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg p-1.5 flex items-center justify-center shadow-inner bg-white">
                    <svg className="w-full h-full text-[#0C4A6E]" fill="currentColor" viewBox="0 0 100 100">
                      <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="5" width="28" x="4" y="4"></rect>
                      <rect height="14" rx="1" width="14" x="11" y="11"></rect>
                      <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="5" width="28" x="68" y="4"></rect>
                      <rect height="14" rx="1" width="14" x="75" y="11"></rect>
                      <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="5" width="28" x="4" y="68"></rect>
                      <rect height="14" rx="1" width="14" x="11" y="75"></rect>
                      <rect height="6" width="6" x="38" y="6"></rect>
                      <rect height="6" width="6" x="48" y="10"></rect>
                      <rect height="6" width="6" x="56" y="4"></rect>
                      <rect height="6" width="6" x="38" y="18"></rect>
                      <rect height="6" width="6" x="56" y="22"></rect>
                      <rect height="6" width="6" x="6" y="38"></rect>
                      <rect height="6" width="6" x="16" y="46"></rect>
                      <rect height="6" width="6" x="24" y="38"></rect>
                      <rect height="6" width="6" x="4" y="54"></rect>
                      <rect height="6" width="6" x="22" y="58"></rect>
                      <rect height="6" width="6" x="70" y="38"></rect>
                      <rect height="6" width="6" x="88" y="42"></rect>
                      <rect height="6" width="6" x="78" y="50"></rect>
                      <rect height="6" width="6" x="68" y="60"></rect>
                      <rect height="6" width="6" x="86" y="58"></rect>
                      <rect height="6" width="6" x="38" y="74"></rect>
                      <rect height="6" width="6" x="50" y="82"></rect>
                      <rect height="6" width="6" x="40" y="90"></rect>
                      <rect height="6" width="6" x="58" y="88"></rect>
                      <rect height="6" width="6" x="74" y="72"></rect>
                      <rect height="6" width="6" x="88" y="80"></rect>
                      <rect height="6" width="6" x="80" y="90"></rect>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full p-0.5 shadow-xs flex items-center justify-center border bg-white border-sky-200">
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-sky-100">
                          <span className="material-symbols-outlined text-[13px] text-[#0284C7]">spa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="block sm:hidden min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#0284C7] tracking-wider block">Scan to Join</span>
                  <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Temple Dayaka QR</h4>
                  <span className="text-[10.5px] text-sky-700 font-mono mt-0.5 block">TMPL-00482</span>
                </div>
              </div>

              {/* QR Details */}
              <div className="flex flex-col flex-1 min-w-0 pr-0 xl:pr-4">
                <div className="hidden sm:flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[19px] text-[#0284C7]">qr_code_scanner</span>
                  <h2 className="text-[15px] sm:text-[17px] font-bold text-[#0C4A6E]">Temple Registration &amp; Inter-Temple Transfer QR</h2>
                </div>
                <p className="text-[11px] sm:text-[12.5px] leading-relaxed mb-3 text-sky-800/80">
                  Devotees can scan this QR code with their mobile devices to self-register or automatically transfer household records.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="p-2 sm:p-2.5 rounded-lg flex flex-col border bg-[#F0F9FF] border-sky-100">
                    <span className="text-[9px] uppercase font-bold text-sky-700">Temple ID</span>
                    <span className="font-mono text-[11px] font-bold text-[#0C4A6E] mt-0.5">TMPL-WALASMULLA-00482</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg flex flex-col border bg-[#F0F9FF] border-sky-100">
                    <span className="text-[9px] uppercase font-bold text-sky-700">Direct URL</span>
                    <a className="text-[11px] hover:underline truncate font-medium text-[#0284C7] mt-0.5" href="#copy" onClick={(e) => { e.preventDefault(); handleCopyLink(); }}>
                      temple.lk/join/TMPL-00482
                    </a>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg flex flex-col border bg-[#F0F9FF] border-sky-100">
                    <span className="text-[9px] uppercase font-bold text-sky-700">Registered Families</span>
                    <span className="text-[12px] font-bold text-[#0C4A6E] mt-0.5">{families.length} Households</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-row sm:flex-row xl:flex-col justify-center gap-2 flex-shrink-0 w-full sm:w-auto xl:w-48">
                <button
                  type="button"
                  onClick={() => setIsFlyerModalOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] sm:text-[12.5px] text-white font-semibold transition-all bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 border border-sky-400/50 shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-white">print</span>
                  <span>Print Flyer</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] sm:text-[12.5px] font-semibold transition-all hover:bg-sky-50 bg-white text-sky-950 border border-sky-200 shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-sky-600">link</span>
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Duplicate Account Prevention Notice Banner */}
          <div className="rounded-xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3.5 shadow-2xs border bg-[#FAFAFA] border-[#E5E7EB] animate-fade-up delay-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#D4F0DC] text-[#0C4A6E]">
              <span className="material-symbols-outlined text-[17px] sm:text-[19px]">shield_with_heart</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[12px] sm:text-[13px] font-bold tracking-tight text-[#111827]">System Integrity Safeguard</h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider text-white bg-[#0C4A6E]">Active</span>
              </div>
              <p className="text-[11px] sm:text-[12px] mt-0.5 leading-relaxed text-[#6B7280]">
                Strict duplicate prevention is enforced against mobile primary contacts and household identities across all affiliated temples.
              </p>
            </div>
          </div>

          {/* Pending Incoming Transfers Notice Banner */}
          {incomingTransfers.length > 0 && (
            <div className="rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs border bg-blue-50/80 border-blue-200 text-[#1E40AF] animate-fade-up">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[18px]">move_to_inbox</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[12px] sm:text-[13px] font-bold text-[#1E3A8A]">
                      {incomingTransfers.length} Incoming Transfer Request{incomingTransfers.length > 1 ? 's' : ''}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider bg-blue-200 text-blue-900">
                      Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 truncate mt-0.5">
                    Transferred from {incomingTransfers.map((t) => t.originTempleName.split('—')[0].trim()).join(' & ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomingModalOpen(true)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold bg-[#0C4A6E] hover:bg-[#075985] text-white flex-shrink-0 flex items-center justify-center gap-1 shadow-2xs transition-all border border-[#0284C7]/40 cursor-pointer"
              >
                <span>Review &amp; Accept</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Dayaka Family Registry Table Card */}
          <div className="card overflow-hidden flex flex-col animate-fade-up delay-2">

            {/* Filter and Search Header */}
            <div className="p-3 sm:p-4 lg:p-5 flex flex-col gap-2.5 border-b bg-[#FAFAFA] border-[#E5E7EB]">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                <div className="flex flex-1 items-center gap-2 max-w-4xl">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-0">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-[#6B7280]">search</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-[13.5px] focus:outline-none transition-all bg-white border border-[#E5E7EB] text-[#111827]"
                      placeholder={t('families.searchPlaceholder', 'Search devotee name, phone, village, or ID...')}
                    />
                  </div>

                  {/* Mobile Trigger Button for Quick Filter Bottom Sheet */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterDrawerOpen(true)}
                    className="md:hidden flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[11.5px] font-bold bg-white border border-gray-300 text-[#0C4A6E] shadow-2xs hover:bg-gray-50 flex-shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#0C4A6E]">tune</span>
                    <span>Filters</span>
                    {(wardFilter !== 'all' || statusFilter !== 'all') && (
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                    )}
                  </button>

                  {/* Desktop Ward Filter */}
                  <div className="hidden md:block relative flex-shrink-0 w-48">
                    <select
                      value={wardFilter}
                      onChange={(e) => setWardFilter(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-[13px] focus:outline-none cursor-pointer bg-white border border-[#E5E7EB] text-[#111827]"
                    >
                      <option value="all">{t('families.filter.allWards', 'All Wards / Villages')}</option>
                      <option value="temple-road">Temple Road</option>
                      <option value="north-ward">North Ward</option>
                      <option value="pahala-gama">Pahala Gama</option>
                      <option value="meda-gama">Meda Gama</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-[#6B7280]">expand_more</span>
                  </div>

                  {/* Desktop Status Filter */}
                  <div className="hidden md:block relative flex-shrink-0 w-40">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-[13px] focus:outline-none cursor-pointer bg-white border border-[#E5E7EB] text-[#111827]"
                    >
                      <option value="all">{t('families.filter.allStatus', 'All Statuses')}</option>
                      <option value="Active">{t('families.filter.active', 'Active Only')}</option>
                      <option value="Transferred">{t('families.filter.inactive', 'Transferred')}</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-[#6B7280]">expand_more</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                  <span className="text-[13px] font-medium text-[#6B7280]">{filteredFamilies.length} Registered Households</span>
                </div>
              </div>

              {/* Active Filter Chips Strip */}
              {(wardFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11.5px]">
                  <span className="text-gray-500 font-medium">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800 font-medium">
                      <span>"{searchQuery}"</span>
                      <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-600">×</button>
                    </span>
                  )}
                  {wardFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0C4A6E] font-medium border border-emerald-200">
                      <span>Ward: {wardFilter}</span>
                      <button type="button" onClick={() => setWardFilter('all')} className="hover:text-red-600">×</button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium border border-amber-200">
                      <span>Status: {statusFilter}</span>
                      <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-red-600">×</button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setWardFilter('all');
                      setStatusFilter('all');
                    }}
                    className="text-[#92400E] hover:underline font-semibold text-[11px] ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[11.5px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 pl-6 font-bold min-w-[220px]">{t('families.table.head', 'Head of Household')}</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">{t('families.table.contact', 'Contact Coordinates')}</th>
                    <th className="py-3.5 px-4 font-bold min-w-[200px]">{t('families.table.ward', 'Address & Village')}</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">{t('families.table.members', 'Enrollment Mode')}</th>
                    <th className="py-3.5 px-4 font-bold whitespace-nowrap">{t('families.table.status', 'Status')}</th>
                    <th className="py-3.5 px-4 pr-6 font-bold text-right whitespace-nowrap">{t('families.table.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[14px] border-slate-100">
                  {isLoading ? (
                    // 6 Skeleton Loading Rows with gentle Shimmer effect
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={`skel-row-${idx}`} className="animate-pulse bg-white border-b border-slate-100">
                        <td className="py-4 px-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex-shrink-0"></div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="h-4 w-36 bg-slate-200 rounded"></div>
                              <div className="h-3 w-20 bg-slate-100 rounded"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-36 bg-slate-100 rounded"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-32 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-20 bg-slate-100 rounded"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-6 w-20 bg-slate-200 rounded-full mx-auto"></div>
                        </td>
                        <td className="py-4 px-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                            <div className="w-16 h-8 rounded-lg bg-slate-200"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredFamilies.length === 0 ? (
                    // Rich Serene Empty State
                    <tr>
                      <td colSpan={6} className="py-14 px-6 bg-gradient-to-b from-sky-50/40 via-white to-slate-50/40 text-center">
                        <div className="max-w-md mx-auto flex flex-col items-center text-center space-y-3.5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 via-sky-50 to-blue-50 border border-sky-200/90 flex items-center justify-center text-[#0284C7] shadow-sm">
                            <span className="material-symbols-outlined text-[34px]">person_search</span>
                          </div>
                          <div>
                            <h4 className="text-[16px] font-bold text-slate-800 tracking-tight">
                              No Devotee Records Found
                            </h4>
                            <p className="text-[12.5px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                              {searchQuery ? (
                                <>
                                  No records matching <span className="font-semibold text-sky-900 bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200">"{searchQuery}"</span> were found in this parish ward.
                                </>
                              ) : (
                                "No devotee households match your current ward or status filter criteria."
                              )}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setWardFilter('all');
                                setStatusFilter('all');
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-white border border-sky-200 text-[#0284C7] hover:bg-sky-50 transition-all shadow-2xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                              <span>Clear Filters</span>
                            </button>
                            <Link
                              to="/families/add"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-all shadow-sm shadow-sky-600/25 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">person_add</span>
                              <span>+ Register New Family</span>
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFamilies.map((fam) => {
                      const isDeactivated = fam.status === 'Deactivated';
                      return (
                        <tr key={fam.id} className={`hover:bg-sky-50/40 transition-colors group ${isDeactivated ? 'bg-slate-50/60' : ''}`}>

                          {/* 1. Household Head First & Last Name */}
                          <td className="py-4 px-4 pl-6">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(fam)}
                                className={`text-left text-[14px] font-bold hover:underline transition-colors ${isDeactivated ? 'line-through text-slate-400' : 'text-[#0F172A] hover:text-[#0284C7]'}`}
                                title="Click to view all details"
                              >
                                {fam.name || `${fam.firstName || ''} ${fam.lastName || ''}`}
                              </button>
                              <span className="text-[11.5px] text-slate-500 mt-0.5">{fam.alias || 'Devotee Family'}</span>
                            </div>
                          </td>

                          {/* 2. Contact Phone No. & Email */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col text-[11.5px] space-y-0.5">
                              <span className="font-mono flex items-center gap-1.5 text-[#0F172A] font-semibold text-[12.5px]">
                                <span className="material-symbols-outlined text-[15px] text-[#0284C7]">call</span>
                                {fam.phone}
                              </span>
                              {fam.email && (
                                <span className="font-mono flex items-center gap-1.5 text-slate-500">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                                  {fam.email}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Address, Village, District, Postal Code */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col text-[12.5px]">
                              <span className="text-[#0F172A] font-semibold">{fam.address}</span>
                              <span className="text-[11.5px] text-slate-500 mt-0.5">
                                {fam.village || 'Walasmulla'} • {fam.district || 'Hambantota'} ({fam.postalCode || '82200'})
                              </span>
                            </div>
                          </td>

                          {/* 4. Enrollment Mode */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {fam.enrollmentType === 'qr' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">qr_code_2</span>
                                {fam.enrollmentMode}
                              </span>
                            ) : fam.enrollmentType === 'transfer' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                <span className="material-symbols-outlined text-[14px] text-sky-600">swap_horiz</span>
                                {fam.enrollmentMode}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                <span className="material-symbols-outlined text-[14px] text-purple-600">history_edu</span>
                                {fam.enrollmentMode}
                              </span>
                            )}
                          </td>

                          {/* 5. Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {fam.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : fam.status === 'Transferred' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="material-symbols-outlined text-[13px] text-amber-600">swap_horiz</span>
                                Transferred
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Deactivated
                              </span>
                            )}
                          </td>

                          {/* 6. Actions */}
                          <td className="py-4 px-4 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(fam)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-sky-100 text-[#0284C7] bg-sky-50 border border-sky-200 shadow-2xs cursor-pointer"
                                title="View All Details"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(fam)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 text-slate-700 bg-white border border-slate-200 shadow-2xs cursor-pointer"
                                title="Edit Family Record"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>

                              {/* Transfer or Clearance Certificate Button */}
                              {fam.status === 'Transferred' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenClearanceCert(fam, fam.transferData)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Print Parish Clearance Certificate"
                                >
                                  <span className="material-symbols-outlined text-[15px]">description</span>
                                  <span>Clearance</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenTransfer(fam)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors hover:bg-slate-100 bg-white border border-slate-200 text-slate-700 shadow-2xs cursor-pointer"
                                  title="Transfer to Another Temple"
                                >
                                  Transfer
                                </button>
                              )}

                              {/* Deactivate / Reactivate Button */}
                              {fam.status === 'Active' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeactivate(fam)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-2xs cursor-pointer"
                                  title="Deactivate"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReactivateFamily(fam)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200"
                                  title="Reactivate Account"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(fam)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-100 text-[#B91C1C] bg-[#FEE2E2] border border-red-200/60"
                                title="Delete Family Record"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Card Grid (Auto-switches on mobile devices) */}
            <div className="block md:hidden p-2.5 sm:p-4 bg-[#F0F9FF] space-y-2.5">
              {isLoading ? (
                // Mobile Skeleton Cards
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`mskel-${idx}`} className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs animate-pulse space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0"></div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="h-4 w-36 bg-slate-200 rounded"></div>
                          <div className="h-3 w-20 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-3 w-48 bg-slate-100 rounded"></div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <div className="h-8 flex-1 bg-slate-200 rounded-xl"></div>
                      <div className="h-8 flex-1 bg-slate-100 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : filteredFamilies.length === 0 ? (
                // Mobile Rich Empty State
                <div className="py-12 px-4 text-center bg-white rounded-2xl border border-sky-100 shadow-xs space-y-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mx-auto shadow-xs">
                    <span className="material-symbols-outlined text-[32px]">person_search</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800">No Devotee Households Found</h4>
                    <p className="text-[12px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      {searchQuery ? `No records matching "${searchQuery}".` : 'No records match your active search filters.'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setWardFilter('all');
                        setStatusFilter('all');
                      }}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-white border border-sky-200 text-[#0284C7] hover:bg-sky-50 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                    <Link
                      to="/families/add"
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-all shadow-sm cursor-pointer"
                    >
                      + Register Family
                    </Link>
                  </div>
                </div>
              ) : (
                filteredFamilies.map((fam) => {
                  const isDeactivated = fam.status === 'Deactivated';
                  return (
                    <div
                      key={fam.id}
                      className={`bg-white rounded-2xl p-3 sm:p-3.5 border border-[#E8E6DF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#0284C7]/50 transition-all ${isDeactivated ? 'opacity-75 bg-gray-50/70' : ''
                        }`}
                    >
                      {/* Card Top: Avatar, Name, ID, Status */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284C7] border border-sky-300 flex items-center justify-center font-bold text-[13px] shadow-2xs flex-shrink-0">
                            {fam.name ? fam.name.charAt(0).toUpperCase() : 'F'}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(fam)}
                              className={`text-left text-[14px] font-bold truncate block leading-tight ${isDeactivated ? 'line-through text-slate-400' : 'text-[#0F172A] hover:text-[#0284C7]'
                                }`}
                            >
                              {fam.name || `${fam.firstName || ''} ${fam.lastName || ''}`}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[9.5px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                                {fam.id}
                              </span>
                              <span className="text-[11.5px] text-slate-500 truncate">
                                {fam.village || 'Walasmulla'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {fam.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : fam.status === 'Transferred' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="material-symbols-outlined text-[11px] text-amber-600">swap_horiz</span>
                              Transferred
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Deactivated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compact Metadata Strip */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                        <div className="flex items-center gap-1 truncate text-gray-700">
                          <span className="material-symbols-outlined text-[13px] text-[#0284C7] flex-shrink-0">location_on</span>
                          <span className="truncate">{fam.address}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end font-mono text-[10.5px]">
                          <span className="material-symbols-outlined text-[13px] text-[#0C4A6E] flex-shrink-0">call</span>
                          <a href={`tel:${fam.phone}`} className="text-[#0C4A6E] font-semibold hover:underline truncate">
                            {fam.phone}
                          </a>
                        </div>
                      </div>

                      {/* Secondary Badges Strip */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="material-symbols-outlined text-[11px] text-gray-500">group</span>
                            <span>{fam.members?.length || 1} Members</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            <span>{fam.enrollmentMode}</span>
                          </span>
                        </div>

                        {fam.transferData && (
                          <span className="text-[9.5px] font-medium text-amber-800 truncate max-w-[120px]">
                            → {fam.transferData.destinationTempleName.split('—')[0]}
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons (2-Row Responsive Clean Architecture) */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                        {/* Row 1: Primary Action & Quick Edit */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(fam)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-[11.5px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap shadow-sky-600/30"
                          >
                            <span className="material-symbols-outlined text-[15px] text-white">visibility</span>
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fam)}
                            className="py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-[#92400E] border border-amber-200/80 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Row 2: Secondary Utilities (Cert/Transfer, Status, Delete) */}
                        <div className="flex items-center gap-1.5">
                          {/* Transfer or Clearance Certificate */}
                          {fam.status === 'Transferred' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenClearanceCert(fam, fam.transferData)}
                              className="flex-1 py-1 px-2 rounded-lg text-[10.5px] font-semibold bg-amber-100 hover:bg-amber-200 text-[#92400E] border border-amber-300 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                              title="Print Clearance Certificate"
                            >
                              <span className="material-symbols-outlined text-[13px]">description</span>
                              <span>Clearance Cert</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTransfer(fam)}
                              className="flex-1 py-1 px-2 rounded-lg text-[10.5px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="Transfer Family"
                            >
                              <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                              <span>Transfer</span>
                            </button>
                          )}

                          {/* Deactivate or Reactivate */}
                          {fam.status === 'Active' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDeactivate(fam)}
                              className="py-1 px-2.5 rounded-lg text-[10.5px] font-medium text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="Deactivate Family"
                            >
                              <span className="material-symbols-outlined text-[14px]">person_off</span>
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivateFamily(fam)}
                              className="py-1 px-2.5 rounded-lg text-[10.5px] font-medium text-[#0284C7] hover:bg-sky-50 border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="Reactivate Family"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              <span>Reactivate</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(fam)}
                            className="p-1 px-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-[#F0F9FF] border-sky-100">
              <span className="text-[12px] text-sky-800">Showing <strong>{filteredFamilies.length}</strong> of {families.length} families</span>
              <div className="flex items-center gap-1.5">
                <button type="button" className="p-1.5 rounded-lg opacity-40 cursor-not-allowed bg-white border border-sky-200 text-sky-400" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button type="button" className="px-3 py-1 rounded-lg font-semibold text-white shadow-xs bg-[#0284C7] border border-sky-400/50">1</button>
                <button type="button" className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-800 border border-sky-200 cursor-pointer">2</button>
                <button type="button" className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-800 border border-sky-200 cursor-pointer">3</button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PRINT-ONLY: FORMAL TEMPLE PARISH REGISTRY REPORT         */}
          {/* ======================================================== */}
          <div className="hidden print:block printable-registry-report p-6 text-black bg-white">
            <div className="text-center pb-4 border-b-2 border-slate-800 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                  Democratic Socialist Republic of Sri Lanka • Department of Buddhist Affairs
                </span>
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 leading-tight">
                Sri Sambodhi Maha Viharaya — Walasmulla
              </h1>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mt-1">
                Official Dayaka Household Registry (2026 / 2569 B.E.)
              </h2>
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono mt-3 pt-2 border-t border-slate-200">
                <span>Registration ID: <strong>SPE-VJR-0842</strong></span>
                <span>Generated: <strong>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                <span>Total Parish Households: <strong>{filteredFamilies.length}</strong></span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-bold text-[10px] tracking-wider">
                  <th className="p-2 border border-slate-300">ID</th>
                  <th className="p-2 border border-slate-300">Household Head</th>
                  <th className="p-2 border border-slate-300">Address / Village</th>
                  <th className="p-2 border border-slate-300">Ward</th>
                  <th className="p-2 border border-slate-300">Phone</th>
                  <th className="p-2 border border-slate-300 text-center">Members</th>
                  <th className="p-2 border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilies.map((f, i) => (
                  <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{f.id}</td>
                    <td className="p-2 border border-slate-300 font-semibold">{f.name || `${f.firstName || ''} ${f.lastName || ''}`}</td>
                    <td className="p-2 border border-slate-300">{f.address}, {f.village}</td>
                    <td className="p-2 border border-slate-300 capitalize">{f.ward?.replace('-', ' ')}</td>
                    <td className="p-2 border border-slate-300 font-mono">{f.phone}</td>
                    <td className="p-2 border border-slate-300 text-center">{f.members?.length || 1}</td>
                    <td className="p-2 border border-slate-300 font-bold">{f.status || 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Official Certification Footer */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-slate-300 text-xs">
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 w-48 mx-auto mb-1"></div>
                <p className="font-bold text-slate-800">Ven. Kamburugamuwa Dhammika Thero</p>
                <p className="text-slate-500 text-[10px]">Chief Incumbent &amp; Patron</p>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 w-48 mx-auto mb-1"></div>
                <p className="font-bold text-slate-800">Parish Governance Secretariat</p>
                <p className="text-slate-500 text-[10px]">Dayaka Sabhawa General Secretary</p>
              </div>
            </div>
          </div>

        </main>
        <TempleFooterWave />
      </div>

      {/* ======================================================== */}
      {/* MODAL: ALL FAMILY DETAILS MODAL   */}
      {/* ======================================================== */}
      {isDetailsOpen && selectedFamily && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up">

            {/* Header */}
            <div className="p-6 text-white relative overflow-hidden flex items-start justify-between bg-gradient-to-r from-[#0C4A6E] via-[#0284C7] to-[#0369A1] border-b border-sky-400/30">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4 text-white">
                <span className="material-symbols-outlined text-[130px]">temple_buddhist</span>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-13 h-13 rounded-full flex items-center justify-center font-bold text-[18px] tracking-wide shadow-md ring-2 ring-white/60 ring-offset-2 ring-offset-[#0284C7] bg-white text-[#0284C7] flex-shrink-0">
                  {selectedFamily.name ? selectedFamily.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide bg-white/20 border border-white/30 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {selectedFamily.status || 'Active Parishioner'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sky-950/40 text-sky-200 border border-sky-300/40 tracking-wider">
                      <span>{selectedFamily.id}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/10 text-white/90 border border-white/20">
                      <span className="material-symbols-outlined text-[12px] text-sky-200">temple_buddhist</span>
                      <span>{selectedFamily.templeCode || 'TPL-2026-0482'}</span>
                    </span>
                  </div>
                  <h2 className="text-[20px] font-bold leading-tight text-white tracking-tight">
                    {selectedFamily.name || `${selectedFamily.firstName || ''} ${selectedFamily.lastName || ''}`}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[12px] text-sky-100/90">
                    <span className="font-medium text-white">{selectedFamily.templeName || 'Sri Sambodhi Maha Viharaya'}</span>
                    {selectedFamily.alias && (
                      <>
                        <span className="text-sky-300/60">•</span>
                        <span className="text-sky-100 font-medium">"{selectedFamily.alias}"</span>
                      </>
                    )}
                    <span className="text-sky-300/60">•</span>
                    <span className="text-sky-100/80">{selectedFamily.village || 'Walasmulla'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white flex items-center justify-center cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body: All Details Cards */}
            <div className="p-5 sm:p-6 space-y-4 bg-[#F8F9FA] max-h-[72vh] overflow-y-auto">

              {/* Reactive Deactivation Status Banner */}
              {selectedFamily.status === 'Deactivated' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">person_off</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13.5px] font-bold text-rose-950">
                          Devotee Household Deactivated
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider bg-rose-200 text-rose-900 border border-rose-300">
                          Suspended
                        </span>
                      </div>
                      <p className="text-[12px] text-rose-900/90 mt-0.5">
                        Reason: <strong>{selectedFamily.deactivationReason || 'Parish boundary relocation / administrative directive'}</strong>
                        {selectedFamily.deactivationNotes && (
                          <span className="block text-[11px] text-rose-800 mt-0.5">
                            Note: {selectedFamily.deactivationNotes}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReactivateFamily(selectedFamily)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-sm transition-all flex-shrink-0 cursor-pointer self-end sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Reactivate Household</span>
                  </button>
                </div>
              )}

              {/* Reactive Transferred Status Banner */}
              {selectedFamily.status === 'Transferred' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-sky-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13.5px] font-bold text-amber-950">
                          Parish Clearance Issued
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                          Transferred
                        </span>
                      </div>
                      <p className="text-[12px] text-amber-900 mt-0.5">
                        Transferred to: <strong>{selectedFamily.transferData?.destinationTemple || selectedFamily.enrollmentMode || 'Affiliated Temple'}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenClearanceCert(selectedFamily, selectedFamily.transferData)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0C4A6E] hover:bg-[#075985] border border-[#0284C7]/50 shadow-sm transition-all flex-shrink-0 cursor-pointer self-end sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#FFE885]">description</span>
                    <span>View Clearance Cert</span>
                  </button>
                </div>
              )}

              {/* Card 1: Family Identification & Temple Information */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">badge</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Family Identification &amp; Temple Affiliation
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Family ID</span>
                    <span className="font-mono text-[14px] font-semibold text-gray-900 block">
                      {selectedFamily.id}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Temple Code</span>
                    <span className="font-mono text-[14px] font-semibold text-[#0369A1] block">
                      {selectedFamily.templeCode || 'TPL-2026-0482'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Temple Name</span>
                    <span className="text-[13.5px] font-semibold text-gray-900 block">
                      {selectedFamily.templeName || 'Sri Sambodhi Maha Viharaya'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">Enrollment Mode</span>
                    <span className="text-[12.5px] font-medium text-gray-800 block">
                      {selectedFamily.enrollmentMode || 'Manual Clergy Entry'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">Parish Ledger Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {selectedFamily.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">Devotee Alias / Title</span>
                    <span className="text-[12.5px] font-medium text-gray-700 block">
                      {selectedFamily.alias ? `"${selectedFamily.alias}"` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Household Head & Contact Details */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">person</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Household Head &amp; Contact Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">First Name</span>
                    <span className="text-[13px] font-semibold text-gray-900 block">
                      {selectedFamily.firstName || selectedFamily.name?.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Last Name</span>
                    <span className="text-[13px] font-semibold text-gray-900 block">
                      {selectedFamily.lastName || selectedFamily.name?.split(' ').slice(1).join(' ') || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Phone No.</span>
                    <span className="font-mono text-[13px] font-semibold text-gray-900 block">
                      {selectedFamily.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Email Address</span>
                    <span className="font-mono text-[12.5px] font-medium text-gray-700 truncate block">
                      {selectedFamily.email || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Residential Address & Location */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Residential Address &amp; Location
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Address</span>
                    <span className="text-[13px] font-medium text-gray-900 block">
                      {selectedFamily.address || 'Temple Road'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Village</span>
                    <span className="text-[13px] font-medium text-gray-900 block">
                      {selectedFamily.village || 'Walasmulla Central'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">District &amp; Postal Code</span>
                    <span className="text-[13px] font-medium text-gray-900 block">
                      {selectedFamily.district || 'Hambantota'} ({selectedFamily.postalCode || '82200'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Family Members Section */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b pb-2.5 border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                      <span className="material-symbols-outlined text-[15px]">family_restroom</span>
                    </div>
                    <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                      Family Members
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedFamily.members?.length || 1} Members
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedFamily.members?.map((m, i) => {
                    const initials = (m.name || 'Member').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                    const genderBg = m.gender === 'Male' ? '#DCFCE7' : '#F3E8FF';
                    const genderTxt = m.gender === 'Male' ? '#166534' : '#6B21A8';
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/70 border border-gray-200/60">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs" style={{ background: genderBg, color: genderTxt }}>
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[12.5px] font-semibold truncate text-gray-900">{m.name}</span>
                          <span className="text-[11px] truncate text-gray-500">{m.role}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                            {m.age} yrs
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white border-gray-200">
              {/* Left Action: Delete */}
              <button
                type="button"
                onClick={() => {
                  handleOpenDelete(selectedFamily);
                }}
                className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-[11.5px] sm:text-[12px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 sm:border-transparent hover:border-red-200 transition-colors order-3 sm:order-1 cursor-pointer"
                title="Permanently Delete Family Record"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">delete</span>
                <span>Delete Record</span>
              </button>

              {/* Right Actions: Close, Edit, Print */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-2.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-lg text-[11.5px] sm:text-[12px] font-semibold text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors text-center cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedFamily);
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl sm:rounded-lg text-[11.5px] sm:text-[12px] font-semibold text-sky-900 hover:text-sky-950 bg-white hover:bg-sky-50 border border-sky-200 hover:border-sky-400 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  title="Edit Family Record"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#0284C7]">edit</span>
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenFamilyCard(selectedFamily)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl sm:rounded-lg text-[11.5px] sm:text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/20 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-white">badge</span>
                  <span>Print Family Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT FAMILY DETAILS MODAL*/}
      {/* ======================================================== */}
      {isEditOpen && editingFamily && (
        <div className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up my-6">

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
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-bold text-white tracking-tight leading-snug">Edit Family Ledger Details</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-medium bg-[#0284C7]/20 text-[#FFE885] border border-[#0284C7]/40">
                      {editingFamily.id}
                    </span>
                  </div>
                  <p className="text-[12px] text-sky-100/90 mt-0.5">
                    Parish Household Ledger Record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto bg-[#F8F9FA]">

              {/* Household Head Details */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">person</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Household Head Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Full Devotee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFamily.name || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Devotee Alias / Title
                    </label>
                    <input
                      type="text"
                      value={editingFamily.alias || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, alias: e.target.value })}
                      placeholder='e.g. "Jaya Mama"'
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Primary Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editingFamily.phone || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editingFamily.email || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Residential Address Details */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                    <span className="material-symbols-outlined text-[15px]">home_pin</span>
                  </div>
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                    Residential Address &amp; Parish Ward
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingFamily.address || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Village / Ward
                    </label>
                    <input
                      type="text"
                      value={editingFamily.village || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, village: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      District
                    </label>
                    <select
                      value={editingFamily.district || 'Hambantota'}
                      onChange={(e) => setEditingFamily({ ...editingFamily, district: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-[12.5px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs transition-all cursor-pointer"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={editingFamily.postalCode || ''}
                      onChange={(e) => setEditingFamily({ ...editingFamily, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-[#0C4A6E] focus:ring-2 focus:ring-[#0C4A6E]/10 bg-white text-gray-900 shadow-2xs transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Parish Ledger Status
                    </label>
                    <select
                      value={editingFamily.status || 'Active'}
                      onChange={(e) => setEditingFamily({ ...editingFamily, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-[12.5px] border border-gray-300 focus:outline-none focus:border-[#0C4A6E] bg-white text-gray-900 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Family Members Editor */}
              <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0C4A6E]/8 flex items-center justify-center text-[#0C4A6E]">
                      <span className="material-symbols-outlined text-[15px]">family_restroom</span>
                    </div>
                    <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-gray-800">
                      Family Members <span className="text-gray-400 font-normal lowercase tracking-normal font-sans ml-1">({editingFamily.members?.length || 0} Members)</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMemberToEdit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editingFamily.members?.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-gray-50/70 border-gray-200/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Name</label>
                        <input
                          type="text"
                          required
                          value={m.name}
                          onChange={(e) => handleMemberChangeInEdit(idx, 'name', e.target.value)}
                          placeholder="Member Name"
                          className="w-full px-3 py-1.5 rounded-md text-[12.5px] border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Role / Relation</label>
                        <input
                          type="text"
                          value={m.role}
                          onChange={(e) => handleMemberChangeInEdit(idx, 'role', e.target.value)}
                          placeholder="Spouse, Son, etc."
                          className="w-full px-3 py-1.5 rounded-md text-[12.5px] border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Age</label>
                        <input
                          type="number"
                          value={m.age}
                          onChange={(e) => handleMemberChangeInEdit(idx, 'age', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-md text-[12.5px] border border-gray-300 bg-white text-gray-900 font-mono focus:outline-none focus:border-[#0C4A6E]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Gender</label>
                        <select
                          value={m.gender}
                          onChange={(e) => handleMemberChangeInEdit(idx, 'gender', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md text-[12.5px] border border-gray-300 bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-[#0C4A6E]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromEdit(idx)}
                          className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Remove Member"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingFamily.members || editingFamily.members.length === 0) && (
                    <p className="text-[12px] text-gray-400 text-center py-2">No additional family members registered.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FFE885]">save</span>
                  <span>Save Family Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION MODAL       */}
      {/* ======================================================== */}
      {isDeleteOpen && deletingFamily && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-red-200 animate-fade-up">

            {/* Header */}
            <div className="p-5 px-6 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white">Delete Family Record</h3>
                  <p className="text-[11px] text-red-100">Permanently Remove Devotee Household</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 bg-white">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {deletingFamily.name?.charAt(0) || 'F'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-gray-900 truncate">{deletingFamily.name}</h4>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-red-200 text-red-700">
                      {deletingFamily.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    {deletingFamily.address} • {deletingFamily.village}
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this family ledger record? All registered family member data, contact history, and dana associations will be permanently removed.
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
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-gray-200 bg-white text-gray-700 border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm shadow-red-900/20"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DEACTIVATE MODAL (PROFESSIONAL ECCLESIASTICAL)    */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* MODAL: DEACTIVATE FAMILY RECORD (PROFESSIONAL SUSPENSION) */}
      {/* ======================================================== */}
      {isDeactivateOpen && selectedFamily && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-up my-6">

            {/* Modal Header */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0C4A6E] via-[#1E293B] to-[#0F172A] text-white flex items-start justify-between border-b border-sky-900/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">person_off</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-[18px] text-white tracking-tight">Deactivate Dayaka Record</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-500/30">
                      Restricted
                    </span>
                  </div>
                  <p className="text-[12px] text-sky-100/80 mt-0.5">
                    Parish Ledger Suspension Protocol
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeactivateOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#F8FAFC]">

              {/* Devotee Record Snapshot Card */}
              <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white border border-sky-300/40 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                    {selectedFamily.name ? selectedFamily.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15px] font-bold text-[#0F172A] truncate">{selectedFamily.name}</h4>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284C7] border border-sky-200">
                        {selectedFamily.id}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-500 truncate mt-0.5">
                      {selectedFamily.address}, {selectedFamily.village} ({selectedFamily.district})
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex-shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Currently Active
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    {selectedFamily.members?.length || 1} Household Members
                  </span>
                </div>
              </div>

              {/* Impact / Consequences Panel */}
              <div className="rounded-xl p-4 bg-amber-50/80 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                  Administrative &amp; Ecclesiastical Consequences
                </div>
                <ul className="text-[12px] text-amber-950/85 space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-rose-600 mt-0.5 flex-shrink-0">cancel</span>
                    <span><strong>Dana &amp; Alms Roster:</strong> Household will be immediately unassigned from morning/noon Dana shifts and alms queues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-rose-600 mt-0.5 flex-shrink-0">cancel</span>
                    <span><strong>Self-Service Portal Access:</strong> Devotee family credentials, QR pass access, and circular notifications will be suspended.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0284C7] mt-0.5 flex-shrink-0">info</span>
                    <span><strong>Audit Archive Preserved:</strong> Historical donation ledger entries, past alms certificates, and records remain permanently archived.</span>
                  </li>
                </ul>
              </div>

              {/* Form Controls */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[12px] font-bold text-[#0F172A] block mb-1">
                    Primary Reason for Deactivation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 transition-all"
                  >
                    <option value="Relocated outside parish boundary">
                      Relocated outside parish boundary
                    </option>
                    <option value="Devotee voluntary withdrawal / Household request">
                      Devotee voluntary withdrawal / Household request
                    </option>
                    <option value="Deceased without living successors in household">
                      Deceased without living successors in household
                    </option>
                    <option value="Duplicate or erroneous ledger entry">
                      Duplicate or erroneous ledger entry
                    </option>
                    <option value="Extended non-attendance / Clergy directive">
                      Extended non-attendance / Clergy directive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#0F172A] block mb-1">
                    Administrative Notes / Clergy Reference <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={deactivateNotes}
                    onChange={(e) => setDeactivateNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 transition-all"
                    rows={2}
                    placeholder="Enter Dayaka Sabhawa minute reference, clergy authorization note, or context..."
                  ></textarea>
                </div>

                {/* Clergy Acknowledgment Checkbox */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={deactivateAcknowledged}
                    onChange={(e) => setDeactivateAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-[12px] text-slate-700 leading-snug">
                    I confirm this deactivation has been authorized by the Chief Incumbent (Nayaka Thero) or Parish Secretary in accordance with Dayaka Sabhawa regulations.
                  </span>
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t flex items-center justify-between bg-white border-slate-200">
              <button
                type="button"
                onClick={() => setIsDeactivateOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-slate-200 bg-slate-100 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deactivateAcknowledged}
                onClick={handleConfirmDeactivate}
                className={`px-5 py-2.5 rounded-xl text-[12px] font-bold text-white shadow-sm flex items-center gap-2 transition-all ${deactivateAcknowledged
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] cursor-pointer shadow-red-500/20 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">person_off</span>
                <span>Confirm Deactivation</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TRANSFER MODAL (PROFESSIONAL INTER-TEMPLE CLEARANCE) */}
      {/* ======================================================== */}
      {isTransferOpen && selectedFamily && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-up my-6 max-h-[92vh]">

            {/* Modal Header */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] text-white flex items-start justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-[18px] text-white tracking-tight">Inter-Temple Devotee Transfer Protocol</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      Parish Clearance
                    </span>
                  </div>
                  <p className="text-[12px] text-sky-100/90 mt-0.5">
                    Inter-Temple Devotee Transfer Certificate &amp; Ledger Exchange
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmTransfer} className="flex flex-col flex-1 min-h-0 bg-[#F8FAFC]">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">

                {/* Transfer Visual Route Flow Banner */}
                <div className="p-4 rounded-xl border bg-gradient-to-r from-sky-50/70 via-white to-sky-50/70 border-sky-200/80 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0284C7]">route</span>
                    <span>Parish Transfer Route</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3">

                    {/* Origin Temple */}
                    <div className="md:col-span-5 p-3.5 rounded-xl bg-white border border-sky-100 shadow-xs">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#0284C7] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md block w-fit mb-1.5">
                        Current Parish
                      </span>
                      <div className="text-[13.5px] font-bold text-[#0F172A] truncate">
                        {selectedFamily.templeName || 'Sri Sambodhi Maha Viharaya'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-mono">{selectedFamily.templeCode || 'TPL-2026-0482'}</span>
                        <span>•</span>
                        <strong className="text-[#0F172A]">{selectedFamily.name}</strong>
                      </div>
                    </div>

                    {/* Transfer Direction Indicator */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </div>
                    </div>

                    {/* Receiving Destination Temple */}
                    <div className="md:col-span-5 p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md block w-fit mb-1.5">
                        Receiving Parish
                      </span>
                      <div className="text-[13.5px] font-bold text-[#0F172A] truncate">
                        {transferData.destinationTemple === 'Other'
                          ? (transferData.destinationTempleCustom || 'New Affiliated Temple')
                          : transferData.destinationTemple}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-mono text-[#0284C7] font-bold">{transferData.destinationTempleCode || 'TPL-PENDING'}</span>
                        <span>•</span>
                        <span>{transferData.destinationDistrict} District</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 1: Receiving Temple Details */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">temple_buddhist</span>
                    1. Destination Temple Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Destination District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferData.destinationDistrict}
                        onChange={(e) => setTransferData({ ...transferData, destinationDistrict: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100"
                        required
                      >
                        {SRI_LANKA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Receiving Temple Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferData.destinationTemple}
                        onChange={(e) => handleDestinationTempleSelect(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100"
                        required
                      >
                        {AFFILIATED_TEMPLES.map((t) => (
                          <option key={t.code} value={t.name}>{t.name}</option>
                        ))}
                        <option value="Other">Other / Custom Temple</option>
                      </select>
                    </div>
                  </div>

                  {transferData.destinationTemple === 'Other' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-sky-50/50 border border-sky-100 animate-fade-up">
                      <div>
                        <label className="text-[11px] font-bold text-[#0F172A] block mb-1">
                          Custom Temple Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transferData.destinationTempleCustom}
                          onChange={(e) => setTransferData({ ...transferData, destinationTempleCustom: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:border-[#0284C7]"
                          placeholder="e.g. Paramitha Bodhi Viharaya"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#0F172A] block mb-1">
                          Temple Registration / Sasanarakshaka Code
                        </label>
                        <input
                          type="text"
                          value={transferData.destinationTempleCode}
                          onChange={(e) => setTransferData({ ...transferData, destinationTempleCode: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] font-mono focus:border-[#0284C7]"
                          placeholder="e.g. TPL-2026-9999"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Transfer Terms & Timeline */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">description</span>
                    2. Transfer Terms &amp; Authorization
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Reason for Transfer <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={transferData.transferReason}
                        onChange={(e) => setTransferData({ ...transferData, transferReason: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                        required
                      >
                        <option value="Permanent Residence Relocation">
                          Permanent Residence Relocation
                        </option>
                        <option value="Marriage / Household Reorganization">
                          Marriage / Household Reorganization
                        </option>
                        <option value="Devotee Request to Ancestral Viharaya">
                          Devotee Request to Ancestral Viharaya
                        </option>
                        <option value="Administrative Division Realignment">
                          Administrative Division Realignment
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Effective Transfer Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={transferData.effectiveDate}
                        onChange={(e) => setTransferData({ ...transferData, effectiveDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] font-mono focus:border-[#0284C7]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                      Authorizing Clergy Officer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={transferData.authorizedBy}
                      onChange={(e) => setTransferData({ ...transferData, authorizedBy: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:border-[#0284C7]"
                    >
                      <option>Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)</option>
                      <option>Ven. Narada Thero (Parish Clergy Secretary)</option>
                      <option>Dayaka Sabhawa Executive Committee</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Data Handover & Clearance Options */}
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">inventory_2</span>
                    3. Clearance Package &amp; Records Handover
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={transferData.issueCertificate}
                        onChange={(e) => setTransferData({ ...transferData, issueCertificate: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] leading-tight">Clearance Certificate</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Digital PDF clearance certificate issue</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={transferData.transferDanaHistory}
                        onChange={(e) => setTransferData({ ...transferData, transferDanaHistory: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] leading-tight">Dana History Export</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Transfer alms seniority &amp; merit records</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={transferData.notifyReceivingTemple}
                        onChange={(e) => setTransferData({ ...transferData, notifyReceivingTemple: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] leading-tight">SMS &amp; Email Dispatch</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Notify family &amp; destination chief monk</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section 4: Remarks */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                    Clergy Remarks &amp; Instructions for Receiving Viharaya
                  </label>
                  <textarea
                    value={transferData.clergyRemarks}
                    onChange={(e) => setTransferData({ ...transferData, clergyRemarks: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100"
                    rows={2}
                    placeholder="e.g. Household head served as Vice-President; pending morning Dana allocation for Vesak Poya..."
                  ></textarea>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t flex items-center justify-between bg-white border-slate-200">
                <button
                  type="button"
                  onClick={() => handleOpenClearanceCert(selectedFamily, transferData)}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:bg-sky-50 bg-white border border-sky-300 text-[#0284C7] flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">print</span>
                  <span>Print Clearance Draft</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsTransferOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-slate-200 bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-md shadow-sky-600/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Authorize &amp; Dispatch Transfer</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* MODAL: INCOMING PARISH TRANSFERS MODAL (SIDE PANEL THEME)*/}
      {/* ======================================================== */}
      {isIncomingModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-up my-6 max-h-[92vh]">

            {/* Modal Header */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] text-white flex items-start justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">move_to_inbox</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-[18px] text-white tracking-tight">Incoming Parish Transfers</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      {incomingTransfers.length} Pending Acceptance
                    </span>
                  </div>
                  <p className="text-[12px] text-sky-100/90 mt-0.5">
                    Review and accept clearance certificates from other temples
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] bg-[#F8FAFC]">
              {incomingTransfers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-sky-50 text-[#0284C7] flex items-center justify-center mb-3 shadow-xs">
                    <span className="material-symbols-outlined text-[32px]">task_alt</span>
                  </div>
                  <h4 className="font-serif text-[16px] font-bold text-[#0F172A]">All Transfers Processed</h4>
                  <p className="text-[12px] text-slate-500 max-w-sm mt-1">
                    There are no pending inbound devotee transfer requests from other temples at this time.
                  </p>
                </div>
              ) : (
                incomingTransfers.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-xs space-y-4"
                  >
                    {/* Origin Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Dispatched from: {item.originTempleName}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-mono">{item.originTempleCode}</span>
                          <span>•</span>
                          <span>Dispatched: {item.dispatchedDate}</span>
                          <span>•</span>
                          <span>By: {item.dispatchedBy}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-200 self-start sm:self-auto">
                        Cert #{item.certificateNumber}
                      </span>
                    </div>

                    {/* Devotee Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Family Head Name</span>
                        <span className="text-[14px] font-bold text-[#0F172A] block">{item.name}</span>
                        <span className="text-[12px] font-mono text-slate-600">{item.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">New Parish Residence</span>
                        <span className="text-[13px] font-semibold text-[#0F172A] block">{item.newAddress}</span>
                        <span className="text-[12px] text-slate-500">{item.newVillage} ({item.district})</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Dana Seniority &amp; Merit</span>
                        <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mt-0.5">
                          {item.danaSeniority}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">{item.members?.length || 1} Household Members</div>
                      </div>
                    </div>

                    {/* Household Members Preview */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">Transferred Household Members:</span>
                      <div className="flex flex-wrap gap-2">
                        {item.members?.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 border border-slate-200 text-[#0F172A]"
                          >
                            <span className="font-bold">{m.name}</span>
                            <span className="text-slate-500">({m.role}, {m.age}y)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRejectIncoming(item.id, item.name)}
                        className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Decline / Return
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartAcceptIncoming(item)}
                        className="px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-sm shadow-sky-600/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                        <span>Review &amp; Accept Transfer</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t flex items-center justify-between bg-white border-slate-200">
              <span className="text-[12px] text-slate-500">
                Accepted families are instantly enrolled into the Dayaka Ledger and allocated Dana queues.
              </span>
              <button
                type="button"
                onClick={() => setIsIncomingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:bg-slate-200 bg-slate-100 text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ACCEPT & ENROLL PARISH TRANSFER CONFIGURATION     */}
      {/* ======================================================== */}
      {isAcceptModalOpen && selectedIncoming && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-fade-up my-6 max-h-[92vh]">

            {/* Modal Header */}
            <div className="p-5 px-6 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] text-white flex items-start justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-[18px] text-white tracking-tight">Accept &amp; Enroll Transferred Family</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      Clearance Valid
                    </span>
                  </div>
                  <p className="text-[12px] text-sky-100/90 mt-0.5">
                    Officially accept devotee family into parish ledger directory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAcceptIncoming} className="flex flex-col flex-1 min-h-0 bg-[#F8FAFC]">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[72vh]">

                {/* Transferred Devotee Overview */}
                <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded block w-fit mb-1">
                        Clearance Certificate #{selectedIncoming.certificateNumber}
                      </span>
                      <h4 className="font-serif text-[15.5px] font-bold text-[#0F172A]">{selectedIncoming.name}</h4>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-sky-50 text-[#0284C7] border border-sky-200 font-bold">
                      {selectedIncoming.members?.length || 1} Members
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-600">
                    Transferred from: <strong className="text-[#0F172A]">{selectedIncoming.originTempleName}</strong> ({selectedIncoming.originTempleCode})
                  </div>
                  <div className="text-[12px] text-slate-600">
                    New Residence: <strong className="text-[#0F172A]">{selectedIncoming.newAddress}, {selectedIncoming.newVillage}</strong>
                  </div>
                </div>

                {/* Section 1: Parish Ledger Allocation */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">badge</span>
                    1. Assign Parish Identification &amp; Ward
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Assign New Family ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={acceptFormData.assignedFamilyId}
                        onChange={(e) => setAcceptFormData({ ...acceptFormData, assignedFamilyId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] font-mono font-bold focus:border-[#0284C7]"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Official Parish ledger reference code</span>
                    </div>

                    <div>
                      <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                        Assign Village / Ward <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={acceptFormData.assignedWard}
                        onChange={(e) => {
                          const wardMap = {
                            'temple-road': 'Temple Road',
                            'north-ward': 'North Ward',
                            'meda-gama': 'Meda Gama',
                            'pahala-gama': 'Pahala Gama'
                          };
                          setAcceptFormData({
                            ...acceptFormData,
                            assignedWard: e.target.value,
                            assignedVillage: wardMap[e.target.value] || 'Walasmulla'
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:border-[#0284C7]"
                        required
                      >
                        <option value="meda-gama">Meda Gama</option>
                        <option value="temple-road">Temple Road</option>
                        <option value="north-ward">North Ward</option>
                        <option value="pahala-gama">Pahala Gama</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Integration & Dana Checkboxes */}
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2 border-slate-100">
                    <span className="material-symbols-outlined text-[17px] text-[#0284C7]">volunteer_activism</span>
                    2. Ecclesiastical Onboarding Options
                  </h4>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptFormData.onboardDana}
                      onChange={(e) => setAcceptFormData({ ...acceptFormData, onboardDana: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-[12px] font-bold text-[#0F172A]">Allocate to Monthly Dana Roster</div>
                      <div className="text-[11px] text-slate-500">Assign next available morning/noon alms turn in the Viharaya rotation calendar</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptFormData.importMerits}
                      onChange={(e) => setAcceptFormData({ ...acceptFormData, importMerits: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-[12px] font-bold text-[#0F172A]">Import Prior Dana &amp; Merit Seniority</div>
                      <div className="text-[11px] text-slate-500">Preserve historical seniority ({selectedIncoming.danaSeniority}) in ledger</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] cursor-pointer hover:border-sky-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptFormData.sendWelcomeSms}
                      onChange={(e) => setAcceptFormData({ ...acceptFormData, sendWelcomeSms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-[12px] font-bold text-[#0F172A]">Dispatch Welcome SMS &amp; Digital QR Pass</div>
                      <div className="text-[11px] text-slate-500">Send confirmation with new Family ID ({acceptFormData.assignedFamilyId}) to {selectedIncoming.phone}</div>
                    </div>
                  </label>
                </div>

                {/* Section 3: Clergy Authorization */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="text-[11.5px] font-bold text-[#0F172A] block mb-1">
                    Authorizing Clergy Officer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={acceptFormData.clergyEndorsement}
                    onChange={(e) => setAcceptFormData({ ...acceptFormData, clergyEndorsement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-[13px] bg-white border border-slate-300 text-[#0F172A] focus:border-[#0284C7]"
                  >
                    <option>Ven. Dhammarakkhitha Nayaka Thero (Chief Incumbent)</option>
                    <option>Ven. Narada Thero (Parish Clergy Secretary)</option>
                    <option>Dayaka Sabhawa Executive Committee</option>
                  </select>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 px-6 border-t flex items-center justify-between bg-white border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-slate-200 bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-md shadow-sky-600/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Accept &amp; Enroll into Parish</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRINTABLE OFFICIAL DEVOTEE FAMILY SACRED CARD     */}
      {/* ======================================================== */}
      {isFamilyCardModalOpen && selectedFamilyForCard && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up my-6">

            {/* Modal Header */}
            <div className="p-4 px-6 bg-[#0C4A6E] text-white flex items-center justify-between border-b border-[#0284C7]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/30 text-sky-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[19px]">badge</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">Official Family Sacred Card</h3>
                  <p className="text-[11px] text-sky-200/80">Official Devotee Family Card • Printable Digital View</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFamilyCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Printable ID Card Container */}
            <div className="p-6 bg-gray-100/70 flex justify-center">
              <div
                id="printable-family-card"
                className="printable-document-container w-full max-w-md bg-gradient-to-br from-white via-sky-50 to-sky-100 rounded-2xl border-2 border-sky-300 p-5 shadow-xl relative overflow-hidden text-gray-900 select-text"
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
                  <h4 className="text-[15px] font-bold text-[#0C4A6E] font-serif leading-tight">
                    {selectedFamilyForCard.templeName || 'Sri Sambodhi Maha Viharaya — Walasmulla'}
                  </h4>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    Registration No: <span className="font-bold text-[#0369A1]">{selectedFamilyForCard.templeCode || 'TPL-2026-0482'}</span> • Department of Buddhist Affairs
                  </p>
                </div>

                {/* Card Middle: Devotee Snapshot & QR Pass */}
                <div className="py-4 flex items-center gap-4 relative z-10">
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#0C4A6E] border-2 border-[#0284C7] shadow-md flex items-center justify-center text-[#FFE885] font-bold text-2xl ring-4 ring-[#0C4A6E]/20">
                      {selectedFamilyForCard.name ? selectedFamilyForCard.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <span className="mt-1 px-2 py-0.5 bg-[#0C4A6E] text-[#FFE885] border border-[#0284C7] rounded text-[9.5px] font-mono font-bold shadow-xs">
                      {selectedFamilyForCard.id}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {selectedFamilyForCard.alias || 'Parish Devotee'}
                      </span>
                      {selectedFamilyForCard.status === 'Deactivated' ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">Deactivated</span>
                      ) : selectedFamilyForCard.status === 'Transferred' ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Transferred</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#166534]">Active</span>
                      )}
                    </div>

                    <h3 className="text-[16px] font-bold text-gray-900 font-serif leading-snug mt-1 truncate">
                      {selectedFamilyForCard.name || `${selectedFamilyForCard.firstName || ''} ${selectedFamilyForCard.lastName || ''}`}
                    </h3>

                    <div className="text-[11px] text-gray-700 mt-1 space-y-0.5 font-sans">
                      <div className="truncate"><span className="text-gray-500 font-medium">Address:</span> {selectedFamilyForCard.address}</div>
                      <div><span className="text-gray-500 font-medium">Ward:</span> <strong>{selectedFamilyForCard.village || 'Walasmulla'}</strong> ({selectedFamilyForCard.ward || 'Parish Area'})</div>
                      <div><span className="text-gray-500 font-medium">Contact:</span> <span className="font-mono">{selectedFamilyForCard.phone}</span></div>
                      <div><span className="text-gray-500 font-medium">Household:</span> <strong>{selectedFamilyForCard.members?.length || 1} Registered Members</strong></div>
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
                      Ven. Dhammarakkhitha Thero
                    </div>
                    <div className="text-[8.5px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                      Chief Incumbent
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-sky-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-sky-800 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[15px] text-[#0284C7]">verified</span>
                Certified Household Sacred ID Card
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFamilyCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-900 border border-sky-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-white">print</span>
                  <span>Print Family Card</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRINTABLE INTER-TEMPLE CLEARANCE CERTIFICATE      */}
      {/* ======================================================== */}
      {isClearanceCertModalOpen && selectedTransferCert && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-fade-up my-6 max-h-[95vh]">

            {/* Modal Header */}
            <div className="p-4 px-6 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] text-white flex items-center justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[19px]">description</span>
                </div>
                <div>
                  <h3 className="font-serif text-[16px] font-bold text-white tracking-tight">Parish Transfer Clearance Certificate</h3>
                  <p className="text-[11px] text-sky-100/90">Official Parish Clearance Certificate • Printable Document</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearanceCertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Printable Certificate Body */}
            <div className="p-6 sm:p-8 bg-gray-100/70 flex justify-center overflow-y-auto">
              <div
                id="printable-clearance-cert"
                className="printable-document-container w-full bg-white rounded-2xl border-4 border-[#0C4A6E] p-7 sm:p-9 shadow-xl relative overflow-hidden text-gray-900 select-text"
                style={{
                  outline: '2px solid #0284C7',
                  outlineOffset: '-6px'
                }}
              >
                {/* Background Dhammachakka / Lotus watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <span className="material-symbols-outlined text-[320px] text-[#0C4A6E]">temple_buddhist</span>
                </div>

                {/* Top Ecclesiastical Header */}
                <div className="text-center pb-4 border-b-2 border-[#0284C7]/60 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <GoldenLotusIcon className="w-7 h-6 text-[#0369A1]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#0C4A6E]">
                      Democratic Socialist Republic of Sri Lanka • Department of Buddhist Affairs
                    </span>
                    <GoldenLotusIcon className="w-7 h-6 text-[#0369A1]" />
                  </div>
                  <h2 className="text-[22px] sm:text-[24px] font-bold text-[#0C4A6E] font-serif leading-tight">
                    Sri Sambodhi Maha Viharaya — Walasmulla
                  </h2>
                  <h3 className="text-[14px] font-semibold text-[#0369A1] font-serif">
                    Sri Sambodhi Maha Viharaya — Walasmulla
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[10.5px] text-gray-600 font-mono mt-1">
                    <span>Sasanarakshaka Code: <strong>TPL-2026-0482</strong></span>
                    <span>•</span>
                    <span>Ref No: <strong>{selectedTransferCert.transferInfo?.certificateNumber || 'CERT-TR-2026-0482'}</strong></span>
                    <span>•</span>
                    <span>Date: <strong>{selectedTransferCert.transferInfo?.effectiveDate || new Date().toISOString().split('T')[0]}</strong></span>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="py-4 text-center relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-[#0C4A6E] text-[#FFE885] border border-[#0284C7] shadow-xs">
                    Official Parish Clearance Certificate
                  </span>
                  <div className="text-[11px] font-serif text-[#0C4A6E] mt-1 font-semibold uppercase tracking-wider">
                    Official Parish Clearance &amp; Inter-Temple Transfer Certificate
                  </div>
                </div>

                {/* Devotee Transfer Narrative */}
                <div className="text-[12.5px] leading-relaxed text-gray-800 space-y-3 relative z-10 bg-white/60 p-4 rounded-xl border border-[#0284C7]/30">
                  <p>
                    This is to formally certify that devotee household head <strong>{selectedTransferCert.family.name || `${selectedTransferCert.family.firstName || ''} ${selectedTransferCert.family.lastName || ''}`}</strong>, bearing Parish Identity Code <strong>{selectedTransferCert.family.id}</strong> and residing at <em>{selectedTransferCert.family.address}, {selectedTransferCert.family.village}</em>, has held active and honorable fellowship in the Dayaka congregation of this Viharaya.
                  </p>
                  <p>
                    Pursuant to their relocation under reason: <span className="underline decoration-[#0284C7] font-semibold">{selectedTransferCert.transferInfo?.transferReason || 'Permanent Residence Relocation'}</span>, all parish dues, Dana alms contributions, and ecclesiastical commitments have been satisfactorily reconciled.
                  </p>

                  {/* Receiving Temple Info */}
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11.5px] text-emerald-950">
                    <div className="font-bold text-[#0C4A6E] uppercase tracking-wide text-[10px] mb-0.5">
                      Designated Receiving Parish:
                    </div>
                    <div><strong>{selectedTransferCert.transferInfo?.destinationTemple || 'Bodhirukkaramaya — Walasmulla'}</strong></div>
                    <div className="text-gray-600 mt-0.5 font-mono">
                      District: {selectedTransferCert.transferInfo?.destinationDistrict || 'Hambantota'} • Temple Code: {selectedTransferCert.transferInfo?.destinationTempleCode || 'TPL-2024-0198'}
                    </div>
                  </div>

                  {/* Blessings Stanza */}
                  <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-center italic font-serif text-[#0C4A6E] text-[12px]">
                    "Bhavatu Sabba Mangalam Rakkhantu Sabba Devatha — Sabba Buddhanubhavena Sada Sotthi Bhavantu Te"<br />
                    <span className="text-[10.5px] not-italic text-sky-700 font-sans mt-0.5 block">
                      May all triple gem blessings be upon this devotee household in their continued service to the Buddha Sasana.
                    </span>
                  </div>
                </div>

                {/* Clergy Endorsements & Signatures */}
                <div className="pt-6 mt-4 border-t-2 border-[#0284C7]/50 grid grid-cols-3 items-end gap-3 relative z-10 text-center">
                  <div>
                    <div className="text-[12px] font-serif text-[#0C4A6E] italic underline decoration-[#0284C7]">
                      {selectedTransferCert.transferInfo?.authorizedBy || 'Ven. Dhammarakkhitha Thero'}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600 mt-1">
                      Chief Incumbent
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-red-700/80 bg-red-50 text-red-800 flex flex-col items-center justify-center text-[8px] font-bold uppercase leading-none shadow-xs">
                      <span>OFFICIAL</span>
                      <span className="text-[10px] font-mono">SEAL</span>
                      <span>2026</span>
                    </div>
                    <span className="text-[8.5px] text-gray-400 mt-1 font-mono">Ecclesiastical Stamp</span>
                  </div>

                  <div>
                    <div className="text-[12px] font-serif text-[#0C4A6E] italic underline decoration-[#0284C7]">
                      K. M. Wijesinghe
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600 mt-1">
                      Secretary, Dayaka Sabhawa
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-sky-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-sky-800 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[15px] text-[#0284C7]">verified</span>
                Ecclesiastical Clearance Certificate Verified
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsClearanceCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-900 border border-sky-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-white">print</span>
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRINTABLE DAYAKA ONBOARDING QR FLYER              */}
      {/* ======================================================== */}
      {isFlyerModalOpen && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-sky-200 animate-fade-up my-6">

            {/* Modal Header */}
            <div className="p-4 px-6 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] text-white flex items-center justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[19px]">qr_code_2</span>
                </div>
                <div>
                  <h3 className="font-serif text-[16px] font-bold text-white tracking-tight">Official Dayaka Registration QR Flyer</h3>
                  <p className="text-[11px] text-sky-100/90">Public Devotee Notice • High-Resolution Printable Format</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFlyerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Printable Flyer Container */}
            <div className="p-6 bg-sky-50/50 flex justify-center overflow-y-auto max-h-[75vh]">
              <div
                id="printable-qr-flyer"
                className="printable-document-container w-full bg-white rounded-2xl border-4 border-[#0C4A6E] p-6 sm:p-8 shadow-xl relative overflow-hidden text-gray-900 select-text"
                style={{
                  outline: '2px solid #0284C7',
                  outlineOffset: '-6px'
                }}
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <span className="material-symbols-outlined text-[320px] text-[#0C4A6E]">temple_buddhist</span>
                </div>

                {/* Top Header */}
                <div className="text-center pb-4 border-b-2 border-sky-200 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <GoldenLotusIcon className="w-6 h-5 text-[#0284C7]" />
                    <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#0C4A6E]">
                      Sri Sambodhi Maha Viharaya • Walasmulla
                    </span>
                    <GoldenLotusIcon className="w-6 h-5 text-[#0284C7]" />
                  </div>
                  <h2 className="text-[20px] sm:text-[23px] font-bold text-[#0C4A6E] font-serif leading-tight">
                    ශ්‍රී සම්බෝධි මහා විහාරය — වළස්මුල්ල
                  </h2>
                  <p className="text-[10px] text-sky-700 font-mono mt-1">
                    Department of Buddhist Affairs Code: <strong className="font-bold text-[#0C4A6E]">TPL-2026-0482</strong>
                  </p>
                </div>

                {/* Main Flyer Title */}
                <div className="py-4 text-center relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-[#0C4A6E] text-white border border-[#0284C7] shadow-xs">
                    Official Dayaka Registration Notice
                  </span>
                  <h3 className="text-[15px] sm:text-[17px] font-bold text-[#0C4A6E] font-serif mt-2 leading-snug">
                    පින්වත් දායක පවුල් ලියාපදිංචි කිරීමේ නිවේදනය
                  </h3>
                  <p className="text-[11.5px] text-sky-800 mt-1 max-w-sm mx-auto leading-relaxed">
                    විහාරස්ථානයේ දායක සභාවේ නිල ලේඛනයට ඔබගේ පවුලේ තොරතුරු පහසුවෙන් ඇතුළත් කිරීමට පහත QR කේතය Scan කරන්න.
                  </p>
                </div>

                {/* Central QR Code Card with Sky Theme styling */}
                <div className="my-3 flex flex-col items-center justify-center relative z-10">
                  <div className="p-4 bg-gradient-to-br from-sky-50 via-white to-sky-100 rounded-2xl border-2 border-sky-300 shadow-md flex flex-col items-center">
                    <div className="w-44 h-44 sm:w-52 sm:h-52 bg-white rounded-xl border border-sky-200 p-3 shadow-inner flex items-center justify-center relative">
                      {/* Stylized QR Code Graphic */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#0C4A6E]">
                        <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
                        <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                        <rect x="9" y="9" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
                        <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                        <rect x="79" y="9" width="12" height="12" fill="currentColor" rx="1" />

                        <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
                        <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                        <rect x="9" y="79" width="12" height="12" fill="currentColor" rx="1" />

                        {/* QR Grid Pattern Blocks */}
                        <rect x="36" y="8" width="8" height="8" fill="currentColor" />
                        <rect x="50" y="8" width="6" height="6" fill="currentColor" />
                        <rect x="36" y="22" width="12" height="6" fill="currentColor" />
                        <rect x="8" y="38" width="10" height="6" fill="currentColor" />
                        <rect x="22" y="44" width="8" height="8" fill="currentColor" />
                        <rect x="36" y="38" width="26" height="26" fill="#0284C7" rx="4" />
                        <circle cx="49" cy="51" r="7" fill="white" />
                        <circle cx="49" cy="51" r="3.5" fill="#0C4A6E" />
                        <rect x="68" y="38" width="8" height="12" fill="currentColor" />
                        <rect x="82" y="44" width="10" height="8" fill="currentColor" />
                        <rect x="38" y="70" width="8" height="8" fill="currentColor" />
                        <rect x="52" y="76" width="12" height="6" fill="currentColor" />
                        <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                        <rect x="86" y="76" width="6" height="14" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="mt-2 text-[11px] font-mono font-bold text-[#0C4A6E] tracking-wider">
                      SCAN ME WITH CAMERA
                    </span>
                    <span className="text-[10px] text-sky-600 font-semibold">
                      https://temple.lk/join
                    </span>
                  </div>
                </div>

                {/* 3 Steps Instructions */}
                <div className="grid grid-cols-3 gap-2 my-3 relative z-10 text-center">
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="w-6 h-6 mx-auto rounded-full bg-[#0284C7] text-white font-bold text-[11px] flex items-center justify-center mb-1">1</div>
                    <div className="text-[10.5px] font-bold text-[#0C4A6E]">Scan QR</div>
                    <div className="text-[9px] text-gray-600">Use any mobile phone camera</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="w-6 h-6 mx-auto rounded-full bg-[#0284C7] text-white font-bold text-[11px] flex items-center justify-center mb-1">2</div>
                    <div className="text-[10.5px] font-bold text-[#0C4A6E]">Fill Details</div>
                    <div className="text-[9px] text-gray-600">Enter family member names</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="w-6 h-6 mx-auto rounded-full bg-[#0284C7] text-white font-bold text-[11px] flex items-center justify-center mb-1">3</div>
                    <div className="text-[10.5px] font-bold text-[#0C4A6E]">Get Family ID</div>
                    <div className="text-[9px] text-gray-600">Instant registration confirmation</div>
                  </div>
                </div>

                {/* Footer Blessings & Chief Incumbent */}
                <div className="pt-3 border-t-2 border-sky-200 flex items-center justify-between relative z-10">
                  <div className="text-[10px] text-sky-800 italic font-serif">
                    “සැමට සම්මා සම්බුදු සරණයි”
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-serif text-[#0C4A6E] font-bold italic">
                      Ven. Dhammarakkhitha Nayaka Thero
                    </div>
                    <div className="text-[8.5px] text-gray-500 font-semibold uppercase">
                      Chief Incumbent • Viharadhipathi
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-sky-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-sky-800 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[15px] text-[#0284C7]">verified</span>
                High-Resolution Printable Notice
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFlyerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:bg-sky-50 bg-white text-sky-900 border border-sky-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-white">print</span>
                  <span>Print Flyer</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE BOTTOM SHEET DRAWER: QUICK SEARCH & SMART FILTERS */}
      {/* ======================================================== */}
      {isMobileFilterDrawerOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          {/* Dark Backdrop Blur */}
          <div
            onClick={() => setIsMobileFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Bottom Sheet Slide Up Panel */}
          <div className="fixed inset-x-0 bottom-0 z-[85] max-h-[88vh] bg-white rounded-t-3xl shadow-2xl flex flex-col border-t-2 border-[#0284C7]/40 animate-slide-up overflow-hidden">

            {/* Drawer Grabber Bar */}
            <div className="w-full pt-3 pb-1 flex justify-center bg-gray-50/60 cursor-pointer" onClick={() => setIsMobileFilterDrawerOpen(false)}>
              <div className="w-12 h-1.5 rounded-full bg-gray-300"></div>
            </div>

            {/* Drawer Header */}
            <div className="p-4 px-6 bg-gradient-to-r from-[#0C4A6E] via-[#0369A1] to-[#0C4A6E] text-white flex items-center justify-between border-b border-[#0284C7]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-[#FFE885] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">Filter Devotee Registry</h3>
                  <p className="text-[11px] text-sky-100/80">Quick Search &amp; Filter Drawer</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setWardFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-[11px] font-semibold text-[#FFE885] hover:underline px-2 py-1 rounded bg-white/10"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto max-h-[65vh] bg-[#F9F8F6]">

              {/* 1. Quick Keyword Search */}
              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Keyword Search
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-gray-400">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Devotee name, phone, village, ID..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#0C4A6E]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Status Filter Chips */}
              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Household Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: 'All Statuses', icon: 'list_alt' },
                    { id: 'Active', label: 'Active Only', icon: 'check_circle' },
                    { id: 'Transferred', label: 'Transferred', icon: 'swap_horiz' },
                    { id: 'Deactivated', label: 'Deactivated', icon: 'person_off' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatusFilter(st.id)}
                      className={`py-1.5 px-2.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${statusFilter === st.id
                        ? 'bg-[#0C4A6E] text-[#FFE885] border-[#0284C7] shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{st.icon}</span>
                      <span className="truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Parish Ward / Village Filter Chips */}
              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Parish Village / Ward
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'all', label: 'All Wards / Villages' },
                    { id: 'temple-road', label: 'Temple Road' },
                    { id: 'north-ward', label: 'North Ward' },
                    { id: 'pahala-gama', label: 'Pahala Gama' },
                    { id: 'meda-gama', label: 'Meda Gama' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWardFilter(w.id)}
                      className={`py-2 px-3 rounded-xl text-left text-[11.5px] font-medium border flex items-center justify-between transition-all cursor-pointer ${wardFilter === w.id
                        ? 'bg-sky-50 text-[#0284C7] border-sky-300 font-bold shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <span>{w.label}</span>
                      {wardFilter === w.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Count Preview */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-[#92400E] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>Matching households:</span>
                </span>
                <strong className="text-[12.5px] font-mono">{filteredFamilies.length}</strong>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-3 px-4 border-t border-gray-200 bg-white flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="px-3.5 py-2 rounded-xl text-[11.5px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="flex-1 py-2 px-3.5 rounded-xl text-[11.5px] font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] border border-sky-400/50 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-[#FFE885]">check</span>
                <span>Apply &amp; View ({filteredFamilies.length})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile Filter Trigger */}
      <button
        type="button"
        onClick={() => setIsMobileFilterDrawerOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-[#0C4A6E] text-white shadow-lg border-2 border-[#0284C7] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Open Quick Search &amp; Filters"
      >
        <span className="material-symbols-outlined text-[20px] text-[#FFE885]">tune</span>
        {(wardFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white"></span>
        )}
      </button>

    </div>
  );
}
