import { Permission } from '@core/enums/permissions.enum';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  maxClients: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
  permissions?: Permission[];
  maxClients: number;
  adminUser: AdminUserDto;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  permissions?: Permission[];
  maxClients?: number;
}

export interface UpdateOrganizationPermissionsDto {
  permissions: Permission[];
}

export interface OrganizationResponse {
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  admin: {
    _id: string;
    email: string;
    role: string;
    organizationId: string;
  };
  firebaseUser: {
    uid: string;
    email: string;
  };
}

export interface OrganizationClientStats {
  currentClients: number;
  maxClients: number;
  available: number;
  percentage: number;
}
