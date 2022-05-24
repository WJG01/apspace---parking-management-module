import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PpComponentsModule } from './components/components.module';
import { PeoplepulsePageRoutingModule } from './peoplepulse-routing.module';
import { PeoplepulsePage } from './peoplepulse.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PeoplepulsePageRoutingModule,
    PpComponentsModule,
  ],
  declarations: [PeoplepulsePage],
})
export class PeoplepulsePageModule {}
