import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Organization } from '../interfaces/organization.interface';
import { OrganizationsService } from '../services/organizations.service';
import {
  GetOrganizations,
  GetOrganizationById,
  CreateOrganization,
  UpdateOrganization,
  DeleteOrganization,
  SetSelectedOrganization,
} from './organizations.actions';

export interface OrganizationsStateModel {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

@State<OrganizationsStateModel>({
  name: 'organizations',
  defaults: {
    organizations: [],
    selectedOrganization: null,
    loading: false,
    error: null,
  },
})
@Injectable()
export class OrganizationsState {
  constructor(private organizationsService: OrganizationsService) {}

  @Selector()
  static getOrganizations(state: OrganizationsStateModel): Organization[] {
    return state.organizations;
  }

  @Selector()
  static getSelectedOrganization(
    state: OrganizationsStateModel,
  ): Organization | null {
    return state.selectedOrganization;
  }

  @Selector()
  static getLoading(state: OrganizationsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: OrganizationsStateModel): string | null {
    return state.error;
  }

  @Action(GetOrganizations)
  getOrganizations(ctx: StateContext<OrganizationsStateModel>) {
    console.log('🔍 DEBUG - GetOrganizations action started');
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.getAll().pipe(
      tap((response) => {
        console.log('🔍 DEBUG - GetOrganizations response received:', response);
        console.log('🔍 DEBUG - Response type:', typeof response);
        console.log('🔍 DEBUG - Is array:', Array.isArray(response));

        // Check if response is wrapped in a data property
        const organizations = Array.isArray(response)
          ? response
          : (response as any)?.data || [];
        console.log('🔍 DEBUG - Extracted organizations:', organizations);

        ctx.patchState({
          organizations,
          loading: false,
        });
        console.log('🔍 DEBUG - State updated, loading set to false');
      }),
      catchError((error) => {
        console.error('🔍 DEBUG - GetOrganizations error:', error);
        ctx.patchState({
          loading: false,
          error: error.message || 'Error loading organizations',
        });
        return of(error);
      }),
    );
  }

  @Action(GetOrganizationById)
  getOrganizationById(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizationById,
  ) {
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.getById(action.id).pipe(
      tap((organization) => {
        ctx.patchState({
          selectedOrganization: organization,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error loading organization',
        });
        return of(error);
      }),
    );
  }

  @Action(CreateOrganization)
  createOrganization(
    ctx: StateContext<OrganizationsStateModel>,
    action: CreateOrganization,
  ) {
    console.log(
      '🔍 DEBUG - CreateOrganization action started with data:',
      action.organization,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.create(action.organization).pipe(
      tap((response) => {
        console.log(
          '🔍 DEBUG - CreateOrganization response received:',
          response,
        );

        // Handle response that might be wrapped in a data property
        const organization = (response as any)?.data || response;
        console.log('🔍 DEBUG - Extracted organization:', organization);

        const state = ctx.getState();
        ctx.patchState({
          organizations: [...state.organizations, organization],
          loading: false,
        });
        console.log('🔍 DEBUG - Organization added to state successfully');
      }),
      catchError((error) => {
        console.error('🔍 DEBUG - CreateOrganization error:', error);
        ctx.patchState({
          loading: false,
          error: error.message || 'Error creating organization',
        });
        return of(error);
      }),
    );
  }

  @Action(UpdateOrganization)
  updateOrganization(
    ctx: StateContext<OrganizationsStateModel>,
    action: UpdateOrganization,
  ) {
    console.log(
      '🔍 DEBUG - UpdateOrganization action started with data:',
      action.organization,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .update(action.id, action.organization)
      .pipe(
        tap((response) => {
          console.log(
            '🔍 DEBUG - UpdateOrganization response received:',
            response,
          );

          // Handle response that might be wrapped in a data property
          const updatedOrganization = (response as any)?.data || response;
          console.log(
            '🔍 DEBUG - Extracted updated organization:',
            updatedOrganization,
          );

          const state = ctx.getState();
          const organizations = state.organizations.map((org) =>
            org._id === action.id ? updatedOrganization : org,
          );

          ctx.patchState({
            organizations,
            selectedOrganization:
              state.selectedOrganization?._id === action.id
                ? updatedOrganization
                : state.selectedOrganization,
            loading: false,
          });
          console.log('🔍 DEBUG - Organization updated in state successfully');
        }),
        catchError((error) => {
          console.error('🔍 DEBUG - UpdateOrganization error:', error);
          ctx.patchState({
            loading: false,
            error: error.message || 'Error updating organization',
          });
          return of(error);
        }),
      );
  }

  @Action(DeleteOrganization)
  deleteOrganization(
    ctx: StateContext<OrganizationsStateModel>,
    action: DeleteOrganization,
  ) {
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.delete(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        const organizations = state.organizations.filter(
          (org) => org._id !== action.id,
        );

        ctx.patchState({
          organizations,
          selectedOrganization:
            state.selectedOrganization?._id === action.id
              ? null
              : state.selectedOrganization,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error deleting organization',
        });
        return of(error);
      }),
    );
  }

  @Action(SetSelectedOrganization)
  setSelectedOrganization(
    ctx: StateContext<OrganizationsStateModel>,
    action: SetSelectedOrganization,
  ) {
    const state = ctx.getState();
    const selectedOrganization = action.organizationId
      ? state.organizations.find((org) => org._id === action.organizationId) ||
        null
      : null;

    ctx.patchState({ selectedOrganization });
  }
}
