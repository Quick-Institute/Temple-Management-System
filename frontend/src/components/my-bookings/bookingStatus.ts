/* Visual configuration shared by the My Bookings filter cards, table badges and dialogs. */

export const ALL_BOOKINGS = 'All';

export const ICON = {
    all: 'material-symbols:list-alt-outline',
    calendar: 'material-symbols:calendar-month',
    clock: 'material-symbols:schedule-outline',
    participants: 'material-symbols:groups',
    view: 'material-symbols:visibility',
    cancel: 'material-symbols:cancel',
    close: 'material-symbols:close',
    temple: 'material-symbols:temple-buddhist',
    dana: 'material-symbols:volunteer-activism',
};

/* `badge` = pill in the table / dialog, `card` = filter card (colour scheme from the design brief). */
export const STATUS_STYLES = {
    [ALL_BOOKINGS]: {
        label: 'All Bookings',
        icon: ICON.all,
        card: 'bg-[#0f384d] text-white border-[#0f384d]',
    },
    Pending: {
        label: 'Pending',
        icon: 'material-symbols:schedule-outline',
        card: 'bg-[#c8edfb] text-[#00658a] border-[#a3dcf1]',
        badge: 'bg-[#a8e5fb] text-[#00658a]',
    },
    Approved: {
        label: 'Approved',
        icon: 'material-symbols:check-circle',
        card: 'bg-[#cce8f6] text-[#234e64] border-[#b0d7eb]',
        badge: 'bg-[#cce8f6] text-[#234e64]',
    },
    Rejected: {
        label: 'Rejected',
        icon: 'material-symbols:cancel',
        card: 'bg-[#FCE1DE] text-[#B3281C] border-[#F6C9C4]',
        badge: 'bg-[#FCE1DE] text-[#B3281C]',
    },
    Cancelled: {
        label: 'Cancelled',
        icon: 'material-symbols:block',
        card: 'bg-[#ECECEA] text-[#446271] border-[#DDDDD9]',
        badge: 'bg-[#e1e9ec] text-[#446271]',
    },
    Completed: {
        label: 'Completed',
        icon: 'material-symbols:sports-score',
        card: 'bg-[#EDE4FB] text-[#6B3FA0] border-[#DDCFF3]',
        badge: 'bg-[#EDE4FB] text-[#6B3FA0]',
    },
};

export const FILTER_ORDER = [ALL_BOOKINGS, 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];