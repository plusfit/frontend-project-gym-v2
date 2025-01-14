import { Client } from '../interface/clients.interface';
import {
  FiltersClient,
  PageClient,
} from '../interface/filters.clients.interface';

export class ClientsStateModel {
  loading?: boolean;
  clients?: Client[] = [];
  idRegisterClient?: string;
  page?: PageClient | null;
  filters?: FiltersClient | null;
  totalClients?: number;
  selectedClient?: Client | null;
  total?: number;
  error?: any;
  currentPage?: number;
  pageSize?: number;
  pageCount?: number;
}
