export interface FiltersNotification {
    name?: string;
    status?: string;
    reason?: string;
}

export interface PageNotification {
    page: number;
    pageSize: number;
    searchQ?: string;
    status?: string;
}
