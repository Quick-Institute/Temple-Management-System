/* ------------------------------------------------------------------
   Option lists for the temple information forms.

   Temple type is deliberately open - the proposal does not fix a list, and temples use many
   names (Maha Viharaya, Purana Viharaya, Rajamaha Viharaya, Pirivena, Aranya Senasana, ...), so
   the field offers suggestions but accepts anything typed. Same for facilities and capacity
   rows, which can be added to.
   ------------------------------------------------------------------ */

import {DISTRICTS} from './temples'
import type {CoAdministratorRole} from './templeStatus'

/**
 * The temple types the project uses. "Other" is kept at the end for a temple that does not match
 * any of them, and the field still accepts a typed value so the list is not a hard limit.
 */
export const TEMPLE_TYPES = [
    'Maha Viharaya',
    'Raja Maha Viharaya',
    'Purana Viharaya',
    'Purana Raja Maha Viharaya',
    'Abhinawaramaya',
    'Viharaya',
    'Aramaya',
    'Pansala',
    'Aranya Senasanaya',
    'Len Viharaya',
    'Tampita Viharaya',
    'Bodhirajaramaya',
    'Pirivena',
    'Dharmayathanaya',
    'Buddhist Meditation Centre',
    'International Buddhist Centre',
    'Other',
]

/**
 * Co-Administrators, per the proposal (10.2.3): the Temple Admin may appoint a Co-Administrator
 * to assist. The two roles the temple can appoint are these - neither carries platform
 * privileges, and neither is the Super Administrator.
 */
/**
 * The designations the proposal names. A temple can appoint more than two Co-Administrators and
 * the field is creatable, so this is a starting list rather than a closed set.
 */
export const CO_ADMIN_ROLES: CoAdministratorRole[] = [
    'Authorized Religious Representative',
    'Designated Technical Administrator',
]

export const PROVINCES = [
    'Western',
    'Central',
    'Southern',
    'Northern',
    'Eastern',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa',
]

export const DISTRICTS_EN = DISTRICTS.map((district) => district.en)

export const FACILITY_SUGGESTIONS = [
    'Buddha Mandiraya',
    'Sri Maha Bodhiya',
    'Dana Salawa',
    'Daham Pasal hall',
    'Library',
    'Bhikkhu residence',
    'Pilgrim rest hall',
    'Vehicle parking',
    'Wheelchair access',
    'Water & electricity',
    'Crematorium',
    'Funeral parlour',
]

export const DANA_SESSION_SUGGESTIONS = [
    'Morning Dana',
    'Lunch Dana',
    'Evening Dana',
    'Gilampasa offering',
]

export const COMMITTEE_ROLES = [
    'Chief Incumbent',
    'Dayaka Sabha President',
    'Vice President',
    'Secretary',
    'Assistant Secretary',
    'Treasurer',
    'Dana Coordinator',
    'Committee Member',
]