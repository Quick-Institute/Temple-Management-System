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

export const SEED_USERS: UserOfficial[] = [];

export const SEED_FAMILIES: FamilyRecord[] = [];

export const SEED_INCOMING_TRANSFERS: IncomingTransferRecord[] = [];

export const SEED_AUDIT_LOGS: AuditLogRecord[] = [];

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
