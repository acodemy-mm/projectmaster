export type AuthRole = 'viewer' | 'super_admin';

export const AUTH_STORAGE_KEY = 'pap_auth_session';

export const VIEW_PASSWORD =
  import.meta.env.VITE_VIEW_PASSWORD ?? 'portfolio-view-2026';

export const SUPER_ADMIN_USER =
  import.meta.env.VITE_SUPER_ADMIN_USER ?? 'superadmin';

export const SUPER_ADMIN_PASSWORD =
  import.meta.env.VITE_SUPER_ADMIN_PASSWORD ?? 'SuperAdmin@2026';

export interface AuthSession {
  role: AuthRole;
  username?: string;
  signedInAt: number;
}
