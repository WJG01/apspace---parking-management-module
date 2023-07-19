/* eslint-disable max-len */
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertButton, AlertController, Platform } from '@ionic/angular';

import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

import { ComponentService, SettingsService } from '../../services';
import { UpdateAttendanceGQL } from '../../../generated/graphql';
import { BookParkingService } from 'src/app/services/parking-book.service';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-parking-checkin',
  templateUrl: './parking-checkin.page.html',
  styleUrls: ['./parking-checkin.page.scss'],
})
export class ParkingCheckinPage implements OnInit {

  digits = new Array(3);
  @ViewChild('otpInput') otpInput: ElementRef<HTMLInputElement>;
  isCapacitor: boolean;
  scan = false;
  sending = false;
  //updateAttendance: UpdateAttendanceGQL; // Declare the property

  currentLoginUserID = '';

  constructor(
    //private updateAttendance: UpdateAttendanceGQL,
    private location: Location,
    public alertCtrl: AlertController,
    public plt: Platform,
    private component: ComponentService,
    private settings: SettingsService,
    private bookps: BookParkingService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.getUserData();
    this.isCapacitor = this.plt.is('capacitor');
    // first run and if scan is selected
    if (this.isCapacitor && this.settings.get('scan') !== false) {
      this.swapMode();
    }

    //console.log('Current Booking', this.getCurrentBookingRecord());
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
            this.checkin(result.content);
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
        this.checkin(otp).then(() => this.clear(el));
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

  getCurrentBookingRecord(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      //const todayDate = new Date('2023-07-20T12:23'); // Hardcoded current date and time for testing
      const todayDate = new Date();

      this.bookps.getAllBookedParkings().subscribe(
        (response: any) => {
          const matchingBooking = response.selectParkingResponse.find((booking: any) => {
            const bookingStartDate = new Date(`${booking.parkingdate}T${booking.starttime}`);
            const bookingEndDate = new Date(`${booking.parkingdate}T${booking.endtime}`);

            // Subtract 10 minutes from the booking start date and time
            const bookingStartDateMinus10Mins = new Date(bookingStartDate.getTime() - 10 * 60 * 1000);

            // Check if the current date and time falls between the booking start date and time,
            // or is within 10 minutes earlier than the start date and time
            return (
              todayDate >= bookingStartDateMinus10Mins &&
              todayDate <= bookingEndDate &&
              booking.userid === this.currentLoginUserID &&
              booking.parkingstatus === 'BOOKED'
            );
          });

          if (matchingBooking) {
            console.log('Matching booking:', matchingBooking);
            resolve(matchingBooking);
          } else {
            console.log('No matching booking found.');
            resolve(null);
          }
        },
        (error: any) => {
          console.log('Error retrieving booked parkings:', error);
          reject(error);
        }
      );
    });
  }


  async checkin(otp: string): Promise<void> {
    console.assert(otp.length === this.digits.length);
    this.sending = true;

    try {
      const foundParking = await this.getCurrentBookingRecord();

      if (foundParking != null && otp === foundParking.checkincode) {

        const body = {
          parkingstatus: 'CHECKIN'
        };
        const headers = { 'Content-Type': 'application/json' };

        this.bookps.updateParkingBooking(foundParking.APQParkingID, body, headers).subscribe(
          (response: any) => {
            console.log('Update Response', response);
            this.component.alertMessage('Parking Check-In', 'Successfully checked in for parking   ' + foundParking.parkinglocation + '- ' + foundParking.parkingspotid, 'success');
            this.component.successHaptic();
            //this.location.back();
          },
          (error: any) => {
            console.log('Update Error', error);
            this.component.alertMessage('Parking Check-In Failed', 'Failed to update parking status.', 'danger');
            this.component.errorHaptic();
          },
          () => {
            this.sending = false;
          }
        );

      } else {
        // Handle the case when the OTP is invalid or no matching booking is found
        console.log('Invalid OTP or no matching booking found.');
        this.component.alertMessage('Error', 'Invalid OTP or no matching booking found.', 'danger');
      }
    } catch (error) {
      // Handle the error case
      console.log('Error getting current booking:', error);
    } finally {
      this.sending = false;
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
