import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentTimetablePageRoutingModule } from './student-timetable-routing.module';

import { StudentTimetablePage } from './student-timetable.page';
import { ClassesPipe } from './classes.pipe';
import { GenPipe } from './gen.pipe';
import { StrToColorPipe } from './str-to-color.pipe';
import { ThedayPipe } from './theday.pipe';
import { TheweekPipe } from './theweek.pipe';
import { TimeParserPipe } from './time-parser.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentTimetablePageRoutingModule
  ],
  declarations: [StudentTimetablePage, ClassesPipe, GenPipe, StrToColorPipe, ThedayPipe, TheweekPipe, TimeParserPipe]
})
export class StudentTimetablePageModule {}
