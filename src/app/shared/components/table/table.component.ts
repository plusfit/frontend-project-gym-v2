import { CdkTableModule } from "@angular/cdk/table";
import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatNoDataRow } from "@angular/material/table";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { CamelToTitlePipe } from "@shared/pipes/camel-to-title.pipe";
import { TranslationPipe } from "@shared/pipes/translation.pipe";
import { EColorBadge } from "../../enums/badge-color.enum";

interface AccessObject {
    id: string;
    clientId: string;
    cedula: string;
    accessDate: string;
    accessDay: string;
    successful: boolean;
    reason: string;
    clientName: string;
    createdAt: string;
    updatedAt: string;
  }

/**
 * The TableComponent displays a table of data.
 */
@Component({
  selector: "app-table",
  templateUrl: "./table.componnent.html",
  standalone: true,
  imports: [
    NgClass,
    MatMenuTrigger,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatNoDataRow,
    BadgeComponent,
    LoaderComponent,
    NgFor,
    NgIf,
    CdkTableModule,
    TranslationPipe,
    CamelToTitlePipe,
    DatePipe,
    MatCheckbox,
    MatIcon,
  ],
})
export class TableComponent implements OnInit {
  EColorBadge: typeof EColorBadge = EColorBadge;
  @Output() readonly selectionChange = new EventEmitter<any[]>();
  @Output() readonly edit = new EventEmitter<any>();
  @Output() readonly delete = new EventEmitter<any>();
  @Output() readonly seeDetail = new EventEmitter<any>();
  @Output() readonly disabled = new EventEmitter<{
    id: string;
    disabled: boolean;
  }>();

  @Input() showDelete = true;
  @Input() showSeeDetail = false;
  @Input() showDisabled = false;
  /**
   * The list of column names to display in the table.
   * @type {Array} array of column names
   */
  @Input() displayedColumns: string[] = [];

  /**
   * The data to display in the table.
   * @type {Observable} observable of data
   */
  @Input() data!: any[] | null;

  /**
   * The total number of items in the data set.
   * @type {number} total count
   */
  @Input() total: number | null = 0;

  /**
   * Whether the data is currently being loaded.
   * @type {boolean} loading state
   */
  @Input() loading: boolean | null = false;

  /**
   * Whether the data has been filtered.
   * @type {boolean} filtered state
   */
  @Input() filteredData = false;

  /**
   * Header CSS class
   * @type {string} css class
   */
  @Input() headerCssClass = "header-default";

  @Input() isSelect = false;
  @Input() selected: any[] = [];

  /**
   * The selected exercises.
   * @type {Set<string>} set of selected exercises
   */
  selection: any[] = [];

  get tableColumns(): string[] {
    const isSelect = this.isSelect;
    const tableColums = isSelect ? ["select", ...this.displayedColumns] : this.displayedColumns;
    return tableColums;
  }

  /**
   * Emit identifier to seeDetail seats of an organization
   * @param element AccessObject
   */
  emitSeeDetail(element: any): void {
      this.seeDetail.emit(element);
  }
  /**
   * Emit identifier to edit seats of an organization
   * @param id Organization identifier
   */
  emitEdit(id: string): void {
    this.edit.emit(id);
  }

  /**
   * Emit identifier to deactivate organization
   * @param id Organization identifier
   */
  emitDelete(excercise: { id: string; gifUrl: string }): void {
    this.delete.emit(excercise);
  }

  emitDisabled(id: string, disabled: boolean): void {
    this.disabled.emit({ id, disabled });
  }

  resolveNestedProperty(object: any, path: string): any {
    return path.split(".").reduce((o, key) => (o ? o[key] : null), object) || "N/A";
  }

  toggleSelection(element: any): void {
    const elementId = element.id || element._id;
    const index = this.selection.findIndex((item) => (item.id || item._id) === elementId);
    if (index > -1) {
      this.selection.splice(index, 1);
    } else {
      this.selection.push(element);
    }
    this.selectionChange.emit(this.selection);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selection = [];
    } else {
      this.selection = [...(this.data || [])];
    }
    this.selectionChange.emit([...this.selection]);
  }

  isAllSelected(): boolean {
    if (this.data) {
      return this.data?.every((item) =>
        this.selection.some((selected) => (selected.id || selected._id) === (item.id || item._id)),
      );
    } else {
      return false;
    }
  }

  isSelected(element: any): boolean {
    return this.selection.some((item) => (item.id || item._id) === (element.id || element._id));
  }

  ngOnInit() {
    this.selected ? (this.selection = [...this.selected]) : (this.selection = []);
  }

  getColorBadge(category: string): EColorBadge {
    switch (category) {
      case "room":
        return EColorBadge.SUCCESS;
      case "cardio":
        return EColorBadge.ERROR;
      case "mix":
        return EColorBadge.INFO;
      default:
        return EColorBadge.INFO;
    }
  }

  /**
   * Get the text badge for a given value.
   */
  getTextBadge(value: string): string {
    switch (value) {
      case "upper_body":
        return "Tren Superior";
      case "lower_body":
        return "Tren Inferior";
      case "core":
        return "Core";
      case "cardio":
        return "Cardio";
      case "flexibility":
        return "Flexibilidad";
      case "strength":
        return "Fuerza";
      case "endurance":
        return "Resistencia";
      case "balance":
        return "Equilibrio";
      default:
        return value;
    }
  }

  getSexTypeLabel(sexType: string): string {
    const sexTypeLabels: { [key: string]: string } = {
      Hombre: "Hombre",
      Mujer: "Mujer",
      male: "Hombre",
      female: "Mujer",
      unisex: "Unisex",
    };
    return sexTypeLabels[sexType] || sexType;
  }

  getSexTypeBadgeColor(sexType: string): EColorBadge {
    const sexTypeColors: { [key: string]: EColorBadge } = {
      Hombre: EColorBadge.INFO,
      Mujer: EColorBadge.PINK,
      male: EColorBadge.INFO,
      female: EColorBadge.PINK,
      unisex: EColorBadge.WARNING,
    };
    return sexTypeColors[sexType] || EColorBadge.NEUTRAL;
  }

  /**
   * Get badge color based on total accesses count
   */
  getTotalAccessesBadgeColor(totalAccesses: number): EColorBadge {
    if (!totalAccesses || totalAccesses === 0) {
      return EColorBadge.NEUTRAL;
    }
    if (totalAccesses <= 5) {
      return EColorBadge.WARNING;
    }
    if (totalAccesses <= 15) {
      return EColorBadge.INFO;
    }
    return EColorBadge.SUCCESS;
  }

  /**
   * Format cedula for display
   */
  formatCedula(cedula: string): string {
    if (cedula && cedula.length === 8) {
      return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`;
    }
    return cedula || "";
  }

  /**
   * Get image URL with fallback protection
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return this.getPlaceholderImage();
    }
    
    try {
      // Handle absolute URLs
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // Handle relative URLs - ensure they start with /
      const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${window.location.origin}${cleanPath}`;
    } catch (error) {
      console.warn('Error processing image URL:', imageUrl, error);
      return this.getPlaceholderImage();
    }
  }

  /**
   * Get a safe placeholder image that won't cause recursion
   */
  private getPlaceholderImage(): string {
    // Return an inline SVG that will never fail to load
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHptMC0xMmMtMi4yMDkgMC00IDEuNzkxLTQgNHMxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNC0xLjc5MS00LTQtNHoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  }

  /**
   * Handle image error by setting fallback - prevents infinite loops
   */
  handleImageError(event: any): void {
    const target = event.target;
    
    // Prevent infinite recursion by checking if we're already showing the fallback
    if (target.src.includes('data:image/svg+xml') || target.dataset.errorHandled) {
      return;
    }
    
    // Mark as error handled to prevent recursion
    target.dataset.errorHandled = 'true';
    
    // Use the same safe placeholder
    target.src = this.getPlaceholderImage();
  }

  /**
   * Format exchange date for display
   */
  formatExchangeDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get exchange status badge color
   */
  getExchangeStatusBadgeColor(status: string): EColorBadge {
    switch (status) {
      case 'completed':
        return EColorBadge.SUCCESS;
      case 'pending':
        return EColorBadge.WARNING;
      case 'cancelled':
        return EColorBadge.ERROR;
      default:
        return EColorBadge.NEUTRAL;
    }
  }

  /**
   * Get exchange status text
   */
  getExchangeStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
