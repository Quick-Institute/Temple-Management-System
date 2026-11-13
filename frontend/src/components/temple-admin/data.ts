// Reference sample data; replace these collections with API results when available.
export const summary = [
  { title: 'Registered Families', value: '248', change: '12 this month', icon: 'users', tone: 'blue', to: '/family-members' },
  { title: 'Total Dana Bookings', value: '36', change: '8 this month', icon: 'calendar-days', tone: 'green', to: '/dana-management' },
  { title: 'Total Donations', value: 'Rs. 125,000', change: '15% this month', icon: 'heart', tone: 'gold', to: '/donations' },
  { title: 'Upcoming Events', value: '5', change: '2 this week', icon: 'calendar-check', tone: 'purple', to: '/event-management' },
];
export const temple = { name: 'Kataragama Temple', location: 'Kataragama, Monaragala', registrationId: 'TM-0001', status: 'Active', chiefIncumbent: 'Ven. Dammika Thero', contact: '+94 47 223 4567' };
export const schedule = [
  { time: '08:00 AM', title: 'Morning Dana', location: 'Main Hall', badge: '2 Bookings', dot: 'bg-[#006542]' },
  { time: '10:00 AM', title: 'Lunch Dana', location: 'Main Hall', badge: '3 Bookings', dot: 'bg-[#087CFF]' },
  { time: '11:00 AM', title: 'Children’s Dhamma Class', location: 'Education Hall', badge: 'Event', dot: 'bg-[#17C92F]' },
  { time: '03:00 PM', title: 'Bodhi Puja', location: 'Main Hall', badge: '1 Booking', dot: 'bg-[#8334EF]' },
];
export const bookings = [
  { id: 'B001', date: '15 Oct 2026', family: 'Nimal Perera', type: 'Morning Dana', time: '08:00 AM', status: 'Pending' },
  { id: 'B002', date: '16 Oct 2026', family: 'Saman Jayasundara', type: 'Lunch Dana', time: '11:00 AM', status: 'Approved' },
  { id: 'B003', date: '20 Oct 2026', family: 'Fernando Family', type: 'Morning Dana', time: '08:00 AM', status: 'Approved' },
  { id: 'B004', date: '22 Oct 2026', family: 'Perera Family', type: 'Lunch Dana', time: '11:00 AM', status: 'Rejected' },
];
export const actions = [
  { title: 'Add Dana Slot', icon: 'calendar-plus', tone: 'green', to: '/dana-management', action: 'add-slot' },
  { title: 'Create Event', icon: 'calendar-check', tone: 'purple', to: '/event-management', action: 'create' },
  { title: 'Send Announcement', icon: 'megaphone', tone: 'red', to: '/announcements', action: 'create' },
  { title: 'Manage Users', icon: 'users', tone: 'blue', to: '/user-management' },
];
export const notifications = [
  { id: 'N001', title: 'New dana booking request received.', detail: 'Nimal Perera · 15 Oct 2026 · Morning Dana', time: '10:15 AM', icon: 'file-lines', tone: 'gold' },
  { id: 'N002', title: 'New event added: Poson Programme.', detail: '22 Oct 2026 · Kataragama Temple', time: '08:30 AM', icon: 'calendar-check', tone: 'purple' },
  { id: 'N003', title: 'New family registration request.', detail: 'Fernando Family', time: '08:30 AM', icon: 'users', tone: 'green' },
  { id: 'N004', title: 'Donation of Rs. 5,000 received.', detail: 'Saman Jayasundara', time: '09:42 AM', icon: 'heart', tone: 'red' },
];
