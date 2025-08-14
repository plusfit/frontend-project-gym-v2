import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { EColorBadge } from "../../enums/badge-color.enum";
import { CdkTableModule } from "@angular/cdk/table";
import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatNoDataRow } from "@angular/material/table";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { LoaderComponent } from "@shared/components/loader/loader.component";
import { TranslationPipe } from "@shared/pipes/translation.pipe";
import { CamelToTitlePipe } from "@shared/pipes/camel-to-title.pipe";
import { MatCheckbox } from "@angular/material/checkbox";

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
   * Format cedula for display
   */
  formatCedula(cedula: string): string {
    if (cedula && cedula.length === 8) {
      return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`;
    }
    return cedula || '';
  }
}
