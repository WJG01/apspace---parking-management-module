import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { ApcardPage } from './apcard.page';

const routes: Routes = [
  {
    path: '',
    component: ApcardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    FormsModule
  ],
  declarations: [ApcardPage]
})
export class ApcardPageModule { }
