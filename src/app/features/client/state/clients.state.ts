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
import { DeleteClient, GetClients, RegisterClient } from './clients.actions';
import { ClientsStateModel } from './clients.model';

@State<ClientsStateModel>({
  name: 'clients',
  defaults: {
    clients: [],
    selectedClient: null,
    idRegisterClient: null || '',
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
            ctx.patchState({ idRegisterClient: res.data._id });
            console.log('auth', res);
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
