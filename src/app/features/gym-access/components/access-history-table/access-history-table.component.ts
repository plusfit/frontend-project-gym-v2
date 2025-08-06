import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BadgeComponent } from '@shared/components/badge/badge.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { EColorBadge } from '@shared/enums/badge-color.enum';

import {
  GymAccessHistoryItem,
  AccessFilters,
  AccessTableColumn
} from '../../interfaces/gym-access-admin.interface';

@Component({
  selector: 'app-access-history-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    BadgeComponent,
    LoaderComponent
  ],
  templateUrl: './access-history-table.component.html',
  styleUrls: ['./access-history-table.component.css']
})
export class AccessHistoryTableComponent implements OnInit, OnChanges {
  @Input() data: GymAccessHistoryItem[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Input() filters: AccessFilters = {
    page: 1,
    limit: 10
  };

  @Output() filtersChange = new EventEmitter<AccessFilters>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() exportData = new EventEmitter<string>();
  @Output() viewClientDetail = new EventEmitter<string>();

  // Local filter values
  localFilters = {
    clientName: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    successful: null as boolean | null,
    cedula: ''
  };

  // Table configuration
  displayedColumns: string[] = [
    'accessDate',
    'clientName',
    'cedula',
    'successful',
    'reason',
    'actions'
  ];

  columns: AccessTableColumn[] = [
    { key: 'accessDate', label: 'Fecha y Hora', sortable: true, type: 'date' },
    { key: 'clientName', label: 'Cliente', sortable: true, type: 'text' },
    { key: 'cedula', label: 'Cédula', sortable: true, type: 'text' },
    { key: 'successful', label: 'Estado', sortable: true, type: 'badge' },
    { key: 'reason', label: 'Motivo', sortable: false, type: 'text' },
    { key: 'actions', label: 'Acciones', sortable: false, type: 'text' }
  ];

  // Badge colors
  EColorBadge = EColorBadge;

  // Success options for filter
  successOptions = [
    { value: null, label: 'Todos los accesos' },
    { value: true, label: 'Exitosos' },
    { value: false, label: 'Fallidos' }
  ];

  ngOnInit(): void {
    this.initializeLocalFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && changes['filters'].currentValue) {
      this.initializeLocalFilters();
    }
  }

  private initializeLocalFilters(): void {
    this.localFilters = {
      clientName: this.filters.clientName || '',
      startDate: this.filters.startDate ? new Date(this.filters.startDate) : null,
      endDate: this.filters.endDate ? new Date(this.filters.endDate) : null,
      successful: this.filters.successful !== undefined ? this.filters.successful : null,
      cedula: this.filters.cedula || ''
    };
  }

  /**
   * Apply filters to the table
   */
  applyFilters(): void {
    const updatedFilters: AccessFilters = {
      ...this.filters,
      page: 1, // Reset to first page when applying filters
      clientName: this.localFilters.clientName || undefined,
      startDate: this.localFilters.startDate ? this.formatDateForApi(this.localFilters.startDate) : undefined,
      endDate: this.localFilters.endDate ? this.formatDateForApi(this.localFilters.endDate) : undefined,
      successful: this.localFilters.successful !== null ? this.localFilters.successful : undefined,
      cedula: this.localFilters.cedula || undefined
    };

    this.filtersChange.emit(updatedFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.localFilters = {
      clientName: '',
      startDate: null,
      endDate: null,
      successful: null,
      cedula: ''
    };

    const clearedFilters: AccessFilters = {
      page: 1,
      limit: this.filters.limit
    };

    this.filtersChange.emit(clearedFilters);
  }

  /**
   * Handle page change events
   */
  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  /**
   * Handle sort change events
   */
  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  /**
   * Export data in specified format
   */
  onExportData(format: string): void {
    this.exportData.emit(format);
  }

  /**
   * View client details
   */
  onViewClientDetail(cedula: string): void {
    this.viewClientDetail.emit(cedula);
  }

  /**
   * Get badge color for access status
   */
  getStatusBadgeColor(successful: any): EColorBadge {
    console.log('getStatusBadgeColor called with:', successful, typeof successful);
    
    // Use the same normalization logic
    const isSuccessful = this.normalizeSuccessfulValue(successful);
    
    console.log('Badge color - normalized successful value:', isSuccessful);
    
    if (isSuccessful) {
      console.log('Returning SUCCESS badge color');
      return EColorBadge.SUCCESS;
    } else {
      console.log('Returning ERROR badge color');
      return EColorBadge.ERROR;
    }
  }

  /**
   * Get status text
   */
  getStatusText(successful: any, reason?: string): string {
    // Debug: Log the actual value and its type
    console.log('getStatusText called with:', { 
      successful, 
      type: typeof successful, 
      reason,
      isStrictTrue: successful === true,
      isLooseTrue: successful == true,
      booleanValue: Boolean(successful)
    });
    
    // Normalize the successful value to boolean
    const isSuccessful = this.normalizeSuccessfulValue(successful);
    
    console.log('Normalized successful value:', isSuccessful);
    
    if (isSuccessful) {
      console.log('Returning: Exitoso');
      return 'Exitoso';
    } else {
      console.log('Returning:', reason || 'Fallido');
      return reason || 'Fallido';
    }
  }

  /**
   * Normalize successful value to boolean
   */
  private normalizeSuccessfulValue(successful: any): boolean {
    // Handle null, undefined
    if (successful === null || successful === undefined) {
      return false;
    }
    
    // Handle boolean
    if (typeof successful === 'boolean') {
      return successful;
    }
    
    // Handle string
    if (typeof successful === 'string') {
      return successful.toLowerCase() === 'true';
    }
    
    // Handle number
    if (typeof successful === 'number') {
      return successful === 1;
    }
    
    // Default to boolean conversion
    return Boolean(successful);
  }


  /**
   * Format date for display
   */
  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format date for API
   */
  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return !!(
      this.localFilters.clientName ||
      this.localFilters.startDate ||
      this.localFilters.endDate ||
      this.localFilters.successful !== null ||
      this.localFilters.cedula
    );
  }

  /**
   * Get active filters count
   */
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.localFilters.clientName) count++;
    if (this.localFilters.startDate) count++;
    if (this.localFilters.endDate) count++;
    if (this.localFilters.successful !== null) count++;
    if (this.localFilters.cedula) count++;
    return count;
  }



  /**
   * Format cedula for display
   */
  formatCedula(cedula: string): string {
    if (cedula.length === 8) {
      return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`;
    }
    return cedula;
  }

  /**
   * Get photo URL or default placeholder
   */
  getClientPhotoUrl(photo?: string): string {
    return photo || 'assets/defaults/user-placeholder.png';
  }

  /**
   * Handle client photo error
   */
  onPhotoError(event: any): void {
    event.target.src = 'assets/defaults/user-placeholder.png';
  }

  /**
   * Debug helper to show value type in template
   */
  getDebugInfo(value: any): string {
    return `${value} (${typeof value})`;
  }

  /**
   * Set quick date range
   */
  setQuickDateRange(range: 'today' | 'week' | 'month'): void {
    const today = new Date();
    const endDate = new Date(today);

    switch (range) {
      case 'today':
        this.localFilters.startDate = new Date(today);
        this.localFilters.endDate = new Date(today);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        this.localFilters.startDate = weekAgo;
        this.localFilters.endDate = endDate;
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        this.localFilters.startDate = monthAgo;
        this.localFilters.endDate = endDate;
        break;
    }

    this.applyFilters();
  }
}