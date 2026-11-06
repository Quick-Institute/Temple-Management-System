export type UserRole = "family" | "templeAdmin" | "coAdmin" | "superAdmin";

export interface AppUser {
  id?: string;
  name?: string;
  role?: UserRole;
  avatarSrc?: string;
  familyName?: string;
  contactNumber?: string;
  [key: string]: unknown;
}

export interface MainLayoutProps {
  children: import("react").ReactNode;
  role?: UserRole;
  basePath?: string;
  userName?: string;
  avatarSrc?: string;
}

export interface UserPageProps {
  user?: AppUser;
}

export interface TempleDashboardProps extends UserPageProps {
  basePath?: string;
  role?: "templeAdmin" | "coAdmin";
}
