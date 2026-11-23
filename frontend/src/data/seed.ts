// ============================================================================
// TEMPLE MANAGEMENT SYSTEM - CENTRAL DATABASE SEED MODULE
// File: src/data/seed.ts
//
// Purpose:
// This file acts as the primary data seeder for the Temple Management System.
// It provides:
// 1. Core TypeScript data models and interfaces.
// 2. Canonical seed datasets for Devotee Families, Officials, Audit Logs & Transfers.
// 3. LocalStorage / Database seeding and reset utilities for team integration.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. TYPE DEFINITIONS & SCHEMAS
// ----------------------------------------------------------------------------

export interface Booking {
  id: number;
  date: string;
  family: string;
  type: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Confirmed';
}

export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  tag: string;
  type: 'dana' | 'event';
  dotColor: string;
}

export interface NotificationItem {
  id: number;
  icon: string;
  color: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
}

export interface UserOfficial {
  id: number;
  templeName: string;
  templeCode: string;
  firstName: string;
  lastName: string;
  name: string;
  alias?: string;
  nic?: string;
  ordainedYear?: string;
  email: string;
  phone: string;
  committeeName: string;
  designation: string;
  role: string;
  roleDisplay: string;
  roleSubtitle: string;
  status: 'permanent' | 'active' | 'deactivated';
  avatar: string;
  avatarBg: string;
  avatarColor: string;
  isPermanent: boolean;
  deactivateReason?: string;
  deactivateNotes?: string;
  deactivatedAt?: string;
  permFamily?: boolean;
  permDana?: boolean;
  permNotices?: boolean;
  permFinance?: boolean;
}

export interface FamilyMember {
  name: string;
  role: string;
  age: number;
  gender: 'Male' | 'Female';
}

export interface FamilyRecord {
  key?: string;
  id: string;
  templeName: string;
  templeCode: string;
  firstName: string;
  lastName: string;
  name: string;
  alias?: string;
  nic?: string;
  email?: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  postalCode: string;
  ward: string;
  status: 'Active' | 'Transferred' | 'Deactivated';
  enrollmentMode: string;
  enrollmentType: 'qr' | 'transfer' | 'manual';
  members: FamilyMember[];
  certificateNumber?: string;
  transferData?: {
    destinationTemple?: string;
    destinationTempleName?: string;
    destinationTempleCode?: string;
    destinationDistrict?: string;
    certificateNumber?: string;
    transferDate?: string;
    transferReason?: string;
    effectiveDate?: string;
    authorizedBy?: string;
    clergyRemarks?: string;
  };
  deactivateReason?: string;
  deactivationReason?: string;
  deactivateNotes?: string;
  deactivationNotes?: string;
  danaTurnNotes?: string;
  clericalNotes?: string;
  registeredDate?: string;
  createdAt?: string;
}

export interface IncomingTransferRecord {
  id: string;
  certificateNumber: string;
  originTempleName: string;
  originTempleCode: string;
  dispatchedBy: string;
  dispatchedDate: string;
  transferReason: string;
  firstName: string;
  lastName: string;
  name: string;
  nic?: string;
  phone: string;
  email: string;
  newAddress: string;
  newVillage: string;
  district: string;
  postalCode: string;
  ward: string;
  danaSeniority: string;
  members: FamilyMember[];
}

export interface AffiliatedTemple {
  name: string;
  code: string;
  district: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole: string;
  targetType: 'User' | 'Family';
  targetName: string;
  targetId: string;
  action: 'Deactivated' | 'Reactivated' | 'Role Updated' | 'Created' | 'Transfer Approved';
  reason: string;
  statusBadge: 'active' | 'deactivated' | 'transferred' | 'pending';
}

export interface KnownDevoteeEntry {
  nic: string;
  phone: string;
  cleanPhone: string;
  name: string;
  familyId: string;
  templeName: string;
  village: string;
}

// ----------------------------------------------------------------------------
// 2. SEED DATASETS
// ----------------------------------------------------------------------------

export const SEED_USERS: UserOfficial[] = [
  {
    id: 1,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Ven. Kamburugamuwa',
    lastName: 'Dhammika Thero',
    name: 'Ven. Kamburugamuwa Dhammika Thero',
    alias: 'Chief Incumbent',
    nic: '198512304567',
    ordainedYear: '2005',
    email: 'templeadmin@temple.lk',
    phone: '+94 77 312 6640',
    committeeName: 'Monastic Leadership',
    designation: 'Chief Incumbent',
    role: 'templeAdmin',
    roleDisplay: 'Chief Incumbent',
    roleSubtitle: 'Monastic Leadership • Sri Sambodhi Maha Viharaya',
    status: 'permanent',
    avatar: 'VK',
    avatarBg: 'bg-amber-100',
    avatarColor: 'text-amber-800',
    isPermanent: true,
    permFamily: true,
    permDana: true,
    permNotices: true,
    permFinance: true,
  },
  {
    id: 2,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Nimal',
    lastName: 'Perera',
    name: 'Nimal Perera',
    alias: 'Dayaka Secretary',
    nic: '197514201890',
    email: 'nimal.perera@temple.lk',
    phone: '+94 77 123 4567',
    committeeName: 'Dayaka Sabhawa',
    designation: 'Secretary',
    role: 'official',
    roleDisplay: 'Secretary',
    roleSubtitle: 'Dayaka Sabhawa • Sri Sambodhi Maha Viharaya',
    status: 'active',
    avatar: 'NP',
    avatarBg: 'bg-sky-100',
    avatarColor: 'text-sky-800',
    isPermanent: false,
    permFamily: true,
    permDana: true,
    permNotices: true,
    permFinance: false,
  },
  {
    id: 3,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Sunethra',
    lastName: 'Bandara',
    name: 'Sunethra Bandara',
    alias: 'Treasurer',
    nic: '198059801234',
    email: 'sunethra.b@temple.lk',
    phone: '+94 71 456 7890',
    committeeName: 'Finance & Merits Committee',
    designation: 'Treasurer',
    role: 'official',
    roleDisplay: 'Treasurer',
    roleSubtitle: 'Finance & Merits Committee • Sri Sambodhi Maha Viharaya',
    status: 'active',
    avatar: 'SB',
    avatarBg: 'bg-emerald-100',
    avatarColor: 'text-emerald-800',
    isPermanent: false,
    permFamily: true,
    permDana: false,
    permNotices: false,
    permFinance: true,
  },
  {
    id: 4,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Chandana',
    lastName: 'Jayakody',
    name: 'Chandana Jayakody',
    alias: 'Event Coordinator',
    nic: '198214309876',
    email: 'chandana.j@temple.lk',
    phone: '+94 76 789 0123',
    committeeName: 'Event & Programme Committee',
    designation: 'Vice President',
    role: 'official',
    roleDisplay: 'Vice President',
    roleSubtitle: 'Event & Programme Committee • Sri Sambodhi Maha Viharaya',
    status: 'active',
    avatar: 'CJ',
    avatarBg: 'bg-purple-100',
    avatarColor: 'text-purple-800',
    isPermanent: false,
    permFamily: false,
    permDana: true,
    permNotices: true,
    permFinance: false,
  },
  {
    id: 5,
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Mahinda',
    lastName: 'Alwis',
    name: 'Mahinda Alwis',
    alias: 'Past Committee Member',
    nic: '196814209999',
    email: 'mahinda.a@temple.lk',
    phone: '+94 77 987 6543',
    committeeName: 'Dayaka Sabhawa',
    designation: 'Committee Member',
    role: 'official',
    roleDisplay: 'Committee Member',
    roleSubtitle: 'Dayaka Sabhawa • Sri Sambodhi Maha Viharaya',
    status: 'deactivated',
    avatar: 'MA',
    avatarBg: 'bg-rose-100',
    avatarColor: 'text-rose-800',
    isPermanent: false,
    deactivateReason: 'Term Completed / Routine Committee Rotation',
    deactivateNotes: 'Committee tenure completed in 2025.',
    deactivatedAt: '2026-01-10T10:00:00Z',
    permFamily: false,
    permDana: false,
    permNotices: false,
    permFinance: false,
  },
];

export const SEED_FAMILIES: FamilyRecord[] = [
  {
    key: 'fam-6783',
    id: 'FAM-6783',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Kamal',
    lastName: 'Jayasinghe',
    name: 'Kamal Jayasinghe',
    alias: 'Household of Kamal Jayasinghe',
    nic: '198214502391',
    email: 'kamal.jayasinghe@example.com',
    phone: '+94 77 234 5678',
    address: 'No 90, Temple Lane, Kadolkele',
    village: 'Kadolkele',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'temple-road',
    status: 'Active',
    enrollmentMode: 'Admin-Assisted Clergy Registration',
    enrollmentType: 'manual',
    danaTurnNotes: 'Monthly 15th noon alms',
    clericalNotes: 'Address verified by temple admin',
    members: [
      { name: 'Champa Jayasinghe', role: 'Spouse', age: 44, gender: 'Female' },
      { name: 'Ravindu Jayasinghe', role: 'Child', age: 18, gender: 'Male' }
    ]
  },
  {
    key: 'fam-3595',
    id: 'FAM-3595',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Sunil',
    lastName: 'Jayawardena',
    name: 'Sunil Jayawardena',
    alias: 'Household of Sunil Jayawardena',
    nic: '197824501234',
    email: 'sunil.j@example.com',
    phone: '+94 77 123 4567',
    address: 'No 45, Temple Road, Kadolkele',
    village: 'Kadolkele',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'temple-road',
    status: 'Active',
    enrollmentMode: 'Digital QR Registration Pass',
    enrollmentType: 'qr',
    danaTurnNotes: 'Poya Day morning alms',
    clericalNotes: 'Regular devotees',
    members: [
      { name: 'Kanthi Jayawardena', role: 'Spouse', age: 48, gender: 'Female' },
      { name: 'Kasun Jayawardena', role: 'Son', age: 19, gender: 'Male' }
    ]
  },
  {
    key: 'fam-1042',
    id: 'FAM-1042',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Dayawathi',
    lastName: 'Wickramasinghe',
    name: 'Dayawathi Wickramasinghe',
    alias: 'Household of Dayawathi Wickramasinghe',
    nic: '196558901234',
    email: 'dayawathi.w@example.com',
    phone: '+94 71 890 1234',
    address: 'No 12, North Ward Lane, Kadolkele',
    village: 'Kadolkele',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'north-ward',
    status: 'Active',
    enrollmentMode: 'Admin-Assisted Clergy Registration',
    enrollmentType: 'manual',
    danaTurnNotes: 'First Sunday alms group',
    clericalNotes: 'Senior parish devotee',
    members: [
      { name: 'Anura Wickramasinghe', role: 'Son', age: 35, gender: 'Male' }
    ]
  },
  {
    key: 'fam-2015',
    id: 'FAM-2015',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Saman',
    lastName: 'Kariyawasam',
    name: 'Saman Kariyawasam',
    alias: 'Household of Saman Kariyawasam',
    nic: '197012345678',
    email: 'saman.k@example.com',
    phone: '+94 77 987 6543',
    address: 'No 88, Pahala Gama Road',
    village: 'Pahala Gama',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'pahala-gama',
    status: 'Deactivated',
    enrollmentMode: 'Admin-Assisted Clergy Registration',
    enrollmentType: 'manual',
    deactivateReason: 'Relocated outside parish boundary',
    deactivateNotes: 'Relocated to Colombo in 2026.',
    members: [
      { name: 'Nirmala Kariyawasam', role: 'Spouse', age: 52, gender: 'Female' }
    ]
  },
  {
    key: 'fam-4109',
    id: 'FAM-4109',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'SMB-VIH-0042',
    firstName: 'Chandrika',
    lastName: 'Gunawardena',
    name: 'Chandrika Gunawardena',
    alias: 'Household of Chandrika Gunawardena',
    nic: '197589123456',
    email: 'chandrika.g@example.com',
    phone: '+94 72 345 6789',
    address: 'No 105, Meda Gama',
    village: 'Meda Gama',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'meda-gama',
    status: 'Transferred',
    enrollmentMode: 'Transferred to Kelaniya Raja Maha Viharaya',
    enrollmentType: 'transfer',
    transferData: {
      destinationTemple: 'Kelaniya Raja Maha Viharaya - Kelaniya',
      destinationDistrict: 'Gampaha',
      destinationTempleCode: 'TPL-2020-0005',
      transferReason: 'Permanent Residence Relocation',
      effectiveDate: '2026-10-15',
      authorizedBy: 'Ven. Kamburugamuwa Dhammika Thero',
      clergyRemarks: 'Parish clearance approved.',
      certificateNumber: 'CERT-TR-2026-4109'
    },
    members: [
      { name: 'Sarath Gunawardena', role: 'Spouse', age: 54, gender: 'Male' }
    ]
  }
];

export const SEED_INCOMING_TRANSFERS: IncomingTransferRecord[] = [
  {
    id: 'TRF-IN-8821',
    name: 'Nihal Wanniarachchi',
    firstName: 'Nihal',
    lastName: 'Wanniarachchi',
    nic: '197214509876',
    email: 'nihal.w@example.com',
    phone: '+94 77 456 7890',
    originTempleName: 'Bellanwila Rajamaha Viharaya - Boralesgamuwa',
    originTempleCode: 'TPL-2021-0089',
    dispatchedBy: 'Ven. Boralesgamuwe Rathanatissa Thero',
    dispatchedDate: '12 Nov 2026',
    certificateNumber: 'CERT-TR-2026-8821',
    transferReason: 'Relocation to Kadolkele area',
    newAddress: 'No 28, Temple Road, Kadolkele',
    newVillage: 'Kadolkele',
    district: 'Gampaha',
    postalCode: '11500',
    ward: 'temple-road',
    danaSeniority: 'Grade A (5 Years)',
    members: [
      { name: 'Sunethra Wanniarachchi', role: 'Spouse', age: 50, gender: 'Female' }
    ]
  }
];

export const SEED_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'AUD-2026-8801',
    timestamp: '18 Nov 2026, 10:30',
    adminName: 'Nimal Perera',
    adminRole: 'Co-Administrator',
    targetType: 'Family',
    targetName: 'Kamal Jayasinghe',
    targetId: 'FAM-6783',
    action: 'Created',
    reason: 'New household enrolled into Dayaka ledger',
    statusBadge: 'active'
  },
  {
    id: 'AUD-2026-8802',
    timestamp: '15 Nov 2026, 14:15',
    adminName: 'Ven. Kamburugamuwa Dhammika Thero',
    adminRole: 'Chief Incumbent',
    targetType: 'User',
    targetName: 'Sunethra Bandara',
    targetId: 'USR-3',
    action: 'Role Updated',
    reason: 'Appointed as Treasurer for 2026-2027 term',
    statusBadge: 'active'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  { id: 1, date: "15 Oct 2026", family: "Nimal Perera", type: "Morning Dana", time: "8:00 AM", status: "Pending" },
  { id: 2, date: "16 Oct 2026", family: "Saman Jayasundara", type: "Lunch Dana", time: "11:00 AM", status: "Approved" },
  { id: 3, date: "18 Oct 2026", family: "Chandima Silva", type: "Evening Dana", time: "5:00 PM", status: "Pending" },
  { id: 4, date: "20 Oct 2026", family: "Fernando Family", type: "Morning Dana", time: "8:00 AM", status: "Approved" },
  { id: 5, date: "22 Oct 2026", family: "Perera Family", type: "Lunch Dana", time: "11:00 AM", status: "Rejected" },
];

export const SEED_SCHEDULE: ScheduleItem[] = [
  { time: "08:00 AM", title: "Morning Dana", location: "Main Hall", tag: "2 Bookings", type: "dana", dotColor: "bg-[#10b981]" },
  { time: "10:00 AM", title: "Lunch Dana", location: "Main Hall", tag: "3 Bookings", type: "dana", dotColor: "bg-[#3b82f6]" },
  { time: "11:00 AM", title: "Children's Dhamma Class", location: "Education Hall", tag: "Event", type: "event", dotColor: "bg-[#10b981]" },
  { time: "03:00 PM", title: "Evening Dana", location: "Main Hall", tag: "1 Booking", type: "dana", dotColor: "bg-[#8b5cf6]" },
  { time: "05:00 PM", title: "Pirith Chanting", location: "Main Hall", tag: "Event", type: "event", dotColor: "bg-[#10b981]" },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, icon: "receipt_long", color: "text-[#b45309]", bg: "bg-[#fef9c3]", title: "New dana booking request received.", desc: "Nimal Perera • 15 Oct 2026 • Morning Dana", time: "10:15 AM" },
  { id: 2, icon: "event", color: "text-[#9333ea]", bg: "bg-[#f3e8ff]", title: "New religious schedule added: Poson Programme.", desc: "22 Oct 2026 • Kataragama Temple", time: "08:30 AM" },
  { id: 3, icon: "group", color: "text-[#16a34a]", bg: "bg-[#dcfce7]", title: "New family registration request.", desc: "Fernando Family", time: "08:30 AM" },
  { id: 4, icon: "favorite", color: "text-[#ef4444]", bg: "bg-[#fee2e2]", title: "Donation of Rs. 5,000 received.", desc: "Saman Jayasundara", time: "09:42 AM" },
];

export const KNOWN_DEVOTEES_REGISTRY: KnownDevoteeEntry[] = [];

export const SRI_LANKA_DISTRICTS: string[] = [
  'Hambantota',
  'Matara',
  'Galle',
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Jaffna',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu'
];

export const AFFILIATED_TEMPLES: AffiliatedTemple[] = [
  { name: 'Bodhirukkaramaya - Walasmulla', code: 'TPL-2024-0198', district: 'Hambantota' },
  { name: 'Sri Sudharmarama Purana Viharaya - Weeraketiya', code: 'TPL-2025-0341', district: 'Hambantota' },
  { name: 'Gangaramaya Maha Viharaya - Colombo 02', code: 'TPL-2023-0012', district: 'Colombo' },
  { name: 'Bellanwila Rajamaha Viharaya - Boralesgamuwa', code: 'TPL-2021-0089', district: 'Colombo' },
  { name: 'Kelaniya Raja Maha Viharaya - Kelaniya', code: 'TPL-2020-0005', district: 'Gampaha' },
  { name: 'Asgiriya Maha Viharaya - Kandy', code: 'TPL-2019-0002', district: 'Kandy' },
  { name: 'Malwathu Maha Viharaya - Kandy', code: 'TPL-2019-0001', district: 'Kandy' },
  { name: 'Ruwanweli Maha Seya Parish Viharaya - Anuradhapura', code: 'TPL-2018-0003', district: 'Anuradhapura' }
];

export const COMMUNITY_WARDS = [
  { value: 'all', label: 'All Wards / Villages' },
  { value: 'temple-road', label: 'Temple Road' },
  { value: 'north-ward', label: 'North Ward' },
  { value: 'pahala-gama', label: 'Pahala Gama' },
  { value: 'meda-gama', label: 'Meda Gama' }
];

export const DEFAULT_TEMPLE_PROFILE = {
  name: "Kataragama Temple",
  code: "TPL-2026-0482",
  location: "Kataragama, Monaragala",
  chiefIncumbent: "Ven. Medagoda Abhayathissa Thero",
  directJoinUrl: "https://temple.lk/join/TMPL-00482"
};

// ----------------------------------------------------------------------------
// 3. BACKWARD COMPATIBILITY ALIASES
// ----------------------------------------------------------------------------
export const INITIAL_FAMILIES = SEED_FAMILIES;
export const INITIAL_ROSTER = SEED_USERS;
export const INITIAL_AUDIT_LOGS = SEED_AUDIT_LOGS;
export const INITIAL_INCOMING_TRANSFERS = SEED_INCOMING_TRANSFERS;
export const INITIAL_BOOKINGS = SEED_BOOKINGS;
export const TODAYS_SCHEDULE = SEED_SCHEDULE;
export const NOTIFICATIONS = SEED_NOTIFICATIONS;

// ----------------------------------------------------------------------------
// 4. STORAGE KEYS & SEEDER UTILITIES
// ----------------------------------------------------------------------------
export const STORAGE_KEYS = {
  FAMILIES: 'temple_registered_families',
  USERS: 'temple_registered_users',
  AUDIT_LOGS: 'temple_audit_logs',
  INCOMING_TRANSFERS: 'temple_incoming_transfers'
} as const;

/**
 * Initializes browser LocalStorage with seed records if unpopulated.
 * Pass force = true to overwrite existing entries with pristine seed data.
 */
export function seedLocalStorage(force: boolean = false): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  if (force || !localStorage.getItem(STORAGE_KEYS.FAMILIES)) {
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(SEED_FAMILIES));
  }

  if (force || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }

  if (force || !localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
  }

  if (force || !localStorage.getItem(STORAGE_KEYS.INCOMING_TRANSFERS)) {
    localStorage.setItem(STORAGE_KEYS.INCOMING_TRANSFERS, JSON.stringify(SEED_INCOMING_TRANSFERS));
  }
}

/**
 * Resets all browser persistent storage back to canonical seed state.
 */
export function resetToSeedData(): void {
  seedLocalStorage(true);
}

/**
 * Returns complete database seed bundle formatted for API/Backend/Database seed scripts.
 */
export function getSeedDataBundle() {
  return {
    temple: DEFAULT_TEMPLE_PROFILE,
    wards: COMMUNITY_WARDS,
    districts: SRI_LANKA_DISTRICTS,
    affiliatedTemples: AFFILIATED_TEMPLES,
    officials: SEED_USERS,
    families: SEED_FAMILIES,
    incomingTransfers: SEED_INCOMING_TRANSFERS,
    auditLogs: SEED_AUDIT_LOGS,
    knownDevotees: KNOWN_DEVOTEES_REGISTRY,
    bookings: SEED_BOOKINGS,
    schedule: SEED_SCHEDULE,
    notifications: SEED_NOTIFICATIONS
  };
}
