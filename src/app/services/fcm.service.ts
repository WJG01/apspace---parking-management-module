import { Injectable } from '@angular/core';
import { AlertButton } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token, RegistrationError } from '@capacitor/push-notifications';
import { BehaviorSubject, Observable } from 'rxjs';

import { ComponentService } from './component.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  private token: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(private component: ComponentService) { }

  async notificationListeners() {
    // Ignore for Web
    if (Capacitor.getPlatform() === 'web') return;
    // Check Device Current Permission
    const permission = await PushNotifications.checkPermissions();

    if (permission.receive !== 'granted') {
      PushNotifications.removeAllListeners();
      return;
    }
    // When app is Open
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      // TODO: Used for Testing. Need to remove before prod
      this.component.alertMessage('Push Response Received', JSON.stringify(notification), 'danger');
    });

    // Listens to when a notification is clicked
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      if (notification.notification.data) {
        // TODO: Used for Testing. Need to remove before prod
        this.component.alertMessage('Push Response Action Performed', JSON.stringify(notification.notification), 'danger');
      }
    });
  }

  async updatePushPermission() {
    // Ignore for Web
    if (Capacitor.getPlatform() === 'web') return;
    // Check Device Current Permission
    const permission = await PushNotifications.checkPermissions();
    // Request permission to receive push notifications
    const request = await PushNotifications.requestPermissions();

    switch (permission.receive) {
      case 'prompt':
        // Do nothing if push is denied by users
        if (request.receive === 'denied') return;

        if (request.receive === 'granted') {
          this.registerDevice();
        } else {
          this.component.alertMessage('Push Notifications', 'Unknown Error Occured. Please try again later!', 'danger');
        }

      case 'granted':
        this.notificationListeners();

        this.registerDevice();
        break;

      case 'denied':
        const btn: AlertButton = {
          text: 'Enable Notifications',
          cssClass: 'danger',
          handler: () => {
            NativeSettings.open({
              optionAndroid: AndroidSettings.ApplicationDetails,
              optionIOS: IOSSettings.App
            });
          }
        };
        this.component.alertMessage('Push Notifications', 'You denied access to receive Push Notifications. To use these feature, please ensure that you enable Push Notifications under your device Settings.', 'danger', '', btn);
        break;

      default:
        break;
    }
  }

  /** Get Device Token */
  async registerDevice() {
    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      this.token.next(token.value);
    });

    PushNotifications.addListener('registrationError', (err: RegistrationError) => {
      this.component.alertMessage('Push Notifications', `Error Registering Push Notification. Error: ${err.error}`, 'danger');
    });
  }

  /** Get Behaviour Subject Token */
  getToken(): Observable<string> {
    return this.token.asObservable();
  }
}
