import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ExamSchedulePageRoutingModule } from './exam-schedule-routing.module';
import { ExamSchedulePage } from './exam-schedule.page';
import { ComponentsModule } from '../../components/components.module';
import { SharedPipesModule } from '../../shared/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExamSchedulePageRoutingModule,
    ComponentsModule,
    SharedPipesModule
  ],
  declarations: [ExamSchedulePage]
})
export class ExamSchedulePageModule { }
