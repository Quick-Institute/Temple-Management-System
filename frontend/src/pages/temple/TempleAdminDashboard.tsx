import type { TempleDashboardProps } from "../../types";
import WelcomeBanner from '../../components/layout/WelcomeBanner';
import TempleAdminSections from '../../components/temple-admin/TempleAdminSections';

export default function TempleAdminDashboard({ user, basePath = '', role = 'templeAdmin' }: TempleDashboardProps) {
  return <div className="flex flex-col gap-5"><WelcomeBanner role={role} user={user} /><TempleAdminSections role={role} basePath={basePath} user={user} /></div>;
}
