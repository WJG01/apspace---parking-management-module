import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChangeWebspacePasswordPageRoutingModule } from './change-webspace-password-routing.module';
import { ChangeWebspacePasswordPage } from './change-webspace-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeWebspacePasswordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ChangeWebspacePasswordPage]
})
export class ChangeWebspacePasswordPageModule { }
