// Reference-design sample data. Replace these exports with API data when available.
export const summaryCards = [
  { title: 'My Temple', value: 'Kataragama Temple', detail: 'Kataragama, Monaragala', icon: 'landmark', tone: 'mint', to: '/temple-information', location: true },
  { title: 'Upcoming Dana', value: '1 Booking', detail: 'In next 7 days', icon: 'calendar-days', tone: 'mint', to: '/my-bookings' },
  { title: 'Family Members', value: '4 Registered', detail: 'Family accounts', icon: 'users', tone: 'green', to: '/my-family' },
  { title: 'Upcoming Events', value: '3 This month', detail: 'At your temple', icon: 'calendar-days', tone: 'purple', to: '/events' },
];
export const booking = { day: '15', month: 'NOV', year: '2026', title: 'Morning Dana', temple: 'Kataragama Temple', time: '8:00 AM – 9:00 AM', status: 'Pending', message: 'Your booking request has been submitted. You will be notified once it is approved.' };
export const actions = [
  { title: 'Book a Dana', detail: 'Schedule an almsgiving', icon: 'calendar-plus', tone: 'green', to: '/dana-schedule' },
  { title: 'My Bookings', detail: 'View and manage your bookings', icon: 'file-lines', tone: 'blue', to: '/my-bookings' },
  { title: 'View Events', detail: 'See upcoming events', icon: 'calendar-check', tone: 'orange', to: '/events' },
  { title: 'Temple Information', detail: 'Explore your temple', icon: 'landmark-dome', tone: 'purple', to: '/temple-information' },
];
export const events = [
  { id: 'dhamma-sermon', day: '22', month: 'OCT', title: 'Dhamma Sermon', temple: 'Kataragama Temple', time: '10:00 AM – 12:00 PM', image: '/event-1.png', alt: 'White lotus blossom', status: 'Upcoming' },
  { id: 'poson-programme', day: '28', month: 'OCT', title: 'Poson Programme', temple: 'Kataragama Temple', time: '06:00 PM – 08:00 PM', image: '/event-2.png', alt: 'Buddhist flags beside a temple stupa', status: 'Upcoming' },
];
export const notifications = [
  { id: 'booking', title: 'Your dana booking request has been received.', detail: '15 Nov 2026 · Morning Dana · Kataragama Temple', time: '10:15 AM', icon: 'file-lines', tone: 'gold' },
  { id: 'event', title: 'New event added: Dhamma Sermon.', detail: '22 Oct 2026 · Kataragama Temple', time: '08:30 AM', icon: 'calendar-days', tone: 'purple' },
  { id: 'family', title: 'Your new family member account has been approved.', detail: 'Nimal Perera · Family Member', time: 'Yesterday', icon: 'users', tone: 'green' },
];
