import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';

import { Organization } from '../../interfaces/organization.interface';
import { Plan } from '@features/plans/interfaces/plan.interface';
import { Client } from '@features/client/interface/clients.interface';
import { Routine } from '@features/routines/interfaces/routine.interface';

import { OrganizationsState } from '../../state/organizations.state';
import {
  GetOrganizationById,
  GetOrganizationPlans,
  GetOrganizationClients,
  GetOrganizationRoutines,
  SetSelectedOrganization,
} from '../../state/organizations.actions';

import { TitleComponent } from '@shared/components/title/title.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { OrganizationDetailInfoComponent } from '../../components/organization-detail-info/organization-detail-info.component';
import { OrganizationDetailPlansComponent } from '../../components/organization-detail-plans/organization-detail-plans.component';
import { OrganizationDetailClientsComponent } from '../../components/organization-detail-clients/organization-detail-clients.component';
import { OrganizationDetailRoutinesComponent } from '../../components/organization-detail-routines/organization-detail-routines.component';

@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    TitleComponent,
    LoaderComponent,
    OrganizationDetailInfoComponent,
    OrganizationDetailPlansComponent,
    OrganizationDetailClientsComponent,
    OrganizationDetailRoutinesComponent,
  ],
  templateUrl: './organization-detail-page.component.html',
  styleUrl: './organization-detail-page.component.css',
})
export class OrganizationDetailPageComponent implements OnInit, OnDestroy {
  organizationId = '';
  organization$: Observable<Organization | null>;
  plans$: Observable<Plan[]>;
  clients$: Observable<Client[]>;
  routines$: Observable<Routine[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  // Agregar flag para demo
  isDemo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
  ) {
    this.organization$ = this.store.select(
      OrganizationsState.getSelectedOrganization,
    );
    this.plans$ = this.store.select(OrganizationsState.getOrganizationPlans);
    this.clients$ = this.store.select(
      OrganizationsState.getOrganizationClients,
    );
    this.routines$ = this.store.select(
      OrganizationsState.getOrganizationRoutines,
    );
    this.loading$ = this.store.select(OrganizationsState.getLoading);
    this.error$ = this.store.select(OrganizationsState.getError);
  }

  ngOnInit(): void {
    console.log('🔍 DEBUG - OrganizationDetailPageComponent ngOnInit started');
    this.organizationId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log('🔍 DEBUG - Organization ID from route:', this.organizationId);

    if (!this.organizationId) {
      console.log(
        '🔍 DEBUG - No organization ID found, redirecting to organizations list',
      );
      this.router.navigate(['/organizaciones']);
      return;
    }

    // Para demo - crear datos ficticios si el ID es "demo"
    if (this.organizationId === 'demo') {
      this.createDemoData();
      return;
    }

    // Clear previous data before loading new organization
    this.clearOrganizationData();
    this.loadOrganizationData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private clearOrganizationData(): void {
    console.log('🔍 DEBUG - Clearing previous organization data');
    this.store.dispatch(new SetSelectedOrganization(null));
  }

  private loadOrganizationData(): void {
    console.log(
      '🔍 DEBUG - Loading organization data for ID:',
      this.organizationId,
    );
    this.store.dispatch(new GetOrganizationById(this.organizationId));
    this.store.dispatch(new GetOrganizationPlans(this.organizationId));
    this.store.dispatch(new GetOrganizationClients(this.organizationId));
    this.store.dispatch(new GetOrganizationRoutines(this.organizationId));
  }

  private createDemoData(): void {
    console.log('🔍 DEBUG - Creating demo data');

    // Para demo, crear datos locales sin usar el estado del store
    // Esto evita problemas con los observables del estado
    this.isDemo = true;

    // Los componentes hijos ya manejan sus propios datos de demo cuando no reciben datos
    console.log(
      '🔍 DEBUG - Demo mode activated, child components will show demo data',
    );
  }

  onBackToList(): void {
    this.router.navigate(['/organizaciones']);
  }
}
