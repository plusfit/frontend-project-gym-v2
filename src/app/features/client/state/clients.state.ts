import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseRegisterResponse } from '@features/auth/interfaces/auth';
import { AuthService } from '@features/auth/services/auth.service';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, exhaustMap, Observable, tap, throwError } from 'rxjs';
import {
  Client,
  ClientApiResponse,
  RegisterResponse,
} from '../interface/clients.interface';
import { ClientService } from '../services/client.service';
import {
  CreateClient,
  DeleteClient,
  GetClientById,
  GetClients,
  RegisterClient,
  UpdateClient,
} from './clients.actions';
import { ClientsStateModel } from './clients.model';

@State<ClientsStateModel>({
  name: 'clients',
  defaults: {
    clients: [],
    selectedClient: undefined,
    registerClient: null || undefined,
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
  static isLoading(state: ClientsStateModel) {
    return state.loading ?? false;
  }

  @Selector()
  static getRegisterClient(state: ClientsStateModel) {
    return state.registerClient ?? {};
  }

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
  ) {}

  @Action(GetClients, { cancelUncompleted: true })
  getClients(
    ctx: StateContext<ClientsStateModel>,
    action: GetClients,
  ): Observable<ClientApiResponse> {
    ctx.patchState({ loading: true, error: null });
    const { page, pageSize, searchQ } = action.payload;

    let getClientsObservable: Observable<ClientApiResponse[]>;
    if (searchQ === null || searchQ === undefined) {
      getClientsObservable = this.clientService.getClientsByName(
        page,
        pageSize,
        '',
        '',
      );
    } else {
      getClientsObservable = this.clientService.getClientsByName(
        page,
        pageSize,
        searchQ,
        searchQ,
      );
    }

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
        return throwError(error);
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
          identifier: response.data.userInfo.identifier,
          password: response.data.userInfo.password,
          phone: response.data.userInfo.phone,
          address: response.data.userInfo.address,
          dateBirthday: response.data.userInfo.dateBirthday,
          medicalSociety: response.data.userInfo.medicalSociety,
          sex: response.data.userInfo.sex,
          cardiacHistory: response.data.userInfo.cardiacHistory,
          cardiacHistoryInput: response.data.userInfo.cardiacHistoryInput,
          bloodPressure: response.data.userInfo.bloodPressure,
          frequencyOfPhysicalExercise:
            response.data.userInfo.frequencyOfPhysicalExercise,
          respiratoryHistory: response.data.userInfo.respiratoryHistory,
          respiratoryHistoryInput:
            response.data.userInfo.respiratoryHistoryInput,
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
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({ loading: false });
        //TODO: convertir los mensajes
        // this.snackbar.showError('Registro Erroneo', err.message);
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
          frequencyOfPhysicalExercise:
            response.data.frequencyOfPhysicalExercise,
          respiratoryHistory: response.data.respiratoryHistory,
          respiratoryHistoryInput: response.data.respiratoryHistoryInput,
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
          frequencyOfPhysicalExercise:
            response.data.frequencyOfPhysicalExercise,
          respiratoryHistory: response.data.respiratoryHistory,
          respiratoryHistoryInput: response.data.respiratoryHistoryInput,
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
  ): Observable<ClientApiResponse> {
    ctx.patchState({ loading: true, error: null });
    return this.clientService.deleteClient(id).pipe(
      tap(() => {
        const clients = ctx
          .getState()
          .clients?.filter((client) => client._id !== id);
        ctx.patchState({ clients, loading: false });
      }),
      catchError((error) => {
        ctx.patchState({ error, loading: false });
        return throwError(error);
      }),
    );
  }
}
