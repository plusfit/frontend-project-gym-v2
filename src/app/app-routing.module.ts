import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'rewards',
    loadChildren: () => import('./features/rewards/rewards.module').then(m => m.RewardsModule)
  },
  {
    path: '',
    redirectTo: '/rewards',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/rewards'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
