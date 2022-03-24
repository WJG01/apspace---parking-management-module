import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { NotificationBody } from '../../../interfaces';

@Component({
  selector: 'app-notification-details-modal',
  templateUrl: './notification-details-modal.page.html',
  styleUrls: ['./notification-details-modal.page.scss'],
})
export class NotificationDetailsModalPage {

  @Input() message: NotificationBody;

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
