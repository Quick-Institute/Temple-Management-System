import type { UserPageProps } from '../../types';
import WelcomeBanner from '../../components/layout/WelcomeBanner';
import TempleAdminSections from '../../components/temple-admin/TempleAdminSections';

export default function CoAdminDashboard({ user }: UserPageProps) {
  return <div className="flex flex-col gap-5"><WelcomeBanner role="coAdmin" user={user} /><TempleAdminSections role="coAdmin" basePath="/co-admin" user={user} /></div>;
}
