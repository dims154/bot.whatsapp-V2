export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  permissions?: string[];
}
