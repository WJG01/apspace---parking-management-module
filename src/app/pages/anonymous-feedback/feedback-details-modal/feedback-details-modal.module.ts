import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FeedbackDetailsModalPage } from './feedback-details-modal.page';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedPipesModule,
    ReactiveFormsModule
  ],
  declarations: [FeedbackDetailsModalPage]
})
export class FeedbackDetailsModalPageModule { }
