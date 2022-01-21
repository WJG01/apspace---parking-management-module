import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddResitModalPageModule } from './add-resit-modal/add-resit-modal.module';
import { ResitPageRoutingModule } from './resit-routing.module';
import { ResitPage } from './resit.page';
import { UpdateResitModalPageModule } from './update-resit-modal/update-resit-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResitPageRoutingModule,
    AddResitModalPageModule,
    UpdateResitModalPageModule
  ],
  declarations: [ResitPage]
})
export class ResitPageModule { }
