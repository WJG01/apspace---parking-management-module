import { Component, OnInit } from '@angular/core';
import { AlertButton, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';

import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

import { ComponentService, WsApiService } from '../../services';
import { DressCodeReminderModalPage } from './dress-code-reminder/dress-code-reminder-modal';
import { VisitHistoryModalPage } from './visit-history/visit-history-modal';

@Component({
  selector: 'app-apcard-qr-code',
  templateUrl: './apcard-qr-code.page.html',
  styleUrls: ['./apcard-qr-code.page.scss'],
})
export class ApcardQrCodePage implements OnInit {

  isCapacitor: boolean;
  sending = false;

  constructor(
    private plt: Platform,
    private loadingCtrl: LoadingController,
    private ws: WsApiService,
    private component: ComponentService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.isCapacitor = this.plt.is('capacitor');

    this.scanQrCode();
  }

  async scanQrCode() {
    const allowed = await this.checkPermission();
    await BarcodeScanner.prepare();

    if (allowed) {
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        if (this.sending) {
          return;
        } else {
          this.sendRequest(result.content);
        }
      }
    }
  }

  async sendRequest(qrValue: string) {
    this.sending = true;
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    if (qrValue !== 'apu-dress-code-reminder') {
      const body = {
        id_value: qrValue,
      };
      this.ws.post('/qr_code/check_in', { body }).subscribe(
        _ => { },
        err => {
          this.component.toastMessage(`Error: ${err.error.error}`, 'danger');
          this.sending = false;
          loading.dismiss();
          BarcodeScanner.stopScan();
          this.navCtrl.back();
        },
        () => {
          loading.dismiss();
          this.component.alertMessage('QR Code Scanned', 'You have successfully scanned the QR code.');
          this.sending = false;
          BarcodeScanner.stopScan();
          this.navCtrl.back();
        }
      );
    } else {
      this.openDressCodeReminderPage();
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

  async openDressCodeReminderPage() {
    const modal = await this.modalCtrl.create({
      component: DressCodeReminderModalPage
    });
    await modal.present();
  }

  async viewHistory() {
    const modal = await this.modalCtrl.create({
      component: VisitHistoryModalPage
    });
    await modal.present();
  }
}
