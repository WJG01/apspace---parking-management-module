import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { PeoplepulsePageRoutingModule } from './peoplepulse-routing.module';
import { PeoplepulsePage } from './peoplepulse.page';
import { PpFilterModalComponent } from './pp-filter-modal/pp-filter-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PeoplepulsePageRoutingModule,
    ComponentsModule,
  ],
  declarations: [PeoplepulsePage, PpFilterModalComponent],
})
export class PeoplepulsePageModule {}
