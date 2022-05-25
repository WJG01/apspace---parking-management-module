import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pp-delete-modal',
  templateUrl: './pp-delete-modal.component.html',
  styleUrls: ['./pp-delete-modal.component.scss'],
})
export class PpDeleteModalComponent implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onCancelClick() {
    this.modalController.dismiss({ toDelete: false });
  }

  onYesClick() {
    this.modalController.dismiss({ toDelete: true });
  }
}
