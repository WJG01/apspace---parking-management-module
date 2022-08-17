import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';

import { StudentPhoto } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-virtual-card-modal',
  templateUrl: './virtual-card-modal.html',
  styleUrls: ['./virtual-card-modal.scss'],
})

export class VirtualCardModalPage implements OnInit {
  studentRole: boolean;
  photo$: Observable<StudentPhoto>;
  profile: any;

  constructor(
    private navParams: NavParams,
    public modalController: ModalController,
    public commonModule: CommonModule,
    private ws: WsApiService
  ) { }

  ngOnInit() {
    this.studentRole = this.navParams.get('studentRole');
    this.photo$ = this.ws.get<StudentPhoto>('/student/photo');
  }

  cardClicked() {
    const card = document.querySelector('.virtual-card-wrapper');
    card.classList.toggle('is-flipped');
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}
