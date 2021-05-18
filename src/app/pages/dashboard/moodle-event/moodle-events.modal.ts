import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MoodleEvent } from 'src/app/interfaces';

@Component({
  selector: 'app-moodle-event',
  templateUrl: './moodle-events.modal.html',
  styleUrls: ['./moodle-events.modal.scss'],
})
export class MoodleEventsModal {

  moodleItem: MoodleEvent
  constructor(
    private modalCtrl:ModalController,
    ) { }

  dismiss(){
    this.modalCtrl.dismiss();
  }
}
