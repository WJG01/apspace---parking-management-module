import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DingdongPreferencesModalPage } from './dingdong-preferences-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [DingdongPreferencesModalPage]
})
export class DingdongPreferencesModalPageModule { }
