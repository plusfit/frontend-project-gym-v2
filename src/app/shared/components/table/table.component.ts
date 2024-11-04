import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { EColorBadge } from '../../enums/badge-color.enum';
import { CdkTableModule } from '@angular/cdk/table';
import {
  AsyncPipe,
  JsonPipe,
  NgClass,
  NgFor,
  NgIf,
  TitleCasePipe,
} from '@angular/common';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import { MatNoDataRow } from '@angular/material/table';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { TranslationPipe } from '@shared/pipes/translation.pipe';
import { CamelToTitlePipe } from '@shared/pipes/camel-to-title.pipe';

/**
 * The TableComponent displays a table of data.
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.componnent.html',
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
    AsyncPipe,
    TitleCasePipe,
    JsonPipe,
    CdkTableModule,
    TranslationPipe,
    CamelToTitlePipe,
  ],
})
export class TableComponent {
  EColorBadge: typeof EColorBadge = EColorBadge;
  @Output() readonly edit = new EventEmitter<any>();
  @Output() readonly deactivate = new EventEmitter<any>();
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
   * Header css class
   * @type {string} css class
   */
  @Input() headerCssClass = 'header-default';

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
  emitDeactivate(id: string): void {
    this.deactivate.emit(id);
  }
}
