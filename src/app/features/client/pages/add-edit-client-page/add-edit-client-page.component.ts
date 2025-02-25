import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetClientById } from '@features/client/state/clients.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { ClientFormComponent } from '../../components/client-form/client-form.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PlanFormComponent } from '../../../plans/components/plan-form/plan-form.component';
import { RoutineFormComponent } from '../../../routines/components/routine-form/routine-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-add-edit-client-page',
  standalone: true,
  imports: [
    ClientFormComponent,
    MatTabsModule,
    PlanFormComponent,
    RoutineFormComponent,
    AsyncPipe,
  ],
  templateUrl: './add-edit-client-page.component.html',
  styleUrl: './add-edit-client-page.component.css',
})
export class AddEditClientPageComponent implements OnInit, OnDestroy {
  id: string = '';
  title = 'Editar cliente';
  isEdit = false;
  plan$ = this.store.select((state) => state.plans.selectedPlan);

  private destroy = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.id && this.id !== 'crear') {
      this.store.dispatch(new GetClientById(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetClientById), takeUntil(this.destroy))
        .subscribe(() => {
          this.store
            .select((state) => state.clients.selectedClient)
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
              this.isEdit = true;
            });
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
