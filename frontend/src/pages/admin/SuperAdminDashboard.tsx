import type { UserPageProps } from "../../types";
import WelcomeBanner from '../../components/layout/WelcomeBanner';
import SuperAdminSections from '../../components/super-admin/SuperAdminSections';

export default function SuperAdminDashboard({ user }: UserPageProps) {
  return <div className="flex flex-col gap-5"><WelcomeBanner role="superAdmin" user={user} /><SuperAdminSections /></div>;
}
