import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ClassroomFinderPageRoutingModule } from './classroom-finder-routing.module';
import { ClassroomFinderPage } from './classroom-finder.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassroomFinderPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ClassroomFinderPage]
})
export class ClassroomFinderPageModule { }
