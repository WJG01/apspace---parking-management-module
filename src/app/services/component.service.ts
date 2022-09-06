import { Injectable } from '@angular/core';
import { AlertButton, AlertController, ToastController } from '@ionic/angular';

import { Browser } from '@capacitor/browser';
import { Haptics, NotificationType } from '@capacitor/haptics';

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

  /**
   * Present Toast Message
   * @param message message content
   * @param color color of toast (ex. success, warning, danger, medium)
   */
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

  /**
   * Present Alert Message
   * @param header alert header title
   * @param message alert message content
   * @param cancelText cancel button text (Default is Dismiss)
   * @param button extra action button
   * @param cssClass alert css class
   */
  async alertMessage(header: string, message: string, cancelText?: string, button?: AlertButton, cssClass?: string) {
    const buttons: AlertButton[] = [{
      text: cancelText ? cancelText : 'Dismiss',
      role: 'cancel',
      cssClass: 'cancel'
    }];

    if (button) {
      buttons.push(button);
    }

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons,
      cssClass: cssClass ? cssClass : '',
    });
    await alert.present();
  }

  /**
   * Open external links using In-App Browser
   * @param url link to open with IAP
   */
  async openLink(url: string) {
    if (!this.config.connectionStatus) {
      return this.toastMessage('External links cannot be opened in offline mode. Please ensure you have a network connection and try again.', 'danger');
    }
    await Browser.open({ url });
  }

  /** A haptic feedback type to indicate a task has completed successfully */
  successHaptic() {
    Haptics.notification({ type: NotificationType.Success });
  }

  /** A haptic feedback type to indicate a task has failed */
  errorHaptic() {
    Haptics.notification({ type: NotificationType.Error });
  }
}
