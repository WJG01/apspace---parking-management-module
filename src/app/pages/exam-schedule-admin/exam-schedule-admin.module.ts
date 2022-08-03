import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExamScheduleAdminPageRoutingModule } from './exam-schedule-admin-routing.module';

import { ExamScheduleAdminPage } from './exam-schedule-admin.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { AddExamSchedulePageModule } from './add-exam-schedule/add-exam-schedule.module';
import { ComponentsModule } from '../../components/components.module';
import { AddIntakePageModule } from './exam-schedule-details/add-intake/add-intake.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExamScheduleAdminPageRoutingModule,
    SharedPipesModule,
    AddExamSchedulePageModule,
    ComponentsModule,
    AddIntakePageModule
  ],
  declarations: [ExamScheduleAdminPage]
})
export class ExamScheduleAdminPageModule {}
