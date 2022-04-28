import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NgChartsModule } from 'ng2-charts';

import { ResultsPageRoutingModule } from './results-routing.module';
import { ResultsPage } from './results.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultsPageRoutingModule,
    ComponentsModule,
    NgChartsModule
  ],
  declarations: [ResultsPage]
})
export class ResultsPageModule { }
