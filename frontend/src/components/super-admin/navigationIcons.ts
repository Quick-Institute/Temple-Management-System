import { adminNavigationIcons } from '../temple-admin/navigationIcons';

// Sidebar icons for the Super Admin role, keyed by route. Local Font Awesome
// data is reused where it exists; the rest are Iconify names (fa6-solid).
export const superAdminNavigationIcons = {
  '/dashboard': adminNavigationIcons['/dashboard'],
  '/temples': adminNavigationIcons['/temple-information'],
  '/user-management': adminNavigationIcons['/family-members'],
  '/donors': adminNavigationIcons['/donations'],
  '/dana-schedules': adminNavigationIcons['/event-management'],
  '/event-management': adminNavigationIcons['/event-management'],
  '/programmes': 'fa6-solid:book-open',
  '/announcements': adminNavigationIcons['/announcements'],
  '/reports': adminNavigationIcons['/reports'],
  '/system-settings': adminNavigationIcons['/settings'],
};
