import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AplcProgressionPageRoutingModule } from './aplc-progression-routing.module';
import { AplcProgressionPage } from './aplc-progression.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AplcProgressionPageRoutingModule
  ],
  declarations: [AplcProgressionPage]
})
export class AplcProgressionPageModule { }
