import { Client } from "../interface/clients.interface";
import { FiltersClient, PageClient } from "../interface/filters.clients.interface";

export class ClientsStateModel {
  loading?: boolean;
  clients?: Client[];
  registerClient?: any;
  page?: PageClient | null;
  filters?: FiltersClient | null;
  totalClients?: number;
  selectedClient?: any;
  selectedClientRoutine?: any;
  selectedClientPlan?: any;
  total?: number;
  activeClientsCount?: number;
  error?: any;
  currentPage?: number;
  pageSize?: number;
  pageCount?: number;
}
