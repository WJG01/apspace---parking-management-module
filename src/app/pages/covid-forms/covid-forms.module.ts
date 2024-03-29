import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CovidFormsPage } from './covid-forms.page';

const routes: Routes = [
  {
    path: '',
    component: CovidFormsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [CovidFormsPage]
})
export class CovidFormsPageModule { }
