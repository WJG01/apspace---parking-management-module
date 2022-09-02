import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SharedPipesModule } from 'src/app/shared/shared-pipes.module';
import { DmuFormPage } from './dmu-form/dmu-form.page';
import { ProfilePage } from './profile.page';
import { RequestChangeModalPage } from './request-update-modal/request-update-modal';
import { VirtualCardModalPage } from './virtual-card-modal/virtual-card-modal';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'dmu-form',
    component: DmuFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedPipesModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProfilePage, RequestChangeModalPage, VirtualCardModalPage, DmuFormPage],
})
export class ProfilePageModule { }
