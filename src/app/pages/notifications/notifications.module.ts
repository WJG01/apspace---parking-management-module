import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsPage } from './notifications.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { NotificationDetailsModalPageModule } from './notification-details-modal/notification-details-modal.module';
import { DingdongPreferencesModalPageModule } from './dingdong-preferences-modal/dingdong-preferences-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    SharedPipesModule,
    NotificationDetailsModalPageModule,
    DingdongPreferencesModalPageModule
  ],
  declarations: [NotificationsPage]
})
export class NotificationsPageModule { }
