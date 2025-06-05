import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  DashboardMetrics, 
  ClientMetrics, 
  FinancialMetrics, 
  OccupancyMetrics, 
  RoutineMetrics,
  ReportFilters,
  DateRange,
  ReportType
} from '../interfaces/reports.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly apiUrl = `${environment.api}/api/reports`;

  constructor(private http: HttpClient) {}

  getDashboardMetrics(organizationId: string, filters: ReportFilters): Observable<DashboardMetrics> {
    let params = new HttpParams()
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard/${organizationId}`, { params });
  }

  getClientMetrics(organizationId: string, filters: ReportFilters): Observable<ClientMetrics> {
    let params = new HttpParams()
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ClientMetrics>(`${this.apiUrl}/clients/${organizationId}`, { params });
  }

  getFinancialMetrics(organizationId: string, filters: ReportFilters): Observable<FinancialMetrics> {
    let params = new HttpParams()
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<FinancialMetrics>(`${this.apiUrl}/financial/${organizationId}`, { params });
  }

  getOccupancyMetrics(organizationId: string, filters: ReportFilters): Observable<OccupancyMetrics> {
    let params = new HttpParams()
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<OccupancyMetrics>(`${this.apiUrl}/occupancy/${organizationId}`, { params });
  }

  getRoutineMetrics(organizationId: string, filters: ReportFilters): Observable<RoutineMetrics> {
    let params = new HttpParams()
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<RoutineMetrics>(`${this.apiUrl}/routines/${organizationId}`, { params });
  }

  exportReport(organizationId: string, type: ReportType, filters: ReportFilters): Observable<any> {
    let params = new HttpParams()
      .set('type', type)
      .set('dateRange', filters.dateRange);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get(`${this.apiUrl}/export/${organizationId}`, { 
      params,
      responseType: 'blob'
    });
  }

  getDateRangeOptions() {
    return [
      { label: 'Últimos 7 días', value: DateRange.LAST_7_DAYS },
      { label: 'Últimos 30 días', value: DateRange.LAST_30_DAYS },
      { label: 'Últimos 3 meses', value: DateRange.LAST_3_MONTHS },
      { label: 'Últimos 6 meses', value: DateRange.LAST_6_MONTHS },
      { label: 'Último año', value: DateRange.LAST_YEAR },
      { label: 'Personalizado', value: DateRange.CUSTOM }
    ];
  }

  getReportTypeOptions() {
    return [
      { label: 'Clientes', value: ReportType.CLIENTS, icon: 'users' },
      { label: 'Financiero', value: ReportType.FINANCIAL, icon: 'currency-dollar' },
      { label: 'Ocupación', value: ReportType.OCCUPANCY, icon: 'calendar' },
      { label: 'Rutinas', value: ReportType.ROUTINES, icon: 'activity' },
      { label: 'Rendimiento', value: ReportType.PERFORMANCE, icon: 'chart-line' }
    ];
  }
} 