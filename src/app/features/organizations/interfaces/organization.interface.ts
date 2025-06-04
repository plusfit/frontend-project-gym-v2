import { Permission } from '@core/enums/permissions.enum';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDto {
  email: string;
  name: string;
  phone?: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
  permissions?: Permission[];
  adminUser: AdminUserDto;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  permissions?: Permission[];
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
}
