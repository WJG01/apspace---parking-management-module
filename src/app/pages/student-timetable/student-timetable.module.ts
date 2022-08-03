import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedPipesModule } from '../../shared/shared-pipes.module';

import { StudentTimetablePageRoutingModule } from './student-timetable-routing.module';

import { StudentTimetablePage } from './student-timetable.page';
import { ClassesPipe } from './classes.pipe';
import { GenPipe } from './gen.pipe';
import { ThedayPipe } from './theday.pipe';
import { TheWeekPipe } from './theweek.pipe';
import { TimeParserPipe } from './time-parser.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StudentTimetablePageRoutingModule,
        SharedPipesModule
    ],
    declarations: [StudentTimetablePage, ClassesPipe, GenPipe, ThedayPipe, TheWeekPipe, TimeParserPipe]
})
export class StudentTimetablePageModule {}
