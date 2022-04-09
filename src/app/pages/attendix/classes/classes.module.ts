import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ClassesPageRoutingModule } from './classes-routing.module';
import { ClassesPage } from './classes.page';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ClassesPage],
  providers: [DatePipe]
})
export class ClassesPageModule { }
