import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { NgChartsModule } from 'ng2-charts';



import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { DashboardPage } from './dashboard.page';
import { TimeParserPipe } from './time-parser.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SharedPipesModule,
    NgChartsModule,
    ReactiveFormsModule,
    DashboardPageRoutingModule
  ],
  declarations: [DashboardPage, TimeParserPipe]
})
export class DashboardPageModule { }
