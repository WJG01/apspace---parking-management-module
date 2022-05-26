import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SetSecurityQuestionsPageRoutingModule } from './set-security-questions-routing.module';
import { SetSecurityQuestionsPage } from './set-security-questions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetSecurityQuestionsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SetSecurityQuestionsPage]
})
export class SetSecurityQuestionsPageModule { }
