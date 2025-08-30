import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RewardsListComponent } from './components/rewards-list/rewards-list.component';
import { ExchangeHistoryComponent } from './components/exchange-history/exchange-history.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: RewardsListComponent,
    data: { title: 'Premios' }
  },
  {
    path: 'history',
    component: ExchangeHistoryComponent,
    data: { title: 'Historial de Canjes' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RewardsRoutingModule { }