import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SharedPipesModule } from '../shared/shared-pipes.module';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { PpDeleteModalComponent } from './pp-post/pp-delete-modal/pp-delete-modal.component';
import { PpEditModalComponent } from './pp-post/pp-edit-modal/pp-edit-modal.component';
import { PpPostComponent } from './pp-post/pp-post.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { StaysafeComponent } from './staysafe/staysafe.component';

@NgModule({
  declarations: [
    SearchModalComponent,
    LoadingSpinnerComponent,
    MessageWithSvgComponent,
    StaysafeComponent,
    PpPostComponent,
    PpEditModalComponent,
    PpDeleteModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    SharedPipesModule,
  ],
  exports: [
    SearchModalComponent,
    LoadingSpinnerComponent,
    MessageWithSvgComponent,
    StaysafeComponent,
    PpPostComponent,
  ],
})
export class ComponentsModule { }
