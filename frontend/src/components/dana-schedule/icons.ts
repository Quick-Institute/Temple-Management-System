import { icons } from '../dashboard/icons';

/* Reuses the dashboard's local icon data; the chevron is the same asset the Topbar registers. */
export const danaIcons = {
  temple: icons.landmark,
  calendar: icons['calendar-days'],
  info: icons['circle-info'],
  users: icons.users,
  chevronDown: {
    width: 24,
    height: 24,
    body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 10l5 5m0 0l5-5"/>',
  },
};
