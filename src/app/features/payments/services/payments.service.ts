import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  PaymentItem,
  PaymentsResponse,
  PaymentsFilters,
  PaymentsStats,
  PaymentsSummary,
  PaymentsSummaryResponse
} from '../interfaces/payments.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly baseUrl = `${environment.api}/payments`;

  constructor(private http: HttpClient) { }

  /**
   * Get payments with filters
   */
  getPayments(filters: PaymentsFilters): Observable<PaymentsResponse> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('limit', filters.limit.toString());

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<PaymentsResponse>(this.baseUrl, { params })
      .pipe(
        tap(response => {
        })
      );
  }

  /**
   * Search payments by client name
   */
  searchPaymentsByName(searchTerm: string, filters: PaymentsFilters): Observable<PaymentsResponse> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('limit', filters.limit.toString());

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<PaymentsResponse>(`${this.baseUrl}/search-by-name/${searchTerm}`, { params })
      .pipe(
        tap(response => {
        })
      );
  }

  /**
   * Get payment statistics
   */
  getPaymentsStats(startDate?: string, endDate?: string): Observable<PaymentsStats> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    // Por ahora retornamos stats simuladas hasta que el endpoint esté disponible
    const mockStats: PaymentsStats = {
      totalPayments: this.calculateTotalPayments(),
      totalAmount: this.calculateTotalAmount(),
      averagePayment: this.calculateAveragePayment(),
      paymentsToday: 0,
      paymentsThisMonth: 0
    };

    return of(mockStats);
  }

  private calculateTotalPayments(): number {
    // Retornar un número simulado por ahora
    return 25;
  }

  private calculateTotalAmount(): number {
    // Retornar un monto simulado por ahora
    return 50000;
  }

  private calculateAveragePayment(): number {
    // Retornar un promedio simulado por ahora
    return 2000;
  }

  /**
   * Export payments data
   */
  exportPayments(filters: PaymentsFilters, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Update payment amount by ID
   */
  updatePayment(paymentId: string, amount: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${paymentId}`, { amount });
  }

  /**
   * Delete a payment by ID
   */
  deletePayment(paymentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${paymentId}`);
  }

  /**
   * Create a new payment
   */
  createPayment(amount: number, clientId: string, clientName: string): Observable<any> {
    const payload = {
      amount,
      clientId,
      clientName
    };
    return this.http.post(this.baseUrl, payload);
  }

  /**
   * Get payments summary for date range
   */
  getPaymentsSummary(startDate?: string, endDate?: string): Observable<PaymentsSummary> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<PaymentsSummaryResponse>(`${this.baseUrl}/summary`, { params })
      .pipe(
        map(response => response.data)
      );
  }
}