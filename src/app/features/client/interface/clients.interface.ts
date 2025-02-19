export class Client {
  _id!: string;
  name!: string;
  phone!: string;
  address!: string;
  dateBirthday!: string;
  medicalSociety!: string;
  sex!: string;
  cardiacHistory!: string;
  cardiacHistoryInput!: string;
  bloodPressure!: string;
  frequencyOfPhysicalExercise!: string;
  respiratoryHistory!: string;
  respiratoryHistoryInput!: string;
  CI!: number;
  planId!: string;
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
    frequencyOfPhysicalExercise: string;
    respiratoryHistory: string;
    respiratoryHistoryInput: string;
  };
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

export class RegisterClient {
  _id!: string;
  identifier!: string;
  role!: string;
}
