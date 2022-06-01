import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ResetWebspacePasswordPageRoutingModule } from './reset-webspace-password-routing.module';
import { ResetWebspacePasswordPage } from './reset-webspace-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetWebspacePasswordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ResetWebspacePasswordPage]
})
export class ResetWebspacePasswordPageModule { }
