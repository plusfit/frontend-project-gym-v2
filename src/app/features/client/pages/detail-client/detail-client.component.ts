import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import {
  GetClientById,
  PlanClient,
  RoutineClient,
} from '@features/client/state/clients.actions';
import { ClientsState } from '@features/client/state/clients.state';
import { Client } from '@features/client/interface/clients.interface';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ClientDetailInfoComponent } from '../../components/client-detail-info/client-detail-info.component';
import { ClientDetailRoutineComponent } from '../../components/client-detail-routine/client-detail-routine.component';
import { ClientDetailPlanComponent } from '../../components/client-detail-plan/client-detail-plan.component';
import { ClientDetailSchedulesComponent } from '../../components/client-detail-schedules/client-detail-schedules.component';

@Component({
  selector: 'app-detail-client',
  standalone: true,
  imports: [
    MatTabsModule,
    AsyncPipe,
    NgIf,
    ClientDetailInfoComponent,
    ClientDetailRoutineComponent,
    ClientDetailPlanComponent,
    ClientDetailSchedulesComponent,
  ],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.css',
})
export class DetailClientComponent implements OnInit, OnDestroy {
  id: string = '';
  client$!: Observable<Client | null>;

  // ── Lightbox ──────────────────────────────────────────────
  lightboxUrl: string | null = null;
  lightboxName: string | null = null;

  @HostListener('document:keydown.escape')
  onEscapeKey(): void { this.closeLightbox(); }
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private actions: Actions,
  ) { }

  private destroy = new Subject<void>();

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.client$ = this.store.select(ClientsState.getSelectedClient);
    if (this.id) {
      this.store.dispatch(new GetClientById(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetClientById), takeUntil(this.destroy))
        .subscribe(() => {
          this.store
            .select((state) => state.clients.selectedClient)
            .pipe(takeUntil(this.destroy))
            .subscribe(() => { });
          this.store.dispatch(new RoutineClient()).subscribe();
          this.store.dispatch(new PlanClient()).subscribe();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onDetailAvatarLoad(event: Event, skeleton: HTMLElement): void {
    const img = event.target as HTMLImageElement;
    skeleton.style.display = 'none';
    img.style.opacity = '1';
  }

  openLightbox(url: string, name?: string): void {
    if (!url) return;
    this.lightboxUrl = url;
    this.lightboxName = name ?? null;
  }

  closeLightbox(): void {
    this.lightboxUrl = null;
    this.lightboxName = null;
  }
}
