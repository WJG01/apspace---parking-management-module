import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FeesPage } from './fees.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReversePipe } from './reverse.pipe';
import { ChartModule } from 'angular2-chartjs';
import { FilterPipe } from './filter.pipe';

const routes: Routes = [
  {
    path: '',
    component: FeesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ChartModule,
    ComponentsModule,
  ],
  declarations: [FeesPage, ReversePipe, FilterPipe]
})
export class FeesPageModule {}
