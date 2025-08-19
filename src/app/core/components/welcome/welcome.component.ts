import { AsyncPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { GetActiveClientsCount } from "@features/client/state/clients.actions";
import { ClientsState } from "@features/client/state/clients.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "app-welcome",
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: "./welcome.component.html",
  styleUrl: "./welcome.component.css",
})
export class WelcomeComponent implements OnInit {
  activeClientsCount!: Observable<number | null>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new GetActiveClientsCount());
    this.activeClientsCount = this.store.select(ClientsState.getActiveClientsCount);
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}
