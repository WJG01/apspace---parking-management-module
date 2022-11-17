import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { VirtualCardModalPage } from './virtual-card-modal/virtual-card-modal';
import { RequestChangeModalPage } from './request-update-modal/request-update-modal';
import { DmuFormPage } from './dmu-form/dmu-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
  ],
  declarations: [ProfilePage, RequestChangeModalPage, VirtualCardModalPage, DmuFormPage]
})
export class ProfilePageModule {}
