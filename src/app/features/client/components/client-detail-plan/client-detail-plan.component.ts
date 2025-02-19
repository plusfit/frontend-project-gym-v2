import { Component, OnInit } from '@angular/core';
import { ClientsState } from '@features/client/state/clients.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-client-detail-plan',
  standalone: true,
  imports: [],
  templateUrl: './client-detail-plan.component.html',
  styleUrl: './client-detail-plan.component.css',
})
export class ClientDetailPlanComponent implements OnInit {
  clientPlan$: any;
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.clientPlan$ = this.store.select(ClientsState.getSelectedClientPlan);
  }
}
