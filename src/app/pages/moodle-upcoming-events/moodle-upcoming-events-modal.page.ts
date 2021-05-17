import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-moodle-upcoming-events-modal',
  templateUrl: './moodle-upcoming-events-modal.page.html',
  styleUrls: ['./moodle-upcoming-events-modal.page.scss'],
})
export class MoodleUpcomingEventsModalPage implements OnInit {

  moodleItem: any
  constructor(
    private modalCtrl:ModalController,
    ) { }

  ngOnInit() {
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }
}
