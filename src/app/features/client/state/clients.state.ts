import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ClientsStateModel } from './clients.model';
import { Injectable } from '@angular/core';
import { DeleteClient, GetClients } from './clients.actions';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Client, ClientApiResponse } from '../interface/clients.interface';
import { ClientService } from '../services/client.service';

@State<ClientsStateModel>({
  name: 'clients',
  defaults: {
    clients: [],
    selectedClient: null,
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

  constructor(private clientService: ClientService) {}

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
