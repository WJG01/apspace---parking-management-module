import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwitchAccountModalPageRoutingModule } from './switch-account-modal-routing.module';

import { SwitchAccountModalPage } from './switch-account-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchAccountModalPageRoutingModule
  ],
  declarations: [SwitchAccountModalPage]
})
export class SwitchAccountModalPageModule {}
