import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ApcardPageRoutingModule } from './apcard-routing.module';
import { ApcardPage } from './apcard.page';
import { TimeRefresherPipe } from './time-refresher/time-refresher.pipe';
import { PrintTransactionsModalPageModule } from './print-transactions-modal/print-transactions-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApcardPageRoutingModule,
    PrintTransactionsModalPageModule
  ],
  declarations: [ApcardPage, TimeRefresherPipe]
})
export class ApcardPageModule { }
