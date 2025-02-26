import { Component, OnInit } from '@angular/core';
import { ClientsState } from '@features/client/state/clients.state';
import { Actions, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { AsyncPipe } from '@angular/common';
import { TranslationPipe } from '../../../../shared/pipes/translation.pipe';

@Component({
  selector: 'app-client-detail-routine',
  standalone: true,
  imports: [LoaderComponent, AsyncPipe, TranslationPipe],
  templateUrl: './client-detail-routine.component.html',
  styleUrl: './client-detail-routine.component.css',
})
export class ClientDetailRoutineComponent implements OnInit {
  clientRoutine$: Observable<any> | undefined;
  constructor(
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit(): void {
    this.clientRoutine$ = this.store.select(ClientsState.getSelectedRoutine);
  }

  showFullDescription: { [key: number]: boolean } = {};

  toggleDescription(index: number) {
    this.showFullDescription[index] = !this.showFullDescription[index];
  }
}
