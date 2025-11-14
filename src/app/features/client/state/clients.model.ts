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
  userPassword?: string | null; // Password del usuario actual
  passwordLoading?: boolean; // Estado de carga para obtener la contraseña
  passwordError?: any; // Error al obtener la contraseña
  forgotPasswordLoading?: boolean; // Estado de carga para forgot password
  forgotPasswordSuccess?: boolean; // Éxito del forgot password
  forgotPasswordError?: any; // Error del forgot password
  ciValidation?: { exists: boolean; ci: string } | null; // Resultado de validación de CI
  total?: number;
  activeClientsCount?: number;
  error?: any;
  currentPage?: number;
  pageSize?: number;
  pageCount?: number;
}
