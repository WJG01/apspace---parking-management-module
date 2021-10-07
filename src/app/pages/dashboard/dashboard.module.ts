import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChartModule } from 'angular2-chartjs';
import {JoyrideModule} from 'ngx-joyride';

import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { DashboardPage } from './dashboard.page';
import { DisabledPipe } from './disabled.pipe';
import { SectionNamePipe } from './section-name.pipe';
import { TimeParserPipe } from './time-parser.pipe';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        ChartModule,
        SharedPipesModule,
        JoyrideModule.forChild()
    ],
  declarations: [DashboardPage, DisabledPipe, SectionNamePipe, TimeParserPipe],
})
export class DashboardPageModule {}
