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
}

export interface ClientApiResponse {
  success: boolean;
  data: ClientData;
}

interface ClientData {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}
