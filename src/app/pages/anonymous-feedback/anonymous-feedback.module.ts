import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AnonymousFeedbackPageRoutingModule } from './anonymous-feedback-routing.module';
import { AnonymousFeedbackPage } from './anonymous-feedback.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { CreateFeedbackModalPageModule } from './create-feedback-modal/create-feedback-modal.module';
import { FeedbackDetailsModalPageModule } from './feedback-details-modal/feedback-details-modal.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnonymousFeedbackPageRoutingModule,
    SharedPipesModule,
    CreateFeedbackModalPageModule,
    FeedbackDetailsModalPageModule,
    ComponentsModule
  ],
  declarations: [AnonymousFeedbackPage]
})
export class AnonymousFeedbackPageModule { }
