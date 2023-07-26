/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable max-len */
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertButton, AlertController, LoadingController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

import { catchError, EMPTY, finalize, firstValueFrom, tap } from 'rxjs';

import { SubscriptionResult } from 'apollo-angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

import { ComponentService, SettingsService } from '../../services';
import { UpdateAttendanceGQL, UpdateAttendanceMutation } from '../../../generated/graphql';
import { BookParkingService } from 'src/app/services/parking-book.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-parking-checkin',
  templateUrl: './parking-checkin.page.html',
  styleUrls: ['./parking-checkin.page.scss'],
})
export class ParkingCheckinPage implements OnInit {

  loading: HTMLIonLoadingElement;
  digits = new Array(3);
  @ViewChild('otpInput') otpInput: ElementRef<HTMLInputElement>;
  isCapacitor: boolean;
  scan = false;
  sending = false;
  currentLoginUserID = '';
  parkingRecord: any;


  constructor(
    //private updateAttendance: UpdateAttendanceGQL,
    private location: Location,
    public alertCtrl: AlertController,
    private route: ActivatedRoute,
    public plt: Platform,
    private component: ComponentService,
    private settings: SettingsService,
    private bookps: BookParkingService,
    private storage: Storage,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const parkingRecordJSON = params['parkingRecord'];
      this.parkingRecord = JSON.parse(parkingRecordJSON);
      console.log(this.parkingRecord);
    });
    this.getUserData();
    this.isCapacitor = this.plt.is('capacitor');
    // first run and if scan is selected
    if (this.isCapacitor && this.settings.get('scan') !== false) {
      this.swapMode();
    }
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
      console.log('Current User is ', this.currentLoginUserID);
    }
  }

  ionViewDidEnter() {
    this.otpInput.nativeElement.focus();
  }

  /** Swap mode between auto scan and manual input. */
  async swapMode() {
    this.scan = !this.scan;
    this.settings.set('scan', this.scan);
    if (this.scan) {
      const allowed = await this.checkPermission();
      await BarcodeScanner.prepare();

      if (allowed) {
        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          if (this.sending) {
            return;
          } else if (result.content.length === this.digits.length) {
            this.sendOtp(result.content);
          } else {
            this.component.alertMessage('Invalid OTP', `Invalid OTP. Code should only be ${this.digits.length} digits`, 'danger');
          }
        }
      }
    } else {
      BarcodeScanner.stopScan();
    }
  }

  onKey(ev: KeyboardEvent) {
    const el = ev.target as HTMLInputElement;
    // do not process key when sending (ignore key spamming)
    if (this.sending) {
      // prevent double input for last input on older browsers
      el.value = el.value.slice(0, 1);
      return false;
    }
    // ev.key not usable in UC browser fallback
    // get the value from element instead of event
    if ('0' <= el.value && el.value <= '9') {
      if (el.nextElementSibling) {
        (el.nextElementSibling as HTMLInputElement).focus();
      } else {
        let otp = '';
        for (let prev = el; prev != null; prev = prev.previousElementSibling as HTMLInputElement) {
          otp = prev.value + otp;
        }
        this.sendOtp(otp).then(() => this.clear(el));
      }
    } else if (ev.key === 'Backspace') {
      if (ev.type === 'keyup') { // ignore backspace on keyup
        return true;
      } else if (!el.nextElementSibling && el.value) { // last input not empty
        el.value = '';
      } else {
        const prev = el.previousSibling as HTMLInputElement;
        prev.value = '';
        prev.focus();
      }
    } else { // invalid character not handled by older browsers html
      el.value = '';
    }
    // prevent change to value
    return '0' <= ev.key && ev.key <= '9' && el.value.length === 0;
  }

  /** Send OTP. */
  async sendOtp(otp: string) {

    this.presentLoading();
    const body = {
      userid: this.currentLoginUserID,
      parkingstatus: 'CHECKIN',
      checkincode: otp
    };
    const headers = { 'Content-Type': 'application/json' };

    console.log('HELLO checking', this.parkingRecord);

    this.bookps.updateParkingBooking(this.parkingRecord.APQParkingID, body, headers).subscribe((response) => {
      if (response.statusCode === 200) {
        this.dismissLoading();
        this.component.alertMessage('Parking Check-In', `Successfully check-in parking spot. ${this.parkingRecord.parkinglocation} - ${this.parkingRecord.parkingspotid}`, 'success');
        this.component.successHaptic();
        //this.location.back();
        console.log(response);
      } else {
        this.dismissLoading();
        this.component.alertMessage('Parking Check-In Failed', `Failed to check in. ${response.body}`, 'danger');
        this.component.errorHaptic();
        console.error(response.body);
      }
      this.sending = false;

    });
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 20000,
      message: 'Loading ...',
      translucent: true,
      animated: true
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      return await this.loading.dismiss();
    }
  }


  /** Clear otp value. */
  clear(el: HTMLInputElement) {
    el.value = '';
    for (let prev = el; prev != null; prev = prev.previousElementSibling as HTMLInputElement) {
      prev.value = '';
      prev.focus();
    }
  }

  /** Check & Handle Permission Accordingly */
  async checkPermission(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const btn: AlertButton = {
          text: 'Open Settings',
          cssClass: 'danger',
          handler: () => {
            BarcodeScanner.openAppSettings();
          }
        };

        this.component.alertMessage('Permission Denied', 'You denied access to your camera. To scan the Attendance Code, you will need to grant access to camera.', 'danger', 'Cancel', btn);
      } else {
        resolve(false);
      }
    });
  }

  ngOnDestroy() {
    // stop scan mode
    if (this.isCapacitor && this.scan) {
      this.swapMode();
    }
  }
}
