export interface DanaSlot {
    id: string;
    name: string;
    time: string;
    capacity: number;
    image: string;
    alt: string;
    booked?: number;
    available?: number;
}

export type BookingStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";

export interface DanaBookingRecord {
    id: string;
    reference: string;
    templeId: string;
    date: string;
    slotId: string;
    familyId: string | null;
    familyName?: string;
    contactNumber?: string;
    participants: number;
    notes?: string;
    status: BookingStatus;
}

export interface DanaBooking extends DanaBookingRecord {
    danaType: string;
    time: string;
    templeName: string;
}

export interface BookDanaSlotInput {
    templeId: string;
    date: string;
    slotId: string;
    familyId?: string | null;
    familyName: string;
    contactNumber: string;
    participants: number;
    notes?: string;
}

export const TEMPLES = [
    {id: 'nelligala', name: 'Nelligala Temple'},
    {id: 'kataragama', name: 'Kataragama Temple'},
    {id: 'kelaniya', name: 'Kelaniya Raja Maha Vihara'},
];

export const DANA_SLOTS: DanaSlot[] = [
    {
        id: 'morning',
        name: 'Morning Dana',
        time: '6:30 AM - 8:00 AM',
        capacity: 10,
        image: '/morning-dana.png',
        alt: 'Morning Dana meal offering'
    },
    {
        id: 'midday',
        name: 'Midday Dana',
        time: '10:30 AM - 12:00 PM',
        capacity: 15,
        image: '/midday-dana.png',
        alt: 'Midday Dana meal offering'
    },
];

export const DEFAULT_TEMPLE_ID = 'nelligala';
export const DEFAULT_DATE = '2026-10-30';

const DELAY_MS = 250;
const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS));

/* Bookings made this session, keyed by temple|date|slot. */
const bookedCounts = new Map();
const bookings: DanaBookingRecord[] = [];

/* Existing bookings before this session, so the first new reference reads DANA-2026-00148. */
const BASE_REFERENCE_NUMBER = 147;

const keyFor = (templeId, date, slotId) => `${templeId}|${date}|${slotId}`;

/* Sample baseline so every temple/date shows data (matches the reference for
   Nelligala on 30 Oct 2026: 6/10 morning, 11/15 midday). */
function baselineBooked(templeId: string, date: string, slot: DanaSlot): number {
    if (templeId === DEFAULT_TEMPLE_ID && date === DEFAULT_DATE) {
        return slot.id === 'morning' ? 6 : 11;
    }
    let hash = 0;
    for (const char of `${templeId}${date}${slot.id}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return hash % (slot.capacity + 1);
}

function readSlots(templeId: string, date: string): DanaSlot[] {
    return DANA_SLOTS.map((slot) => {
        const booked = baselineBooked(templeId, date, slot) + (bookedCounts.get(keyFor(templeId, date, slot.id)) ?? 0);
        const capped = Math.min(booked, slot.capacity);
        return {...slot, booked: capped, available: slot.capacity - capped};
    });
}

export async function getDanaAvailability({templeId, date}: { templeId: string; date: string }): Promise<DanaSlot[]> {
    await wait();
    if (!TEMPLES.some((temple) => temple.id === templeId)) throw new Error('Please select a valid temple.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw new Error('Please select a valid date.');
    return readSlots(templeId, date);
}

export async function bookDanaSlot({
                                       templeId,
                                       date,
                                       slotId,
                                       familyId,
                                       familyName,
                                       contactNumber,
                                       participants,
                                       notes
                                   }: BookDanaSlotInput): Promise<DanaBookingRecord> {
    await wait();
    const slot = readSlots(templeId, date).find((item) => item.id === slotId);
    if (!slot) throw new Error('This Dana slot does not exist.');
    if (slot.available <= 0) throw new Error('Sorry, this Dana slot has just reached its maximum capacity.');

    const key = keyFor(templeId, date, slotId);
    bookedCounts.set(key, (bookedCounts.get(key) ?? 0) + 1);
    const sequence = BASE_REFERENCE_NUMBER + bookings.length + 1;
    const reference = `DANA-${date.slice(0, 4)}-${String(sequence).padStart(5, '0')}`;
    const booking: DanaBookingRecord = {
        id: `dana-${Date.now()}-${bookings.length + 1}`,
        reference,
        templeId,
        date,
        slotId,
        familyId: familyId ?? null,
        familyName,
        contactNumber,
        participants,
        notes,
        status: 'Pending'
    };
    bookings.push(booking);
    return booking;
}

/* ------------------------------------------------------------------ *
 * My Bookings API
 * Replace the bodies of `getMyBookings` and `cancelDanaBooking` with fetch
 * calls when the backend is ready; the My Bookings page does not change.
 * ------------------------------------------------------------------ */

export const BOOKING_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];

/* TEMPORARY MOCK: booking history that already existed before this session.
   Remove once the backend returns the family's real history. */
const SAMPLE_BOOKING_HISTORY: DanaBookingRecord[] = [
    {
        id: 'dana-history-136',
        reference: 'DANA-2026-00136',
        templeId: 'nelligala',
        date: '2026-10-25',
        slotId: 'morning',
        familyId: null,
        participants: 4,
        status: 'Approved'
    },
    {
        id: 'dana-history-121',
        reference: 'DANA-2026-00121',
        templeId: 'nelligala',
        date: '2026-10-17',
        slotId: 'midday',
        familyId: null,
        participants: 5,
        status: 'Completed'
    },
    {
        id: 'dana-history-109',
        reference: 'DANA-2026-00109',
        templeId: 'nelligala',
        date: '2026-10-12',
        slotId: 'midday',
        familyId: null,
        participants: 8,
        status: 'Cancelled'
    },
    {
        id: 'dana-history-102',
        reference: 'DANA-2026-00102',
        templeId: 'nelligala',
        date: '2026-10-03',
        slotId: 'morning',
        familyId: null,
        participants: 6,
        status: 'Approved'
    },
];

/* Only requests that are still waiting for temple approval can be cancelled. */
export const canCancelBooking = (booking?: Pick<DanaBookingRecord, 'status'> | null): boolean => booking?.status === 'Pending';

const withDetails = (booking: DanaBookingRecord): DanaBooking => {
    const slot = DANA_SLOTS.find((item) => item.id === booking.slotId);
    const temple = TEMPLES.find((item) => item.id === booking.templeId);
    return {...booking, danaType: slot?.name ?? 'Dana', time: slot?.time ?? '', templeName: temple?.name ?? ''};
};

/* Newest Dana date first; the newest reference wins when dates tie. */
const newestFirst = (a: DanaBooking, b: DanaBooking) => b.date.localeCompare(a.date) || b.reference.localeCompare(a.reference);

export async function getMyBookings({familyId}: { familyId?: string } = {}): Promise<DanaBooking[]> {
    await wait();
    return [...bookings, ...SAMPLE_BOOKING_HISTORY]
        .filter((booking) => familyId == null || booking.familyId == null || booking.familyId === familyId)
        .map(withDetails)
        .sort(newestFirst);
}

export async function cancelDanaBooking(bookingId: string): Promise<DanaBooking> {
    await wait();
    const record = [...bookings, ...SAMPLE_BOOKING_HISTORY].find((booking) => booking.id === bookingId);
    if (!record) throw new Error('This booking could not be found.');
    if (!canCancelBooking(record)) throw new Error('Only pending bookings can be cancelled.');

    record.status = 'Cancelled';
    // Give the slot back so availability on the Dana Schedule page stays correct.
    const key = keyFor(record.templeId, record.date, record.slotId);
    bookedCounts.set(key, Math.max(0, (bookedCounts.get(key) ?? 0) - 1));
    return withDetails(record);
}

/* "2026-10-30" -> "Fri, 30 Oct 2026" (deterministic, no locale quirks). */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDanaDate(isoDate: string): string {
    const [year, month, day] = (isoDate ?? '').split('-').map(Number);
    if (!year || !month || !day) return '';
    const date = new Date(year, month - 1, day);
    return `${WEEKDAYS[date.getDay()]}, ${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`;
}