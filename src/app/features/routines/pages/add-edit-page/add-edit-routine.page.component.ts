import { Component, OnDestroy, OnInit } from '@angular/core';
import { RoutineFormComponent } from '@features/routines/components/routine-form/routine-form.component';
//import { RoutineState } from '@features/routines/state/routine.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';
import { Routine } from '@features/routines/interfaces/routine.interface';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GetRoutineById } from '@features/routines/state/routine.actions';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [RoutineFormComponent],
  templateUrl: './add-edit-routine.page.component.html',
  styleUrl: './add-edit-routine.page.component.css',
})
export class AddEditRoutinePageComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private actions: Actions,
  ) {}

  id: string = '';
  isEdit = false;
  private destroy = new Subject<void>();

  displayedColumns: string[] = ['name', 'isCustom', 'day'];
  selectedRoutine!: Observable<Routine>;
  subRoutines: SubRoutine[] = [];

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.id) {
      this.store.dispatch(new GetRoutineById(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetRoutineById), takeUntil(this.destroy))
        .subscribe(() => {
          this.isEdit = true;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
