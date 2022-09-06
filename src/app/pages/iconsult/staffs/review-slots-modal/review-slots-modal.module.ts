import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReviewSlotsModalPage } from './review-slots-modal.page';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedPipesModule
  ],
  declarations: [ReviewSlotsModalPage]
})
export class ReviewSlotsModalPageModule { }
