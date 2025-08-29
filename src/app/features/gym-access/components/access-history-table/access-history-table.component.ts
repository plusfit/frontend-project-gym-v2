import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatSortModule, Sort } from "@angular/material/sort";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { BadgeComponent } from "@shared/components/badge/badge.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { TableComponent } from "@shared/components/table/table.component";
import { EColorBadge } from "@shared/enums/badge-color.enum";

import {
  GymAccessHistoryItem,
  AccessFilters,
  AccessTableColumn,
} from "../../interfaces/gym-access-admin.interface";

@Component({
  selector: "app-access-history-table",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    LoaderComponent,
    TableComponent,
  ],
  templateUrl: "./access-history-table.component.html",
  styleUrls: ["./access-history-table.component.css"],
})
export class AccessHistoryTableComponent implements OnInit, OnChanges {
  @Input() data: GymAccessHistoryItem[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Input() filters: AccessFilters = {
    page: 1,
    limit: 10,
  };

  @Output() filtersChange = new EventEmitter<AccessFilters>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() exportData = new EventEmitter<string>();
  @Output() viewClientDetail = new EventEmitter<string>();

  // Local filter values
  localFilters = {
    clientName: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    successful: null as boolean | null, // null = all, true = successful, false = failed
    cedula: "",
  };

  // Quick filter tracking
  activeQuickFilter: "today" | "week" | "month" | null = "today"; // Default to today

  // Table configuration
  displayedColumns: string[] = [
    "accessDate",
    "clientName",
    "cedula",
    "successful",
    "reason",
    "acciones",
  ];

  // Badge colors
  EColorBadge = EColorBadge;

  // Success options for filter
  successOptions = [
    { value: null, label: "Todos los accesos" },
    { value: true, label: "Exitosos" },
    { value: false, label: "Fallidos" },
  ];

  ngOnInit(): void {
    this.initializeLocalFilters();

    // Solo inicializar fechas "today" si el componente padre NO ha proporcionado fechas
    if (!this.filters.startDate && !this.filters.endDate) {
      this.activeQuickFilter = "today";

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      this.localFilters.startDate = startOfDay;
      this.localFilters.endDate = endOfDay;

      // Emitir los filtros para cargar datos inmediatamente
      this.applyFilters();
    } else {
      // Si el padre ya proporcionó fechas, determinar qué filtro rápido está activo
      this.determineActiveQuickFilter();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filters"]?.currentValue) {
      this.initializeLocalFilters();
    }
  }

  private initializeLocalFilters(): void {
    this.localFilters = {
      clientName: this.filters.clientName || "",
      startDate: this.filters.startDate ? this.parseDate(this.filters.startDate) : null,
      endDate: this.filters.endDate ? this.parseDate(this.filters.endDate) : null,
      successful: this.filters.successful !== undefined ? this.filters.successful : null,
      cedula: this.filters.cedula || "",
    };
  } /**
   * Apply filters to the table
   */
  applyFilters(): void {
    const updatedFilters: AccessFilters = {
      ...this.filters,
      page: 1, // Reset to first page when applying filters
      clientName: this.localFilters.clientName?.trim() || undefined,
      startDate: this.localFilters.startDate
        ? this.formatDateForApi(this.localFilters.startDate)
        : undefined,
      endDate: this.localFilters.endDate
        ? this.formatDateForApi(this.localFilters.endDate)
        : undefined,
      successful: this.localFilters.successful !== null ? this.localFilters.successful : undefined,
      cedula: this.localFilters.cedula?.trim() || undefined,
    };

    this.filtersChange.emit(updatedFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.localFilters = {
      clientName: "",
      startDate: null,
      endDate: null,
      successful: null,
      cedula: "",
    };

    const clearedFilters: AccessFilters = {
      page: 1,
      limit: this.filters.limit,
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
   * View client details
   */
  onViewClientDetail(cedula: string): void {
    this.viewClientDetail.emit(cedula);
  }

  /**
   * Handle edit event from app-table (will be used for viewing client detail)
   */
  handleEdit(id: string): void {
    // id here will be either element.id, element._id, or element.cedula
    // For gym access, we use cedula to view client details
    this.onViewClientDetail(id);
  }

  /**
   * Handle view detail event from app-table
   */
  handleViewDetail(id: string): void {
    // id here will be either element.id, element._id, or element.cedula
    // For gym access, we use cedula to view client details
    this.onViewClientDetail(id);
  }

  /**
   * Parse date string to Date object (handling timezone issues)
   */
  private parseDate(dateString: string): Date {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = Number.parseInt(parts[0], 10);
      const month = Number.parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = Number.parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }

  /**
   * Validate date range - ensure start date is before end date
   */
  private validateDateRange(): boolean {
    if (this.localFilters.startDate && this.localFilters.endDate) {
      return this.localFilters.startDate <= this.localFilters.endDate;
    }
    return true;
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDateForApi(date: Date): string {
    // Ensure we get local date not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
   * Determine which quick filter is active based on current date range
   */
  private determineActiveQuickFilter(): void {
    if (!this.localFilters.startDate || !this.localFilters.endDate) {
      this.activeQuickFilter = null;
      return;
    }

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Check if it matches "today" filter
    if (
      this.isSameDay(this.localFilters.startDate, startOfToday) &&
      this.isSameDay(this.localFilters.endDate, endOfToday)
    ) {
      this.activeQuickFilter = "today";
      return;
    }

    // Check if it matches "week" filter (7 days ago to today)
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    if (
      this.isSameDay(this.localFilters.startDate, weekAgo) &&
      this.isSameDay(this.localFilters.endDate, endOfToday)
    ) {
      this.activeQuickFilter = "week";
      return;
    }

    // Check if it matches "month" filter (30 days ago to today)
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    if (
      this.isSameDay(this.localFilters.startDate, monthAgo) &&
      this.isSameDay(this.localFilters.endDate, endOfToday)
    ) {
      this.activeQuickFilter = "month";
      return;
    }

    // No quick filter matches
    this.activeQuickFilter = null;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Set quick date range
   */
  setQuickDateRange(range: "today" | "week" | "month"): void {
    this.activeQuickFilter = range; // Track active filter

    const today = new Date();
    const endDate = new Date(today);

    // Set time to start/end of day for consistent filtering
    endDate.setHours(23, 59, 59, 999);

    switch (range) {
      case "today": {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        this.localFilters.startDate = startOfDay;
        this.localFilters.endDate = endDate;
        break;
      }
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        this.localFilters.startDate = weekAgo;
        this.localFilters.endDate = endDate;
        break;
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        this.localFilters.startDate = monthAgo;
        this.localFilters.endDate = endDate;
        break;
      }
    }

    // Force change detection and apply filters
    this.applyFilters();
  }

  /**
   * Get the count of successful accesses
   */
  getSuccessfulCount(): number {
    return this.data.filter((item) => item.successful === true).length;
  }

  /**
   * Get the count of failed accesses
   */
  getFailedCount(): number {
    return this.data.filter((item) => item.successful === false).length;
  }
}
