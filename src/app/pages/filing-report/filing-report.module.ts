import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FilingReportPageRoutingModule } from './filing-report-routing.module';
import { FilingReportPage } from './filing-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilingReportPageRoutingModule
  ],
  declarations: [FilingReportPage]
})
export class FilingReportPageModule {}
