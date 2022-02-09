import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { ApcardPage } from './apcard.page';
import { PrintTransactionsModalPage } from './print-transactions-modal/print-transactions-modal';
import { TimeRefresherPipe } from './time-refresher/time-refresher.pipe';

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
    FormsModule,
    SharedPipesModule,
    ReactiveFormsModule
  ],
  declarations: [ApcardPage, PrintTransactionsModalPage, TimeRefresherPipe],
})
export class ApcardPageModule { }
