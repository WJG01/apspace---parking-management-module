import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SlotDetailsModalPage } from './slot-details-modal.page';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedPipesModule
  ],
  declarations: [SlotDetailsModalPage]
})
export class SlotDetailsModalPageModule { }
