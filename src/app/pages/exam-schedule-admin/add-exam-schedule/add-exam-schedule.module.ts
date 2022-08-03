import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddExamSchedulePageRoutingModule } from './add-exam-schedule-routing.module';

import { AddExamSchedulePage } from './add-exam-schedule.page';
import { ExamDurationPipe } from './exam-duration.pipe';
import { ModulesFilterPipe } from './modules-filter.pipe';
import { ManageAssessmentTypesPageModule } from './manage-assessment-types/manage-assessment-types.module';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExamSchedulePageRoutingModule,
    CalendarModule,
    ReactiveFormsModule,
    ManageAssessmentTypesPageModule
  ],
  declarations: [AddExamSchedulePage, ExamDurationPipe, ModulesFilterPipe]
})
export class AddExamSchedulePageModule {}
