export interface FiltersClient {
  name?: string;
  email?: string;
}

export interface PageClient {
  page: number;
  pageSize: number;
  searchQ?: string;
  withoutPlan?: boolean;
  role?: string;
}
