export class NotificationData {
  _id!: string;
  clientId!: {
    _id: string;
    name: string;
    email: string;
  };
  name!: string;
  reason!: string;
  phone!: string;
  status!: string;
  createdAt!: string;
  updatedAt!: string;
}

export interface NotificationApiResponse {
  success: boolean;
  data: NotificationData[];
  total: number;
  page: number;
  pageSize: number;
}
