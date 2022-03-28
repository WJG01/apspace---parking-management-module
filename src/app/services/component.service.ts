import { Injectable } from '@angular/core';
import { AlertButton, AlertController, ToastController } from '@ionic/angular';

import { Browser } from '@capacitor/browser';

import { ConfigurationsService } from './configurations.service';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private config: ConfigurationsService
  ) { }

  async toastMessage(message: string, color: 'success' | 'warning' | 'danger' | 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      position: 'top',
      duration: 3000,
      animated: true,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async alertMessage(header: string, message: string, cancelText?: string, button?: AlertButton) {
    const buttons: AlertButton[] = [{
      text: cancelText ? cancelText : 'Dismiss',
      role: 'cancel'
    }];

    if (button) {
      buttons.push(button);
    }

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons
    });
    await alert.present();
  }

  async openLink(url: string) {
    if (!this.config.connected) {
      return this.toastMessage('External links cannot be opened in offline mode. Please ensure you have a network connection and try again.', 'danger');
    }
    await Browser.open({ url });
  }
}
