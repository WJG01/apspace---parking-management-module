import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-class-code-modal',
  templateUrl: './confirm-class-code-modal.page.html',
  styleUrls: ['./confirm-class-code-modal.page.scss'],
})
export class ConfirmClassCodeModalPage {
  selectedClassCode: string;
  selectedClassType: string;

  /* input from classes page */
  classTypes: string[];
  classCodes: {value: string, matches: number }[];

  constructor(
    private modalCtrl: ModalController,
  ) { }

  done() {
    this.modalCtrl.dismiss({ code: this.selectedClassCode, type: this.selectedClassType });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
