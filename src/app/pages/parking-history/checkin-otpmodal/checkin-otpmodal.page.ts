import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-checkin-otpmodal',
  templateUrl: './checkin-otpmodal.page.html',
  styleUrls: ['./checkin-otpmodal.page.scss'],
})
export class CheckinOTPModalPage implements OnInit {

  @Input() otp: string;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }


  dismissModal() {
    this.modalController.dismiss();
  }
}
