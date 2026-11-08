import type {IconKey} from './navigation'
import type {PermissionKey, RoleKey} from './permissions'
import type {TempleRecord} from './templeStatus'
import {danaDays, donations, events} from './demo'
import type {TempleMember} from './members'

export type SearchGroup = 'Temples' | 'Members' | 'Dana bookings' | 'Events' | 'Donations'

export type SearchHit = {
    id: string
    /** What the row says in the dropdown. */
    label: string
    /** Small grey line under the label. */
    hint: string
    to: string
    group: SearchGroup
    icon: IconKey
}

/** Anything a person may search for. The top bar feeds in what the signed-in role can see. */
export type SearchContent = {
    temples?: TempleRecord[]
    members?: TempleMember[]
}

const includes = (term: string, ...values: (string | undefined | null)[]) =>
    values.filter(Boolean).join(' ').toLowerCase().includes(term)

/** Families booked into a Dana session, flattened so each booking is searchable. */
const bookings = danaDays.flatMap((day) =>
    day.sessions.flatMap((session) =>
        session.families.map((family) => ({
            id: `${day.date}-${session.key}-${family.id}`,
            familyName: family.familyName,
            name: family.familiarName,
            session: session.label,
            date: day.date,
        })),
    ),
)

/**
 * Content search - temples, members, Dana bookings, events and donations.
 *
 * The side menu is deliberately *not* searched: the rail is always on screen, so searching it adds
 * nothing. What people actually look for is a record.
 *
 * `allowed` decides which groups a role may see, so the results never leak another role's data.
 */
export const searchContent = (
    query: string,
    role: RoleKey,
    allowed: (permission: PermissionKey) => boolean,
    content: SearchContent = {},
): SearchHit[] => {
    const term = query.trim().toLowerCase()
    if (!term) return []

    const hits: SearchHit[] = []

    /* Temples */
    hits.push(
        ...(content.temples ?? [])
            .filter((record) =>
                includes(term, record.name, record.village, record.district, record.registrationId, record.type, record.chiefIncumbent),
            )
            .slice(0, 5)
            .map<SearchHit>((record) => ({
                id: `temple-${record.id}`,
                label: record.name,
                hint: [record.status, record.village, record.district].filter(Boolean).join(' · '),
                to: `/temple/${record.id}`,
                group: 'Temples',
                icon: 'temple',
            })),
    )

    /* Members - only for the roles that may open User Management */
    if (allowed('manageUserRoles')) {
        hits.push(
            ...(content.members ?? [])
                .filter((member) =>
                    includes(term, member.name, member.email, member.phone, member.designation, member.familyName, member.committee),
                )
                .slice(0, 4)
                .map<SearchHit>((member) => ({
                    id: `member-${member.id}`,
                    label: member.name,
                    hint: [member.designation, member.category === 'family' ? member.familyName : member.committee]
                        .filter(Boolean)
                        .join(' · '),
                    to: '/user-management',
                    group: 'Members',
                    icon: 'users',
                })),
        )
    }

    /* Dana bookings */
    if (allowed('viewDanaSlots')) {
        hits.push(
            ...bookings
                .filter((booking) => includes(term, booking.familyName, booking.name, booking.session))
                .slice(0, 4)
                .map<SearchHit>((booking) => ({
                    id: `booking-${booking.id}`,
                    label: `${booking.familyName} - ${booking.session}`,
                    hint: `${booking.date} · ${booking.name}`,
                    to: '/my-bookings',
                    group: 'Dana bookings',
                    icon: 'bookings',
                })),
        )
    }

    /* Events */
    if (allowed('manageTempleRecords')) {
        hits.push(
            ...events
                .filter((event) => includes(term, event.title, event.venue, event.category, event.date))
                .slice(0, 4)
                .map<SearchHit>((event) => ({
                    id: `event-${event.id}`,
                    label: event.title,
                    hint: `${event.date} · ${event.venue}`,
                    to: '/event-management',
                    group: 'Events',
                    icon: 'events',
                })),
        )
    }

    /* Donations */
    if (allowed('viewDonations')) {
        hits.push(
            ...donations
                .filter((donation) => includes(term, donation.donor, donation.purpose, donation.reference))
                .slice(0, 3)
                .map<SearchHit>((donation) => ({
                    id: `donation-${donation.id}`,
                    label: donation.donor,
                    hint: `${donation.purpose} · LKR ${donation.amount.toLocaleString('en-LK')}`,
                    to: '/donations',
                    group: 'Donations',
                    icon: 'donations',
                })),
        )
    }

    /* The platform administrator can reach everything, so nothing is filtered for them. */
    void role
    return hits
}