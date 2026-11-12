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
    templeName: "Sri Sambodhi Maha Viharaya",
    templeCode: "TPL-2026-0482",
    firstName: "Ven. Medagoda",
    lastName: "Abhayathissa Thero",
    name: "Ven. Medagoda Abhayathissa Thero",
    alias: "Chief Sanghanayaka",
    nic: "MON-COL-0019",
    ordainedYear: "Ordained 1994",
    email: "incumbent@paramitha.lk",
    phone: "+94 11 289 9001",
    committeeName: "Dayaka Sabhawa",
    designation: "President",
    role: "temple_admin",
    roleDisplay: "President",
    roleSubtitle: "Dayaka Sabhawa • Monastic Sovereignty",
    status: "permanent",
    avatar: "MA",
    avatarBg: "#DCFCE7",
    avatarColor: "#15803D",
    isPermanent: true,
  },
  {
    id: 2,
    templeName: "Sri Sambodhi Maha Viharaya",
    templeCode: "TPL-2026-0482",
    firstName: "Sunil",
    lastName: "Jayawardena",
    name: "Sunil Jayawardena",
    alias: "Sunil Aiya",
    nic: "197418900450",
    ordainedYear: "Verified NIC (SL)",
    email: "sunil.j@gmail.com",
    phone: "+94 71 889 0012",
    committeeName: "Dayaka Sabhawa",
    designation: "Vice-President",
    role: "co_admin",
    roleDisplay: "Vice-President",
    roleSubtitle: "Dayaka Sabhawa • Executive Board",
    status: "active",
    avatar: "SJ",
    avatarBg: "#E0F2FE",
    avatarColor: "#0284C7",
    isPermanent: false,
  },
  {
    id: 3,
    templeName: "Sri Sambodhi Maha Viharaya",
    templeCode: "TPL-2026-0482",
    firstName: "Pasindu",
    lastName: "Wickramasinghe",
    name: "Pasindu Wickramasinghe",
    alias: "Podda",
    nic: "198824500910",
    ordainedYear: "Verified NIC (SL)",
    email: "pasindu@dayaka.lk",
    phone: "+94 76 554 1120",
    committeeName: "Event or Programme Committee",
    designation: "Secretary",
    role: "committee",
    roleDisplay: "Secretary",
    roleSubtitle: "Event or Programme Committee",
    status: "active",
    avatar: "PW",
    avatarBg: "#F3E8FF",
    avatarColor: "#7E22CE",
    isPermanent: false,
  },
  {
    id: 4,
    templeName: "Sri Sambodhi Maha Viharaya",
    templeCode: "TPL-2026-0482",
    firstName: "Kamal",
    lastName: "Rajapaksha",
    name: "Kamal Rajapaksha",
    alias: "Punchi Mahaththaya",
    nic: "196200400110",
    ordainedYear: "Old Format NIC",
    email: "kamal.raj@sltnet.lk",
    phone: "+94 77 332 9901",
    committeeName: "Dayaka Sabhawa",
    designation: "Treasurer",
    role: "committee",
    roleDisplay: "Treasurer",
    roleSubtitle: "Dayaka Sabhawa • Finance Trustee",
    status: "deactivated",
    avatar: "KR",
    avatarBg: "#FFE4E6",
    avatarColor: "#E11D48",
    isPermanent: false,
  },
  {
    id: 5,
    templeName: "Sri Sambodhi Maha Viharaya",
    templeCode: "TPL-2026-0482",
    firstName: "Anula",
    lastName: "Ratnayake",
    name: "Anula Ratnayake",
    alias: "Ratnayake Manike",
    nic: "197265400192",
    ordainedYear: "Verified NIC (SL)",
    email: "anula.ratnayake@gmail.com",
    phone: "+94 70 334 8811",
    committeeName: "Event or Programme Committee",
    designation: "Committee Member",
    role: "committee",
    roleDisplay: "Committee Member",
    roleSubtitle: "Event or Programme Committee",
    status: "active",
    avatar: "AR",
    avatarBg: "#FEF3C7",
    avatarColor: "#D97706",
    isPermanent: false,
  }
];

export const SEED_FAMILIES: FamilyRecord[] = [
  {
    key: 'jayasundara',
    id: 'FAM-0812',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: 'W. M.',
    lastName: 'Jayasundara',
    name: 'W. M. Jayasundara',
    alias: '"Jaya Mama"',
    email: 'jayasundara.fam@gmail.com',
    phone: '+94 77 221 4455',
    address: 'No. 18, Temple Road',
    village: 'Walasmulla Central',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'temple-road',
    status: 'Active',
    enrollmentMode: 'QR Self-Registered',
    enrollmentType: 'qr',
    members: [
      { name: 'W. M. Jayasundara', role: 'Head of Household', age: 61, gender: 'Male' },
      { name: 'Kusumlatha Jayasundara', role: 'Spouse', age: 56, gender: 'Female' },
      { name: 'Kasun Jayasundara', role: 'Son', age: 28, gender: 'Male' },
      { name: 'Dilini Jayasundara', role: 'Daughter-in-law', age: 26, gender: 'Female' }
    ]
  },
  {
    key: 'siriwardena',
    id: 'FAM-0144',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: 'Nimal',
    lastName: 'Siriwardena',
    name: 'Nimal Siriwardena',
    alias: 'Transferred from Bodhirukkaramaya',
    email: 'nimal.siriwardena@sltnet.lk',
    phone: '+94 71 889 0044',
    address: 'Station Road',
    village: 'North Ward',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'north-ward',
    status: 'Active',
    enrollmentMode: 'Transferred via QR',
    enrollmentType: 'transfer',
    members: [
      { name: 'Nimal Siriwardena', role: 'Head of Household', age: 48, gender: 'Male' },
      { name: 'Malani Siriwardena', role: 'Spouse', age: 45, gender: 'Female' },
      { name: 'Nuwan Siriwardena', role: 'Son', age: 18, gender: 'Male' }
    ]
  },
  {
    key: 'ratnayake',
    id: 'FAM-0329',
    templeName: 'Sri Sambodhi Maha Viharaya',
    templeCode: 'TPL-2026-0482',
    firstName: 'Anula',
    lastName: 'Ratnayake',
    name: 'Anula Ratnayake',
    alias: '"Ratnayake Manike"',
    email: 'anula.ratnayake@gmail.com',
    phone: '+94 70 334 8811',
    address: 'Main Street',
    village: 'Meda Gama',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'meda-gama',
    status: 'Active',
    enrollmentMode: 'Manual Clergy Entry',
    enrollmentType: 'manual',
    members: [
      { name: 'Anula Ratnayake', role: 'Head of Household', age: 54, gender: 'Female' },
      { name: 'Sunil Ratnayake', role: 'Spouse', age: 58, gender: 'Male' },
      { name: 'Nadeesha Ratnayake', role: 'Daughter', age: 24, gender: 'Female' },
      { name: 'Tharindu Ratnayake', role: 'Son', age: 21, gender: 'Male' },
      { name: 'Soma Nanda', role: 'Mother', age: 82, gender: 'Female' }
    ]
  }
];

export const SEED_INCOMING_TRANSFERS: IncomingTransferRecord[] = [
  {
    id: 'TRF-REQ-8821',
    certificateNumber: 'TRF-CLR-2026-0419',
    originTempleName: 'Bodhirukkaramaya — Walasmulla',
    originTempleCode: 'TPL-2024-0198',
    dispatchedBy: 'Ven. Saddhatissa Thero (Chief Incumbent)',
    dispatchedDate: '21 Oct 2026',
    transferReason: 'Permanent Residence Relocation to Walasmulla Meda Gama',
    firstName: 'Sarath Kumara',
    lastName: 'Bandara',
    name: 'Sarath Kumara Bandara',
    phone: '+94 77 445 1199',
    email: 'sarath.k.bandara@gmail.com',
    newAddress: 'No. 54, Station Road',
    newVillage: 'Meda Gama',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'meda-gama',
    danaSeniority: 'Senior Dayaka (12 years regular Dana participant)',
    members: [
      { name: 'Sarath Kumara Bandara', role: 'Head of Household', age: 52, gender: 'Male' },
      { name: 'Chandra Bandara', role: 'Spouse', age: 49, gender: 'Female' },
      { name: 'Kaveen Bandara', role: 'Son', age: 22, gender: 'Male' },
      { name: 'Chamari Bandara', role: 'Daughter', age: 17, gender: 'Female' }
    ]
  },
  {
    id: 'TRF-REQ-9042',
    certificateNumber: 'TRF-CLR-2026-0883',
    originTempleName: 'Gangaramaya Maha Viharaya — Colombo 02',
    originTempleCode: 'TPL-2023-0012',
    dispatchedBy: 'Ven. Dr. Seelavansa Thero (Parish Secretary)',
    dispatchedDate: '24 Oct 2026',
    transferReason: 'Relocation to Ancestral Village / Devotee Request',
    firstName: 'Lalitha',
    lastName: 'Jayasekara',
    name: 'Lalitha Jayasekara',
    phone: '+94 71 223 9900',
    email: 'lalitha.j@slt.lk',
    newAddress: 'No. 12/B, Temple Road',
    newVillage: 'Temple Road',
    district: 'Hambantota',
    postalCode: '82200',
    ward: 'temple-road',
    danaSeniority: 'Vesak Poya Mahadana Contributor',
    members: [
      { name: 'Lalitha Jayasekara', role: 'Head of Household', age: 59, gender: 'Male' },
      { name: 'Dayani Jayasekara', role: 'Spouse', age: 55, gender: 'Female' },
      { name: 'Sandun Jayasekara', role: 'Son', age: 27, gender: 'Male' }
    ]
  }
];

export const SEED_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'AUD-2026-0941',
    timestamp: '26 Oct 2026, 14:30',
    adminName: 'Ven. Medagoda Abhayathissa Thero',
    adminRole: 'Temple Admin',
    targetType: 'User',
    targetName: 'Kamal Rajapaksha',
    targetId: 'USR-004',
    action: 'Deactivated',
    reason: 'End of 2-year committee term • Historical ledger records preserved',
    statusBadge: 'deactivated'
  },
  {
    id: 'AUD-2026-0898',
    timestamp: '25 Oct 2026, 10:15',
    adminName: 'Nimal Perera',
    adminRole: 'Co-Administrator',
    targetType: 'Family',
    targetName: 'K. G. Jayasundara',
    targetId: 'FAM-0812',
    action: 'Reactivated',
    reason: 'Returned to parish residence / Devotee reinstatement',
    statusBadge: 'active'
  },
  {
    id: 'AUD-2026-0885',
    timestamp: '22 Oct 2026, 09:40',
    adminName: 'Nimal Perera',
    adminRole: 'Co-Administrator',
    targetType: 'User',
    targetName: 'Pasindu Wickramasinghe',
    targetId: 'USR-003',
    action: 'Role Updated',
    reason: 'Promoted to Event or Programme Committee Secretary',
    statusBadge: 'active'
  },
  {
    id: 'AUD-2026-0872',
    timestamp: '19 Oct 2026, 16:05',
    adminName: 'Ven. Medagoda Abhayathissa Thero',
    adminRole: 'Temple Admin',
    targetType: 'Family',
    targetName: 'Anula Ratnayake',
    targetId: 'FAM-0329',
    action: 'Created',
    reason: 'Admin-assisted registration via clergy registry desk',
    statusBadge: 'active'
  },
  {
    id: 'AUD-2026-0850',
    timestamp: '14 Oct 2026, 11:20',
    adminName: 'Ven. Medagoda Abhayathissa Thero',
    adminRole: 'Temple Admin',
    targetType: 'Family',
    targetName: 'Nimal Siriwardena',
    targetId: 'FAM-0144',
    action: 'Transfer Approved',
    reason: 'Inter-temple clearance accepted from Bodhirukkaramaya',
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

export const KNOWN_DEVOTEES_REGISTRY: KnownDevoteeEntry[] = [
  {
    nic: '197214500210',
    phone: '+94 77 221 4455',
    cleanPhone: '0772214455',
    name: 'W. M. Jayasundara',
    familyId: 'FAM-0812',
    templeName: 'Sri Sambodhi Maha Viharaya / Bodhirukkaramaya',
    village: 'Walasmulla Central'
  },
  {
    nic: '196811200344',
    phone: '+94 71 889 0044',
    cleanPhone: '0718890044',
    name: 'Nimal Siriwardena',
    familyId: 'FAM-0144',
    templeName: 'Bodhirukkaramaya — Walasmulla',
    village: 'North Ward'
  },
  {
    nic: '197265400192',
    phone: '+94 70 334 8811',
    cleanPhone: '0703348811',
    name: 'Anula Ratnayake',
    familyId: 'FAM-0329',
    templeName: 'Sri Sambodhi Maha Viharaya',
    village: 'Meda Gama'
  },
  {
    nic: '198421000889',
    phone: '+94 77 445 1199',
    cleanPhone: '0774451199',
    name: 'Sarath Kumara Bandara',
    familyId: 'FAM-0902',
    templeName: 'Bodhirukkaramaya — Walasmulla',
    village: 'Meda Gama'
  }
];

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
  { name: 'Bodhirukkaramaya — Walasmulla', code: 'TPL-2024-0198', district: 'Hambantota' },
  { name: 'Sri Sudharmarama Purana Viharaya — Weeraketiya', code: 'TPL-2025-0341', district: 'Hambantota' },
  { name: 'Gangaramaya Maha Viharaya — Colombo 02', code: 'TPL-2023-0012', district: 'Colombo' },
  { name: 'Bellanwila Rajamaha Viharaya — Boralesgamuwa', code: 'TPL-2021-0089', district: 'Colombo' },
  { name: 'Kelaniya Raja Maha Viharaya — Kelaniya', code: 'TPL-2020-0005', district: 'Gampaha' },
  { name: 'Asgiriya Maha Viharaya — Kandy', code: 'TPL-2019-0002', district: 'Kandy' },
  { name: 'Malwathu Maha Viharaya — Kandy', code: 'TPL-2019-0001', district: 'Kandy' },
  { name: 'Ruwanweli Maha Seya Parish Viharaya — Anuradhapura', code: 'TPL-2018-0003', district: 'Anuradhapura' }
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
