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
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.getAll(action.includeInactive).pipe(
      tap((response) => {
        const organizations = Array.isArray(response)
          ? response
          : (response as any)?.data || [];

        ctx.patchState({
          organizations,
          loading: false,
        });
      }),
      catchError((error) => {
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
      tap((response) => {
        const organization = (response as any)?.data || response;

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
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService.create(action.organization).pipe(
      tap((response) => {
        const organization = (response as any)?.data?.organization || response.organization || response;

        const state = ctx.getState();
        ctx.patchState({
          organizations: [...state.organizations, organization],
          loading: false,
        });

        // Log información de Firebase para depuración
        if ((response as any).firebaseUser) {
          console.log('Usuario administrador creado en Firebase:', (response as any).firebaseUser);
        }
      }),
      catchError((error) => {
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
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .update(action.id, action.organization)
      .pipe(
        tap((response) => {
          const updatedOrganization = (response as any)?.data || response;

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
        }),
        catchError((error) => {
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

    if (!action.organizationId) {
      ctx.patchState({
        selectedOrganization: null,
        organizationPlans: [],
        organizationClients: [],
        organizationRoutines: [],
      });
    } else {
      ctx.patchState({ selectedOrganization });
    }
  }

  @Action(GetOrganizationPlans)
  getOrganizationPlans(
    ctx: StateContext<OrganizationsStateModel>,
    action: GetOrganizationPlans,
  ) {
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationPlans(action.organizationId)
      .pipe(
        tap((response) => {
          const plans = Array.isArray(response)
            ? response
            : (response as any)?.data || [];

          ctx.patchState({
            organizationPlans: plans,
            loading: false,
          });
        }),
        catchError((error) => {
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
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationClients(action.organizationId)
      .pipe(
        tap((response) => {
          const clients = Array.isArray(response)
            ? response
            : (response as any)?.data || [];

          ctx.patchState({
            organizationClients: clients,
            loading: false,
          });
        }),
        catchError((error) => {
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
    ctx.patchState({ loading: true, error: null });

    return this.organizationsService
      .getOrganizationRoutines(action.organizationId)
      .pipe(
        tap((response) => {
          const routines = Array.isArray(response)
            ? response
            : (response as any)?.data || [];

          ctx.patchState({
            organizationRoutines: routines,
            loading: false,
          });
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message || 'Error loading organization routines',
          });
          return of(error);
        }),
      );
  }
}
