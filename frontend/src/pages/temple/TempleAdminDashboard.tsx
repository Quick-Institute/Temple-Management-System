import type { UserPageProps } from '../../types';
import WelcomeBanner from '../../components/layout/WelcomeBanner';
import TempleAdminSections from '../../components/temple-admin/TempleAdminSections';

export default function TempleAdminDashboard({ user }: UserPageProps) {
  return <div className="flex flex-col gap-5"><WelcomeBanner role="templeAdmin" user={user} /><TempleAdminSections role="templeAdmin" basePath="/temple-admin" user={user} /></div>;
}
