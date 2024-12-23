import {
  Component,
  Input,
  output,
  ChangeDetectorRef,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { map, Observable } from 'rxjs';

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
export class RoutineTableComponent implements AfterViewInit, OnInit {
  @Input() displayedColumns: string[] = [];
  @Input() routines$!: Observable<any[]>;
  @Input() loading$!: Observable<boolean>;

  editEmitter = output<string>();
  deleteEmitter = output<string>();

  transformedRoutines$!: Observable<any[]>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.transformedRoutines$ = this.routines$.pipe(
      map((routines) =>
        routines.map((routine) => ({
          ...routine,
          days: this.calculateDays(routine),
        })),
      ),
    );
  }

  calculateDays(routine: any): number {
    return routine.subRoutines.length;
  }

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
