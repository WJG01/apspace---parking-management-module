import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ApcardQrCodePageRoutingModule } from './apcard-qr-code-routing.module';
import { ApcardQrCodePage } from './apcard-qr-code.page';
import { DressCodeReminderModalPage } from './dress-code-reminder/dress-code-reminder-modal';
import { VisitHistoryModalPage } from './visit-history/visit-history-modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApcardQrCodePageRoutingModule
  ],
  declarations: [ApcardQrCodePage, VisitHistoryModalPage, DressCodeReminderModalPage],
  entryComponents: [VisitHistoryModalPage, DressCodeReminderModalPage]
})
export class ApcardQrCodePageModule { }
