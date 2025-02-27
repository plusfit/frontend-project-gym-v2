import {AsyncPipe, NgClass} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientsState } from '@features/client/state/clients.state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { TranslationPipe } from '@shared/pipes/translation.pipe';

@Component({
  selector: 'app-client-detail-plan',
  standalone: true,
  imports: [AsyncPipe, LoaderComponent, TranslationPipe, NgClass],
  templateUrl: './client-detail-plan.component.html',
  styleUrl: './client-detail-plan.component.css',
})
export class ClientDetailPlanComponent implements OnInit {
  clientPlan$: Observable<any> | undefined;
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.clientPlan$ = this.store.select(ClientsState.getSelectedClientPlan);
  }

    protected readonly Object = Object;
}
