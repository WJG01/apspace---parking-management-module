import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { PrintTransactionsModalPage } from './print-transactions-modal.page';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [PrintTransactionsModalPage],
  providers: [FileOpener]
})
export class PrintTransactionsModalPageModule { }
