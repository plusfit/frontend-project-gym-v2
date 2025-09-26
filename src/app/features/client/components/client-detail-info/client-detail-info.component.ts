import { AsyncPipe, DatePipe, NgClass } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ClientsState } from "@features/client/state/clients.state";
import { Actions, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { LoaderComponent } from "../../../../shared/components/loader/loader.component";
import { TranslationPipe } from "@shared/pipes/translation.pipe";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { EColorBadge } from "@shared/enums/badge-color.enum";

@Component({
  selector: "app-client-detail-info",
  standalone: true,
  imports: [AsyncPipe, LoaderComponent, DatePipe, TranslationPipe, BadgeComponent, NgClass],
  templateUrl: "./client-detail-info.component.html",
  styleUrl: "./client-detail-info.component.css",
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

  /**
   * Get badge color based on total accesses count
   */
  getTotalAccessesBadgeColor(totalAccesses: number): EColorBadge {
    if (!totalAccesses || totalAccesses === 0) {
      return EColorBadge.NEUTRAL;
    }
    if (totalAccesses <= 5) {
      return EColorBadge.WARNING;
    }
    if (totalAccesses <= 15) {
      return EColorBadge.INFO;
    }
    return EColorBadge.SUCCESS;
  }

  /**
   * Get activity level description based on total accesses
   */
  getActivityLevel(totalAccesses: number): string {
    if (!totalAccesses || totalAccesses === 0) {
      return "Sin actividad";
    }
    if (totalAccesses <= 5) {
      return "Poco activo";
    }
    if (totalAccesses <= 15) {
      return "Moderado";
    }
    return "Muy activo";
  }

  protected readonly Object = Object;
}
