import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { ShortNews } from '../../../interfaces';

@Component({
  selector: 'app-news-details-modal',
  templateUrl: './news-details-modal.page.html',
  styleUrls: ['./news-details-modal.page.scss'],
})
export class NewsDetailsModalPage {

  @Input() newsItem: ShortNews

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
