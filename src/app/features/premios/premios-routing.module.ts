import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PremiosListComponent } from './components/premios-list/premios-list.component';
import { CanjeHistoryComponent } from './components/canje-history/canje-history.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'listado',
    pathMatch: 'full'
  },
  {
    path: 'listado',
    component: PremiosListComponent,
    data: { title: 'Catálogo de Premios' }
  },
  {
    path: 'historial',
    component: CanjeHistoryComponent,
    data: { title: 'Historial de Canjes' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PremiosRoutingModule { }