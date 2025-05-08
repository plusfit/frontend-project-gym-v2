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
  selector: 'app-exercise-table',
  styleUrls: ['./exercise-table.component.css'],
  templateUrl: './exercise-table.component.html',
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
export class ExerciseTableComponent implements AfterViewInit {
  @Input() displayedColumns: string[] = [];
  @Input() exercises$!: Observable<any[]>;
  @Input() loading$!: Observable<boolean>;

  editEmitter = output<string>();
  deleteEmitter = output<any>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleEdit(id: string): void {
    this.editEmitter.emit(id);
  }

  handleDelete(excercise: { id: string; gifUrl: string }): void {
    this.deleteEmitter.emit(excercise);
  }
}
