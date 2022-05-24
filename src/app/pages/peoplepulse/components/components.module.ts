import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PpDeleteModalComponent } from './pp-delete-modal/pp-delete-modal.component';
import { PpEditModalComponent } from './pp-edit-modal/pp-edit-modal.component';
import { PpFilterComponent } from './pp-filter/pp-filter.component';
import { PpHomeNavbarComponent } from './pp-home-navbar/pp-home-navbar.component';
import { PpMobileSearchbarComponent } from './pp-mobile-searchbar/pp-mobile-searchbar.component';
import { PpPlusButtonComponent } from './pp-plus-button/pp-plus-button.component';
import { PpPostComponent } from './pp-post/pp-post.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [
    PpFilterComponent,
    PpHomeNavbarComponent,
    PpMobileSearchbarComponent,
    PpPlusButtonComponent,
    PpPostComponent,
    PpDeleteModalComponent,
    PpEditModalComponent,
  ],
  exports: [
    PpFilterComponent,
    PpHomeNavbarComponent,
    PpMobileSearchbarComponent,
    PpPlusButtonComponent,
    PpPostComponent,
    PpDeleteModalComponent,
    PpEditModalComponent,
  ],
})
export class PpComponentsModule {}
