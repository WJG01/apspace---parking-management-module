import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LibraryPageRoutingModule } from './library-routing.module';
import { LibraryPage } from './library.page';
import { DaysLeftPipe } from './days-left/days-left.pipe';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibraryPageRoutingModule,
    ComponentsModule
  ],
  declarations: [LibraryPage, DaysLeftPipe]
})
export class LibraryPageModule { }
