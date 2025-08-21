import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'premios',
    loadChildren: () => import('./features/premios/premios.module').then(m => m.PremiosModule)
  },
  {
    path: '',
    redirectTo: '/premios',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/premios'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
