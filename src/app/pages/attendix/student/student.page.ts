import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertButton, AlertController, Platform } from '@ionic/angular';
import { catchError, EMPTY, finalize, firstValueFrom, tap } from 'rxjs';

import { SubscriptionResult } from 'apollo-angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

import { ComponentService, ConfigurationsService } from '../../../services';
import { UpdateAttendanceGQL, UpdateAttendanceMutation } from '../../../../generated/graphql';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
})
export class StudentPage implements OnInit {

  digits = new Array(3);
  @ViewChild('otpInput') otpInput: ElementRef<HTMLInputElement>;
  isCapacitor: boolean;
  scan = false;
  sending = false;

  constructor(
    private updateAttendance: UpdateAttendanceGQL,
    private location: Location,
    public alertCtrl: AlertController,
    public plt: Platform,
    private config: ConfigurationsService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.isCapacitor = this.plt.is('capacitor');
    // first run and if scan is selected
    // TODO: Remove Mock Settings
    if (this.isCapacitor && this.config.getMockSettings().scan) {
      this.swapMode();
    }
  }

  ionViewDidEnter() {
    this.otpInput.nativeElement.focus();
  }

  /** Swap mode between auto scan and manual input. */
  async swapMode() {
    this.scan = !this.scan;
    // this.settings.set('scan', this.scan = !this.scan); // TODO: Enable this back
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
            this.component.alertMessage('Invalid OTP', `Invalid OTP. Code should only be ${this.digits.length} digits`);
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
  sendOtp(otp: string): Promise<SubscriptionResult<UpdateAttendanceMutation>> {
    console.assert(otp.length === this.digits.length);
    this.sending = true;
    return firstValueFrom(this.updateAttendance.mutate({ otp }).pipe(
      tap(d => {
        this.component.alertMessage('Attendance Updated', 'Sucessfully updated your attendance.');
        this.component.successHaptic();
        this.location.back();
        console.log(d);
      }),
      catchError(err => {
        this.component.alertMessage('Attendance Failed', `Failed to update attendance. ${err.message.replace('GraphQL error: ', '')}`);
        this.component.errorHaptic();
        console.error(err);
        return EMPTY;
      }),
      finalize(() => this.sending = false),
    ));
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
        resolve(true)
      } else if (status.denied) {
        const btn: AlertButton = {
          text: 'Open Settings',
          handler: () => {
            BarcodeScanner.openAppSettings();
          }
        };

        this.component.alertMessage('Permission Denied', 'You denied access to your camera. To scan the Attendance Code, you will need to grant access to camera.', 'Cancel', btn);
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
