import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import {SharedPipesModule} from '../../shared/shared-pipes.module';
import { FeedbackDetailsModalPage } from './feedback-details/feedback-details-modal';
import { FeedbackListPageRoutingModule } from './feedback-list-routing.module';
import { FeedbackListPage } from './feedback-list.page';
import { NewFeedbackModalPage } from './create-feedback/create-feedback-modal';
@NgModule({
    imports: [
        CommonModule,
        ComponentsModule,
        FormsModule,
        IonicModule,
        FeedbackListPageRoutingModule,
        SharedPipesModule,
    ],
  declarations: [FeedbackListPage, NewFeedbackModalPage, FeedbackDetailsModalPage],
  entryComponents: [NewFeedbackModalPage, FeedbackDetailsModalPage]
})
export class FeedbackListPageModule {}
