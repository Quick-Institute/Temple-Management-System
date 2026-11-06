import { actions, schedule } from './data';

// Share the Admin records; only the Co-Administrator differences live here.
export const coAdminSchedule = [
  ...schedule,
  { time: '05:00 PM', title: 'Pirith Chanting', location: 'Main Hall', badge: 'Event', dot: 'bg-[#17C92F]' },
];

export const coAdminActions = [
  { ...actions[0], title: 'Manage Dana Slots', action: undefined },
  actions[1],
  actions[2],
  { ...actions[3], title: 'Manage Family Members', to: '/family-members' },
];
