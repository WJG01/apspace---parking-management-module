import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExamScheduleDetailsPageRoutingModule } from './exam-schedule-details-routing.module';

import { ExamScheduleDetailsPage } from './exam-schedule-details.page';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';
import { ComponentsModule } from '../../../components/components.module';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExamScheduleDetailsPageRoutingModule,
        SharedPipesModule,
        ComponentsModule,
        CalendarModule
    ],
  declarations: [ExamScheduleDetailsPage]
})
export class ExamScheduleDetailsPageModule {}
