import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SharedPipesModule } from '../shared/shared-pipes.module';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { StaysafeComponent } from './staysafe/staysafe.component';

@NgModule({
  declarations: [
    SearchModalComponent,
    LoadingSpinnerComponent,
    MessageWithSvgComponent,
    StaysafeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    SharedPipesModule
  ],
  exports: [
    SearchModalComponent,
    LoadingSpinnerComponent,
    MessageWithSvgComponent,
    StaysafeComponent
  ],
})
export class ComponentsModule { }
