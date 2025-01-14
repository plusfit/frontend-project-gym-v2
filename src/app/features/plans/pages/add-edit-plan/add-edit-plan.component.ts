import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlanFormComponent } from '@features/plans/components/plan-form/plan-form.component';
import { ActivatedRoute } from '@angular/router';
import { GetPlan } from '@features/plans/state/plan.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-edit-plan',
  standalone: true,
  imports: [PlanFormComponent],
  templateUrl: './add-edit-plan.component.html',
})
export class AddEditPlanComponent implements OnInit, OnDestroy {
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

    if (this.id && this.id !== 'crear') {
      this.store.dispatch(new GetPlan(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetPlan), takeUntil(this.destroy))
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
