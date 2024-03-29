import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedPipesModule } from '../../shared/shared-pipes.module';

import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { StudentTimetablePageRoutingModule } from './student-timetable-routing.module';

import { StudentTimetablePage } from './student-timetable.page';
import { ClassesPipe } from './classes.pipe';
import { GenPipe } from './gen.pipe';
import { ThedayPipe } from './theday.pipe';
import { TheWeekPipe } from './theweek.pipe';
import { TimeParserPipe } from './time-parser.pipe';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StudentTimetablePageRoutingModule,
        SharedPipesModule,
        ComponentsModule
    ],
    declarations: [StudentTimetablePage, ClassesPipe, GenPipe, ThedayPipe, TheWeekPipe, TimeParserPipe],
    providers: [FileOpener]
})
export class StudentTimetablePageModule {}
