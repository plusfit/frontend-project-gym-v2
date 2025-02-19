import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import {
  GetClientById,
  PlanClient,
  RoutineClient,
} from '@features/client/state/clients.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { ClientDetailInfoComponent } from '../../components/client-detail-info/client-detail-info.component';
import { ClientDetailRoutineComponent } from '../../components/client-detail-routine/client-detail-routine.component';
import { ClientDetailPlanComponent } from '../../components/client-detail-plan/client-detail-plan.component';

@Component({
  selector: 'app-detail-client',
  standalone: true,
  imports: [
    MatTabsModule,
    ClientDetailInfoComponent,
    ClientDetailRoutineComponent,
    ClientDetailPlanComponent,
  ],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.css',
})
export class DetailClientComponent implements OnInit, OnDestroy {
  id: string = '';
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private actions: Actions,
  ) {}

  private destroy = new Subject<void>();

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id) {
      this.store.dispatch(new GetClientById(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetClientById), takeUntil(this.destroy))
        .subscribe(() => {
          this.store
            .select((state) => state.clients.selectedClient)
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {});
          this.store.dispatch(new RoutineClient()).subscribe();
          this.store.dispatch(new PlanClient()).subscribe();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
