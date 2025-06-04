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
  GetOrganizationPlans,
  GetOrganizationClients,
  GetOrganizationRoutines,
} from './organizations.actions';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { Client } from '@features/client/interface/clients.interface';
import { Routine } from '@features/routines/interfaces/routine.interface';

export interface OrganizationsStateModel {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  organizationPlans: Plan[];
  organizationClients: Client[];
  organizationRoutines: Routine[];
  loading: boolean;
  error: string | null;
}

@State<OrganizationsStateModel>({
  name: 'organizations',
  defaults: {
    organizations: [],
    selectedOrganization: null,
    organizationPlans: [],
    organizationClients: [],
    organizationRoutines: [],
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

  @Selector()
  static getOrganizationPlans(state: OrganizationsStateModel): Plan[] {
    return state.organizationPlans;
  }

  @Selector()
  static getOrganizationClients(state: OrganizationsStateModel): Client[] {
    return state.organizationClients;
  }

  @Selector()
  static getOrganizationRoutines(state: OrganizationsStateModel): Routine[] {
    return state.organizationRoutines;
  }

  @Action(GetOrganizations)
  getOrganizations(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizations,
  ) {
    console.log('🔍 DEBUG - GetOrganizations action started');
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.getAll(action.includeInactive).pipe(
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
    console.log(
      '🔍 DEBUG - GetOrganizationById action started with ID:',
      action.id,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.getById(action.id).pipe(
      tap((response) => {
        console.log(
          '🔍 DEBUG - GetOrganizationById response received:',
          response,
        );
        console.log('🔍 DEBUG - Response type:', typeof response);

        // Handle response that might be wrapped in a data property
        const organization = (response as any)?.data || response;
        console.log('🔍 DEBUG - Extracted organization:', organization);

        ctx.patchState({
          selectedOrganization: organization,
          loading: false,
        });
        console.log('🔍 DEBUG - Organization set in state successfully');
      }),
      catchError((error) => {
        console.error('🔍 DEBUG - GetOrganizationById error:', error);
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
        const organization = (response as any)?.data?.organization || response.organization || response;
        console.log('🔍 DEBUG - Extracted organization:', organization);
        console.log('🔍 DEBUG - Admin user created:', (response as any)?.data?.admin || response.admin);

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
    console.log(
      '🔍 DEBUG - SetSelectedOrganization action started with organizationId:',
      action.organizationId,
    );

    const state = ctx.getState();
    const selectedOrganization = action.organizationId
      ? state.organizations.find((org) => org._id === action.organizationId) ||
        null
      : null;

    // If clearing the selection, also clear related data
    if (!action.organizationId) {
      console.log('🔍 DEBUG - Clearing selected organization and related data');
      ctx.patchState({
        selectedOrganization: null,
        organizationPlans: [],
        organizationClients: [],
        organizationRoutines: [],
      });
    } else {
      console.log(
        '🔍 DEBUG - Setting selected organization:',
        selectedOrganization,
      );
      ctx.patchState({ selectedOrganization });
    }
  }

  @Action(GetOrganizationPlans)
  getOrganizationPlans(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizationPlans,
  ) {
    console.log(
      '🔍 DEBUG - GetOrganizationPlans action started with organizationId:',
      action.organizationId,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationPlans(action.organizationId)
      .pipe(
        tap((response) => {
          console.log(
            '🔍 DEBUG - GetOrganizationPlans response received:',
            response,
          );
          console.log('🔍 DEBUG - Response type:', typeof response);

          // Handle response that might be wrapped in a data property
          const plans = Array.isArray(response)
            ? response
            : (response as any)?.data || [];
          console.log('🔍 DEBUG - Extracted plans:', plans);

          ctx.patchState({
            organizationPlans: plans,
            loading: false,
          });
          console.log('🔍 DEBUG - Plans set in state successfully');
        }),
        catchError((error) => {
          console.error('🔍 DEBUG - GetOrganizationPlans error:', error);
          ctx.patchState({
            loading: false,
            error: error.message || 'Error loading organization plans',
          });
          return of(error);
        }),
      );
  }

  @Action(GetOrganizationClients)
  getOrganizationClients(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizationClients,
  ) {
    console.log(
      '🔍 DEBUG - GetOrganizationClients action started with organizationId:',
      action.organizationId,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationClients(action.organizationId)
      .pipe(
        tap((response) => {
          console.log(
            '🔍 DEBUG - GetOrganizationClients response received:',
            response,
          );
          console.log('🔍 DEBUG - Response type:', typeof response);

          // Handle response that might be wrapped in a data property
          const clients = Array.isArray(response)
            ? response
            : (response as any)?.data || [];
          console.log('🔍 DEBUG - Extracted clients:', clients);

          ctx.patchState({
            organizationClients: clients,
            loading: false,
          });
          console.log('🔍 DEBUG - Clients set in state successfully');
        }),
        catchError((error) => {
          console.error('🔍 DEBUG - GetOrganizationClients error:', error);
          ctx.patchState({
            loading: false,
            error: error.message || 'Error loading organization clients',
          });
          return of(error);
        }),
      );
  }

  @Action(GetOrganizationRoutines)
  getOrganizationRoutines(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizationRoutines,
  ) {
    console.log(
      '🔍 DEBUG - GetOrganizationRoutines action started with organizationId:',
      action.organizationId,
    );
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationRoutines(action.organizationId)
      .pipe(
        tap((response) => {
          console.log(
            '🔍 DEBUG - GetOrganizationRoutines response received:',
            response,
          );
          console.log('🔍 DEBUG - Response type:', typeof response);

          // Handle response that might be wrapped in a data property
          const routines = Array.isArray(response)
            ? response
            : (response as any)?.data || [];
          console.log('🔍 DEBUG - Extracted routines:', routines);

          ctx.patchState({
            organizationRoutines: routines,
            loading: false,
          });
          console.log('🔍 DEBUG - Routines set in state successfully');
        }),
        catchError((error) => {
          console.error('🔍 DEBUG - GetOrganizationRoutines error:', error);
          ctx.patchState({
            loading: false,
            error: error.message || 'Error loading organization routines',
          });
          return of(error);
        }),
      );
  }
}
