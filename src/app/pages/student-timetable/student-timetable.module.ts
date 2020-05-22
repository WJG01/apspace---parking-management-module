import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RouterLinkDirectiveStub } from 'src/testing';
import { ComponentsModule } from '../../components/components.module';
import { ClassesPipe } from './classes.pipe';
import { GenPipe } from './gen.pipe';
import { StrToColorPipe } from './str-to-color.pipe';
import { StudentTimetablePage } from './student-timetable.page';
import { ThedayPipe } from './theday.pipe';
import { TheWeekPipe } from './theweek.pipe';

const routes: Routes = [
  {
    path: '',
    component: StudentTimetablePage
  },
  {
    path: ':intake',
    component: StudentTimetablePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
  ],
  declarations: [
    StudentTimetablePage,
    ClassesPipe,
    ThedayPipe,
    TheWeekPipe,
    GenPipe,
    RouterLinkDirectiveStub,
    StrToColorPipe  // TODO: remove this if possible temporary fix
  ],
})
export class StudentTimetablePageModule { }
