import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DmuFormPage } from './dmu-form/dmu-form.page';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'visa-status',
    loadChildren: () => import('./visa-status/visa-status.module').then( m => m.VisaStatusPageModule)
  },
  {
    path: 'dmu-form',
    component: DmuFormPage
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
