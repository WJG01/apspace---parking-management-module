import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';
import { CovidRtkFormPage } from './covid-rtk-form.page';

const routes: Routes = [
  {
    path: '',
    component: CovidRtkFormPage
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
  declarations: [CovidRtkFormPage]
})
export class CovidRtkFormPageModule { }
