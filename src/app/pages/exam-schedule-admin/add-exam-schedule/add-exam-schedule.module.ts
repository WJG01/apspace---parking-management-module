import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddExamSchedulePageRoutingModule } from './add-exam-schedule-routing.module';

import { CalendarModule } from 'ion2-calendar';
import { AddExamSchedulePage } from './add-exam-schedule.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExamSchedulePageRoutingModule,
    CalendarModule,
    ReactiveFormsModule
  ],
  declarations: [AddExamSchedulePage]
})
export class AddExamSchedulePageModule {}
