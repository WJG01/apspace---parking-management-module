import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-moodle-events-modal',
  templateUrl: './moodle-events-modal.page.html',
  styleUrls: ['./moodle-events-modal.page.scss'],
})
export class MoodleEventsModalPage implements OnInit {

  moodleItem: any
  constructor(
    private modalCtrl:ModalController,
    ) { }

  ngOnInit() {
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

  checkDescription(item){
    if (item.description == "" || item.description == null){
      return false;
    }
    return true;
  }
}
