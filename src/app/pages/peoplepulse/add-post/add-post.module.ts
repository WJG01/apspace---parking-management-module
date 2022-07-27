import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StaffDirectoryModule } from 'src/app/components/staff-directory/staff-directory.module';
import { AddPostPageRoutingModule } from './add-post-routing.module';
import { AddPostPage } from './add-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPostPageRoutingModule,
    StaffDirectoryModule,
  ],
  declarations: [AddPostPage],
})
export class AddPostPageModule {}
