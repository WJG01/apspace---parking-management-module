import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-checkin-otpmodal',
  templateUrl: './checkin-otpmodal.page.html',
  styleUrls: ['./checkin-otpmodal.page.scss'],
})
export class CheckinOTPModalPage implements OnInit {

  @Input() parkingRecord: any;

  constructor(
    private modalController: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log(this.parkingRecord);
  }


  dismissModal() {
    this.modalController.dismiss();
  }

  goToCheckIn() {
    this.dismissModal();
    const parkingRecordJSON = JSON.stringify(this.parkingRecord);
    this.router.navigate(['/parking-checkin'], {
      queryParams: { parkingRecord: parkingRecordJSON }
    });
  }
}
