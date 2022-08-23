import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AplcProgressionPageRoutingModule } from './aplc-progression-routing.module';
import { AplcProgressionPage } from './aplc-progression.page';
import { SearchPipe } from './search/search.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AplcProgressionPageRoutingModule
  ],
  declarations: [AplcProgressionPage, SearchPipe]
})
export class AplcProgressionPageModule { }
