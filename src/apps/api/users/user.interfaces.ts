export interface CreateUserPayload {
    email: string;
    password: string;
    tenantId?: string;
    firstName?: string;
    lastName?: string;
    whatsappNumber?: string;
    roleIds?: string[];
    permissionIds?: string[];
}

export interface UpdateUserPayload {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    whatsappNumber?: string;
    active?: boolean;
    roleIds?: string[];
    permissionIds?: string[];
}

export interface UserRoleAssignment {
    roleIds: string[];
}

export interface UserPermissionAssignment {
    permissionIds: string[];
}