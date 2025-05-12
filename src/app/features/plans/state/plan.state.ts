import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PlanStateModel } from '@features/plans/state/plan.model';
import { Injectable } from '@angular/core';
import {
  Plan,
  PlanApiResponse,
} from '@features/plans/interfaces/plan.interface';
import { HttpErrorResponse } from '@angular/common/http';

import {
  CreatePlan,
  DeletePlan,
  GetPlan,
  GetPlans,
  SetSelectedPlan,
  UpdateSelectedPlan,
  UpdatePlan,
  GetClientsByPlanId,
  AssignPlanToUser,
} from '@features/plans/state/plan.actions';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { PlansService } from '@features/plans/services/plan.service';

@State<PlanStateModel>({
  name: 'plans',
  defaults: {
    plans: [],
    planClients: [],
    selectedPlan: null,
    total: 0,
    loading: false,
    error: null,
    currentPage: 0,
    pageSize: 0,
    pageCount: 0,
  },
})
@Injectable({
  providedIn: 'root',
})
export class PlansState {
  @Selector()
  static getPlans(state: PlanStateModel): Plan[] {
    return state.plans ?? [];
  }

  @Selector()
  static getPlanClients(state: PlanStateModel): any[] {
    return state.planClients ?? [];
  }

  @Selector()
  static getTotal(state: PlanStateModel): number {
    return state.total ?? 0;
  }

  @Selector()
  static getPlanById(state: PlanStateModel): (id: string) => Plan | null {
    return (id: string): Plan | null => {
      return state.plans?.find((plan: Plan) => plan._id === id) ?? null;
    };
  }

  @Selector()
  static isLoading(state: PlanStateModel): boolean {
    return state.loading ?? false;
  }

  @Selector()
  static getError(state: PlanStateModel): HttpErrorResponse | null {
    return state.error ?? null;
  }

  @Selector()
  static getSelectedPlan(state: PlanStateModel): Plan | null {
    return state.selectedPlan ?? null;
  }

  constructor(private plansService: PlansService) {}

  @Action(GetPlans, { cancelUncompleted: true })
  getPlans(
    ctx: StateContext<PlanStateModel>,
    action: GetPlans,
  ): Observable<PlanApiResponse[]> {
    ctx.patchState({ loading: true, error: null, plans: [] });
    const { page, pageSize, searchQ } = action.payload;

    let getPlansObservable: Observable<PlanApiResponse[]>;
    if (searchQ === null || searchQ === undefined) {
      getPlansObservable = this.plansService.getPlans(page, pageSize, '');
    } else {
      getPlansObservable = this.plansService.getPlans(page, pageSize, searchQ);
    }

    return getPlansObservable.pipe(
      tap((response: any) => {
        const plans = response.data.data.map((plan: any) => ({
          ...plan,
        }));
        const total = response.data.total;
        const pageCount = Math.ceil(total / pageSize);

        ctx.patchState({
          plans,
          total,
          loading: false,
          currentPage: page,
          pageSize,
          pageCount,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(GetPlan, { cancelUncompleted: true })
  getPlan(
    ctx: StateContext<PlanStateModel>,
    { id }: GetPlan,
  ): Observable<Plan> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.getPlan(id).pipe(
      tap((res: any) => {
        const { data } = res;

        ctx.patchState({
          selectedPlan: data,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(CreatePlan)
  createPlan(
    ctx: StateContext<PlanStateModel>,
    { plan }: CreatePlan,
  ): Observable<Plan> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.createPlan(plan).pipe(
      tap((createdPlan: Plan) => {
        const plans = ctx.getState().plans?.concat(createdPlan);
        ctx.patchState({
          plans,
          loading: false,
          selectedPlan: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(UpdatePlan, { cancelUncompleted: true })
  updatePlan(
    ctx: StateContext<PlanStateModel>,
    { id, plan }: UpdatePlan,
  ): Observable<Plan> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.updatePlan(id, plan).pipe(
      tap((updatedPlan: Plan) => {
        const plans = ctx
          .getState()
          .plans?.map((u: any) =>
            u._id === updatedPlan._id ? updatedPlan : u,
          );
        ctx.patchState({
          plans,
          loading: false,
          selectedPlan: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(SetSelectedPlan, { cancelUncompleted: true })
  setSelectedPlan(
    ctx: StateContext<PlanStateModel>,
    { plan }: SetSelectedPlan,
  ): void {
    ctx.patchState({ selectedPlan: plan });
  }

  @Action(DeletePlan, { cancelUncompleted: true })
  deletePlan(
    ctx: StateContext<PlanStateModel>,
    { id }: DeletePlan,
  ): Observable<void> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.deletePlan(id).pipe(
      tap(() => {
        const plans = ctx
          .getState()
          .plans?.filter((plan: Plan) => plan._id !== id);

        ctx.patchState({ plans, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(GetClientsByPlanId, { cancelUncompleted: true })
  getClientsByPlanId(
    ctx: StateContext<PlanStateModel>,
    { planId }: GetClientsByPlanId,
  ): Observable<any> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.getClientsByPlanId(planId).pipe(
      tap((response: any) => {
        ctx.patchState({ loading: false, planClients: response.data });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(AssignPlanToUser, { cancelUncompleted: true })
  assignPlanToUser(
    ctx: StateContext<PlanStateModel>,
    { planId, userId }: AssignPlanToUser,
  ): Observable<any> {
    ctx.patchState({ loading: true, error: null });
    return this.plansService.assignPlanToUser(planId, userId).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(UpdateSelectedPlan, { cancelUncompleted: true })
  updateSelectedPlan(
    ctx: StateContext<PlanStateModel>,
    { plan }: UpdateSelectedPlan,
  ): void {
    ctx.patchState({ selectedPlan: plan });
  }
}
