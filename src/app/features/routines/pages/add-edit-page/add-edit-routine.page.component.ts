import { Component } from '@angular/core';
import { RoutineFormComponent } from '@features/routines/components/routine-form/routine-form.component';
import { TableComponent } from '@shared/components/table/table.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [RoutineFormComponent, TableComponent],
  templateUrl: './add-edit-routine.page.component.html',
  styleUrl: './add-edit-routine.page.component.css',
})
export class AddEditRoutinePageComponent {
  constructor() {}
  displayedColumns: string[] = ['name', 'isCustom', 'day'];
}
