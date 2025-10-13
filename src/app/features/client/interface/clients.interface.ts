export class Client {
  _id!: string;
  name!: string;
  identifier?: string; // Email del cliente
  phone!: string;
  address!: string;
  dateBirthday!: string;
  medicalSociety!: string;
  sex!: string;
  cardiacHistory!: string | boolean;
  cardiacHistoryInput!: string;
  bloodPressure!: string;
  respiratoryHistory!: string | boolean;
  respiratoryHistoryInput!: string;
  surgicalHistory!: string | boolean;
  historyofPathologicalLesions!: string | boolean;
  CI!: number;
  planId!: string;
  routineId?: string;
  password?: string; // Password del usuario (solo se obtiene cuando se solicita específicamente)
}

export interface ClientInfo {
  _id: string;
  userInfo: {
    name: string;
    phone: string;
    address: string;
    dateBirthday: string;
    medicalSociety: string;
    sex: string;
    cardiacHistory: string;
    cardiacHistoryInput: string;
    bloodPressure: string;
    respiratoryHistory: string;
    respiratoryHistoryInput: string;
  };
  email: string;
  disabled: boolean;
  lastAccess?: string;
  totalAccesses?: number;
}

export interface clientApiResponseClientById {
  success: boolean;
  data: ClientInfo;
}

export interface ClientApiResponse {
  success: boolean;
  data: Client;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    _id: string;
    identifier: string;
    role: string;
  };
}

export interface UserPasswordResponse {
  success: boolean;
  data: {
    password: string;
  };
}

export class RegisterClient {
  _id!: string;
  identifier!: string;
  role!: string;
}
