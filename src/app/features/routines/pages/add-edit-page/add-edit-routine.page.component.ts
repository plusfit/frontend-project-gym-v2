import { Component, OnInit } from '@angular/core';
import { RoutineFormComponent } from '@features/routines/components/routine-form/routine-form.component';
//import { RoutineState } from '@features/routines/state/routine.state';
import { Store } from '@ngxs/store';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [RoutineFormComponent],
  templateUrl: './add-edit-routine.page.component.html',
  styleUrl: './add-edit-routine.page.component.css',
})
export class AddEditRoutinePageComponent implements OnInit {
  constructor(private store: Store) {}

  displayedColumns: string[] = ['name', 'isCustom', 'day'];
  selectedRoutine!: Observable<Routine>;
  subRoutines: SubRoutine[] = [];

  ngOnInit(): void {
    // this.selectedRoutine = this.store.select(RoutineState.selectedRoutine);
    // if (this.selectedRoutine) {
    //   this.subRoutines = this.selectedRoutine!.subroutines;
    // }
  } //
}
