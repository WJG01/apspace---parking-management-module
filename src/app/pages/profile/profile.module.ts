import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { RequestChangeModalPage } from './request-update-modal/request-update-modal';
import { VirtualCardModalPage } from './virtual-card-modal/virtual-card-modal';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProfilePage, RequestChangeModalPage, VirtualCardModalPage],
})
export class ProfilePageModule { }
