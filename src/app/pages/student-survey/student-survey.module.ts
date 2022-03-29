import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StudentSurveyPageRoutingModule } from './student-survey-routing.module';
import { StudentSurveyPage } from './student-survey.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentSurveyPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StudentSurveyPage]
})
export class StudentSurveyPageModule { }
