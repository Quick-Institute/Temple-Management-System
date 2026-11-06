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
    card: 'bg-[#0F4D34] text-white border-[#0F4D34]',
  },
  Pending: {
    label: 'Pending',
    icon: 'material-symbols:schedule-outline',
    card: 'bg-[#FBEFC8] text-[#8A5A00] border-[#F1DFA3]',
    badge: 'bg-[#FBE9A8] text-[#8A5A00]',
  },
  Approved: {
    label: 'Approved',
    icon: 'material-symbols:check-circle',
    card: 'bg-[#E2F6CC] text-[#2C6423] border-[#CFEBB0]',
    badge: 'bg-[#E2F6CC] text-[#2C6423]',
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
    card: 'bg-[#ECECEA] text-[#55605B] border-[#DDDDD9]',
    badge: 'bg-[#E8E8E5] text-[#55605B]',
  },
  Completed: {
    label: 'Completed',
    icon: 'material-symbols:sports-score',
    card: 'bg-[#EDE4FB] text-[#6B3FA0] border-[#DDCFF3]',
    badge: 'bg-[#EDE4FB] text-[#6B3FA0]',
  },
};

export const FILTER_ORDER = [ALL_BOOKINGS, 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];
