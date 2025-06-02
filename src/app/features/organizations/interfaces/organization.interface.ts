export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface OrganizationResponse {
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
}
