import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../interfaces/organization.interface';

export class GetOrganizations {
  static readonly type = '[Organizations] Get Organizations';
  constructor(public includeInactive = true) {}
}

export class GetOrganizationById {
  static readonly type = '[Organizations] Get Organization By Id';
  constructor(public id: string) {}
}

export class CreateOrganization {
  static readonly type = '[Organizations] Create Organization';
  constructor(public organization: CreateOrganizationDto) {}
}

export class UpdateOrganization {
  static readonly type = '[Organizations] Update Organization';
  constructor(
    public id: string,
    public organization: UpdateOrganizationDto,
  ) {}
}

export class DeleteOrganization {
  static readonly type = '[Organizations] Delete Organization';
  constructor(public id: string) {}
}

export class SetSelectedOrganization {
  static readonly type = '[Organizations] Set Selected Organization';
  constructor(public organizationId: string | null) {}
}
