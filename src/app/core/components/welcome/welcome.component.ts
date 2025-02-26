import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetClients } from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent implements OnInit {
  total!: Observable<number | null>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new GetClients({ page: 1, pageSize: 1 }));
    this.total = this.store.select(ClientsState.getTotal);
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}
