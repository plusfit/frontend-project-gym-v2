import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientsState } from '@features/client/state/clients.state';
import { Actions, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-client-detail-info',
  standalone: true,
  imports: [AsyncPipe, LoaderComponent, DatePipe],
  templateUrl: './client-detail-info.component.html',
  styleUrl: './client-detail-info.component.css',
})
export class ClientDetailInfoComponent implements OnInit {
  clientInfo$: Observable<any> | undefined;
  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit(): void {
    this.clientInfo$ = this.store.select(ClientsState.getSelectedClient);
  }
}
