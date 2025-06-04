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
import { OrganizationPermissionsComponent } from '../../components/organization-permissions/organization-permissions.component';

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
    OrganizationPermissionsComponent,
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
    this.organizationId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.organizationId) {
      this.router.navigate(['/organizaciones']);
      return;
    }

    if (this.organizationId === 'demo') {
      this.createDemoData();
      return;
    }

    this.clearOrganizationData();
    this.loadOrganizationData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private clearOrganizationData(): void {
    this.store.dispatch(new SetSelectedOrganization(null));
  }

  private loadOrganizationData(): void {
    this.store.dispatch(new GetOrganizationById(this.organizationId));
    this.store.dispatch(new GetOrganizationPlans(this.organizationId));
    this.store.dispatch(new GetOrganizationClients(this.organizationId));
    this.store.dispatch(new GetOrganizationRoutines(this.organizationId));
  }

  private createDemoData(): void {
    this.isDemo = true;
  }

  onBackToList(): void {
    this.router.navigate(['/organizaciones']);
  }
}
