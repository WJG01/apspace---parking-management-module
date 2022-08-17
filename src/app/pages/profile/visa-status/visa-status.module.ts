import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisaStatusPageRoutingModule } from './visa-status-routing.module';

import { VisaStatusPage } from './visa-status.page';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        VisaStatusPageRoutingModule,
        ComponentsModule
    ],
  declarations: [VisaStatusPage]
})
export class VisaStatusPageModule {}
