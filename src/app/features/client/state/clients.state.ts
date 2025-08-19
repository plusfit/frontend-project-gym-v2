import { Injectable } from "@angular/core";
import { SnackBarService } from "@core/services/snackbar.service";
import { FirebaseRegisterResponse } from "@features/auth/interfaces/auth";
import { AuthService } from "@features/auth/services/auth.service";
import { ExerciseService } from "@features/exercises/services/exercise.service";
import { PlansService } from "@features/plans/services/plan.service";
import { RoutineService } from "@features/routines/services/routine.service";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import {
  catchError,
  exhaustMap,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { Client, ClientApiResponse, RegisterResponse } from "../interface/clients.interface";
import { ClientService } from "../services/client.service";
import {
  CreateClient,
  DeleteClient,
  GetActiveClientsCount,
  GetClientById,
  GetClients,
  PlanClient,
  RegisterClient,
  RoutineClient,
  ToggleDisabledClient,
  UpdateClient,
} from "./clients.actions";
import { ClientsStateModel } from "./clients.model";

@State<ClientsStateModel>({
  name: "clients",
  defaults: {
    clients: [],
    selectedClient: undefined,
    selectedClientRoutine: undefined,
    selectedClientPlan: undefined,
    registerClient: null,
    total: 0,
    activeClientsCount: 0,
    loading: false,
    error: null,
    currentPage: 0,
    pageSize: 0,
    pageCount: 0,
  },
})
@Injectable({
  providedIn: "root",
})
export class ClientsState {
  @Selector()
  static getClients(state: ClientsStateModel): Client[] {
    return state.clients ?? [];
  }

  @Selector()
  static getTotal(state: ClientsStateModel) {
    return state.total ?? 0;
  }

  @Selector()
  static getActiveClientsCount(state: ClientsStateModel) {
    return state.activeClientsCount ?? 0;
  }

  @Selector()
  static isLoading(state: ClientsStateModel) {
    return state.loading ?? false;
  }

  @Selector()
  static getRegisterClient(state: ClientsStateModel) {
    return state.registerClient ?? {};
  }

  @Selector()
  static getSelectedRoutine(state: ClientsStateModel) {
    return state.selectedClientRoutine ?? {};
  }

  @Selector()
  static getSelectedClient(state: ClientsStateModel) {
    return state.selectedClient ?? {};
  }

  @Selector()
  static getSelectedClientPlan(state: ClientsStateModel) {
    return state.selectedClientPlan ?? {};
  }

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private routineService: RoutineService,
    private exerciseService: ExerciseService,
    private planService: PlansService,
    private snackBarService: SnackBarService,
  ) {}

  @Action(GetClients, { cancelUncompleted: true })
  getClients(
    ctx: StateContext<ClientsStateModel>,
    { payload }: GetClients,
  ): Observable<ClientApiResponse> {
    ctx.patchState({ loading: true, clients: [], error: null });

    const { page, pageSize, searchQ, withoutPlan, disabled } = payload;

    const nameFilter = searchQ ?? "";
    const emailFilter = searchQ ?? "";
    const role = "User";
    const CIFilter = searchQ ?? "";
    const withoutPlanFilter = withoutPlan ?? false;
    const disabledFilter = disabled ?? false;

    const getClientsObservable = this.clientService.getClientsByName(
      page,
      pageSize,
      nameFilter,
      emailFilter,
      role,
      CIFilter,
      withoutPlanFilter,
      disabledFilter,
    );

    return getClientsObservable.pipe(
      tap((response: any) => {
        const clients = response.data.data.map((client: any) => ({
          ...client,
        }));

        const total = response.data.total;
        const pageCount = Math.ceil(total / pageSize);

        ctx.patchState({
          clients,
          total,
          currentPage: page,
          pageSize,
          pageCount,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(GetActiveClientsCount, { cancelUncompleted: true })
  getActiveClientsCount(
    ctx: StateContext<ClientsStateModel>,
  ): Observable<{ success: boolean; data: number }> {
    ctx.patchState({ loading: true, error: null });

    return this.clientService.getActiveClientsCount().pipe(
      tap((response: { success: boolean; data: number }) => {
        ctx.patchState({
          activeClientsCount: response.data,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(GetClientById, { cancelUncompleted: true })
  getClientById(
    ctx: StateContext<ClientsStateModel>,
    action: GetClientById,
  ): Observable<ClientApiResponse> {
    ctx.patchState({ loading: true, error: null });
    return this.clientService.getClientById(action.id).pipe(
      tap((response: any) => {
        const selectedClient = {
          _id: response.data._id,
          name: response.data.userInfo.name,
          identifier: response.data.email,
          password: response.data.userInfo.password,
          phone: response.data.userInfo.phone,
          address: response.data.userInfo.address,
          dateBirthday: response.data.userInfo.dateBirthday,
          surgicalHistory: response.data.userInfo.surgicalHistory,
          historyofPathologicalLesions: response.data.userInfo.historyofPathologicalLesions,
          medicalSociety: response.data.userInfo.medicalSociety,
          sex: response.data.userInfo.sex,
          cardiacHistory: response.data.userInfo.cardiacHistory,
          cardiacHistoryInput: response.data.userInfo.cardiacHistoryInput,
          bloodPressure: response.data.userInfo.bloodPressure,
          respiratoryHistory: response.data.userInfo.respiratoryHistory,
          respiratoryHistoryInput: response.data.userInfo.respiratoryHistoryInput,
          CI: response.data.userInfo.CI,
          planId: response.data.planId,
          routineId: response.data.routineId,
        };
        ctx.patchState({ selectedClient: selectedClient, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(RegisterClient, { cancelUncompleted: true })
  register(
    ctx: StateContext<ClientsStateModel>,
    action: RegisterClient,
  ): Observable<RegisterResponse> {
    ctx.patchState({ loading: true });
    const { identifier, password } = action.payload;
    return this.authService.registerFirebase(identifier, password).pipe(
      exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
        return this.authService.register(firebaseResponse.user.email).pipe(
          tap((res: RegisterResponse) => {
            ctx.patchState({
              registerClient: {
                _id: res.data._id,
                identifier: res.data.identifier,
                role: res.data.role,
              },
            });
          }),
        );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: any) => {
        ctx.patchState({ loading: false });
        this.snackBarService.showError("Error al crear Cliente", this.getFriendlyErrorMessage(err));
        return throwError(() => err);
      }),
    );
  }

  @Action(CreateClient, { cancelUncompleted: true })
  createClient(
    ctx: StateContext<ClientsStateModel>,
    { payload }: CreateClient,
  ): Observable<ClientApiResponse> {
    ctx.patchState({ loading: true, error: null });
    return this.clientService.createClient(payload).pipe(
      tap((response: ClientApiResponse) => {
        const clients = ctx.getState().clients || [];
        const mappedClient: Client = {
          _id: response.data._id,
          name: response.data.name,
          phone: response.data.phone,
          address: response.data.address,
          dateBirthday: response.data.dateBirthday,
          medicalSociety: response.data.medicalSociety,
          sex: response.data.sex,
          cardiacHistory: response.data.cardiacHistory,
          cardiacHistoryInput: response.data.cardiacHistoryInput,
          bloodPressure: response.data.bloodPressure,
          respiratoryHistory: response.data.respiratoryHistory,
          respiratoryHistoryInput: response.data.respiratoryHistoryInput,
          CI: response.data.CI,
          planId: response.data.planId,
          surgicalHistory: response.data.surgicalHistory,
          historyofPathologicalLesions: response.data.historyofPathologicalLesions,
        };
        ctx.patchState({
          clients: [...clients, mappedClient],
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(UpdateClient, { cancelUncompleted: true })
  updateClient(
    ctx: StateContext<ClientsStateModel>,
    action: UpdateClient,
  ): Observable<ClientApiResponse> {
    const { id, payload } = action;
    ctx.patchState({ loading: true, error: null });
    return this.clientService.updateClient(id, payload).pipe(
      tap((response: ClientApiResponse) => {
        const clients = ctx.getState().clients || [];
        const mappedClient: Client = {
          _id: response.data._id,
          name: response.data.name,
          phone: response.data.phone,
          address: response.data.address,
          dateBirthday: response.data.dateBirthday,
          medicalSociety: response.data.medicalSociety,
          sex: response.data.sex,
          cardiacHistory: response.data.cardiacHistory,
          cardiacHistoryInput: response.data.cardiacHistoryInput,
          bloodPressure: response.data.bloodPressure,
          respiratoryHistory: response.data.respiratoryHistory,
          respiratoryHistoryInput: response.data.respiratoryHistoryInput,
          CI: response.data.CI,
          planId: response.data.planId,
          surgicalHistory: response.data.surgicalHistory,
          historyofPathologicalLesions: response.data.historyofPathologicalLesions,
        };
        const updatedClients = clients.map((client) =>
          client._id === payload._id ? mappedClient : client,
        );
        ctx.patchState({ clients: updatedClients, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(error);
      }),
    );
  }

  @Action(DeleteClient, { cancelUncompleted: true })
  deleteClient(
    ctx: StateContext<ClientsStateModel>,
    { id }: DeleteClient,
  ): Observable<ClientApiResponse[]> {
    ctx.patchState({ loading: true, error: null });

    return forkJoin([this.clientService.deleteClient(id)]).pipe(
      tap(() => {
        const clients = ctx.getState().clients?.filter((client) => client._id !== id);
        ctx.patchState({ clients, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(RoutineClient, { cancelUncompleted: true })
  routineClient(ctx: StateContext<ClientsStateModel>): Observable<any> {
    ctx.patchState({ loading: true, error: null });
    const state = ctx.getState();
    const routineId = state.selectedClient?.routineId;

    if (routineId) {
      return this.routineService.getRoutineById(routineId).pipe(
        switchMap((response: any) => {
          const subroutines = response.data.subRoutines;

          if (!subroutines || subroutines.length === 0) {
            return of(response); // Si no hay subrutinas, devolvemos la respuesta tal cual.
          }

          // Creamos un array de observables para obtener los ejercicios
          const subroutineRequests = subroutines.map((subroutine: any) => {
            return forkJoin(
              subroutine.exercises.map((exercise: any) =>
                this.exerciseService
                  .getExerciseById(exercise._id)
                  .pipe(map((exercise) => exercise.data)),
              ),
            ).pipe(
              map((exercises) => ({
                ...subroutine,
                exercises, // Ahora exercises es un array con la información de cada ejercicio
              })),
            );
          });

          return forkJoin(subroutineRequests).pipe(
            map((updatedSubroutines) => ({
              ...response,
              data: {
                ...response.data,
                subRoutines: updatedSubroutines, // Actualizamos con la información completa
              },
            })),
          );
        }),
        tap((updatedResponse) => {
          ctx.patchState({
            selectedClientRoutine: updatedResponse.data,
            loading: false,
          });
        }),
        catchError((error) => {
          console.error("Error obteniendo la rutina:", error);
          ctx.patchState({ error, loading: false });
          return throwError(() => error);
        }),
      );
    }

    return of(null); // Retornar un observable vacío si no hay `routineId`
  }

  @Action(ToggleDisabledClient, { cancelUncompleted: true })
  toggleDisabledClient(
    ctx: StateContext<ClientsStateModel>,
    { id, disabled }: ToggleDisabledClient,
  ): Observable<any> {
    ctx.patchState({ loading: true, error: null });

    return this.clientService.toggleDisabledClient(id, disabled).pipe(
      tap(() => {
        const clients = ctx.getState().clients?.filter((client) => client._id !== id);
        ctx.patchState({ clients, loading: false });
        this.snackBarService.showSuccess("Éxito", "Cliente desactivado correctamente");
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(() => error);
      }),
    );
  }

  @Action(PlanClient, { cancelUncompleted: true })
  planClient(ctx: StateContext<ClientsStateModel>): Observable<any> {
    ctx.patchState({ loading: true, error: null });
    const state = ctx.getState();
    const planId = state.selectedClient?.planId;

    if (planId) {
      return this.planService.getPlan(planId).pipe(
        tap((response: any) => {
          ctx.patchState({
            selectedClientPlan: response.data,
            loading: false,
          });
        }),
        catchError((error) => {
          console.error("Error obteniendo el plan:", error);
          ctx.patchState({ error, loading: false });
          return throwError(() => error);
        }),
      );
    }

    return of(null); // Retornar un observable vacío si no hay `planId`
  }

  private mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "El email ya existe";
      case "auth/operation-not-allowed":
        return "La operación no está permitida";
      case "auth/too-many-requests":
        return "Demasiados intentos. Inténtalo más tarde";
      case "auth/invalid-password":
        return "Contraseña inválida";
      case "auth/user-disabled":
        return "El usuario está deshabilitado";
      default:
        return "Ha ocurrido un error. Por favor, inténtalo de nuevo";
    }
  }

  private getFriendlyErrorMessage(err: any): string {
    if (err.code) {
      return this.mapFirebaseError(err.code);
    }
    return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo";
  }
}
