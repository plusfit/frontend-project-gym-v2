import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubRoutineFormComponent } from '@features/sub-routines/components/sub-routine-form/sub-routine-form.component';
import { ActivatedRoute } from '@angular/router';
import { GetSubRoutine } from '@features/sub-routines/state/sub-routine.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-edit-sub-routine',
  standalone: true,
  imports: [SubRoutineFormComponent],
  templateUrl: './add-edit-sub-routine.component.html',
})
export class AddEditSubRoutineComponent implements OnInit, OnDestroy {
  id: string = '';
  isEdit = false;
  private destroy = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.id) {
      this.store.dispatch(new GetSubRoutine(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetSubRoutine), takeUntil(this.destroy))
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
