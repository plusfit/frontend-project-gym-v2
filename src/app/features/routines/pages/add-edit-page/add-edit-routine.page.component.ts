import { Component } from '@angular/core';
import { RoutineFormComponent } from '@features/routines/components/routine-form/routine-form.component';
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [RoutineFormComponent],
  templateUrl: './add-edit-routine.page.component.html',
  styleUrl: './add-edit-routine.page.component.css',
})
export class AddEditRoutinePageComponent {}
