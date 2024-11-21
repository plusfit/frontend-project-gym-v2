import {
  Component,
  Input,
  output,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-routine-table',
  styleUrls: ['./routine-table.component.css'],
  templateUrl: './routine-table.component.html',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    TableComponent,
  ],
})
export class RoutineTableComponent implements AfterViewInit {
  @Input() displayedColumns: string[] = [];
  @Input() routines$!: Observable<any[]>;
  @Input() loading$!: Observable<boolean>;

  editEmitter = output<string>();
  deleteEmitter = output<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleEdit(id: string): void {
    this.editEmitter.emit(id);
  }

  handleDelete(id: string): void {
    this.deleteEmitter.emit(id);
  }
}
