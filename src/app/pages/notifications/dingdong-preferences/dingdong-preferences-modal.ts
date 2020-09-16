import { Component } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NotificationStatus } from 'src/app/interfaces/notification';
import { NotificationService } from 'src/app/services';

@Component({
  selector: 'app-dingdong-preferences',
  templateUrl: './dingdong-preferences-modal.html',
  styleUrls: ['./dingdong-preferences-modal.scss'],
})
export class DingdongPreferencesModalPage {

  isProcessing = false;
  isSubscribed = true; // Most of the students are subscribed so why not? Let's save some mem.
  message: string;

  status$: Observable<NotificationStatus>;

  constructor(
    private toastCtrl: ToastController,
    private dingdong: NotificationService,
    private modalCtrl: ModalController,
  ){}

  ionViewDidEnter() {
    this.status$ = this.dingdong.getSubscription()
      .pipe(
        tap(r => this.changeState(r.active))
      );
  }

  async sendToast(msg: string, success: true | false = true) {
    await this.toastCtrl.create({
      message: msg,
      position: 'top',
      color: success ? 'success' : 'danger',
      duration: 3000,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ],
    }).then((toast) => toast.present());
  }

  changeState(value: boolean) {
    this.message = value
      ? 'By unsubscribing, you will no longer receive any future updates from us in your personal email.'
      : 'By subscribing, you will receive any future updates from us in your personal email.';
    this.isSubscribed = value;
  }

  onUnsubscribe() {
    this.isProcessing = true;
    this.dingdong.doUnsubscribe().subscribe(
      {
        next: (data) => {
          if (data.msg === 'success') {
            this.changeState(false); // Success! Change status to unsubscribed
            this.sendToast('Done! Successfully unsubscribed from Emails.');
          } else {
            this.sendToast('Aww! Unable to unsubscribed from Emails.', false);
          }
        },
        complete: () => {
          this.isProcessing = false;
        },
        error: () => {
          this.isProcessing = false;
        }
      }
    );
  }

  onSubscribe() {
    this.isProcessing = true;
    this.dingdong.doSubscribe().subscribe(
      {
        next: (data) => {
          if (data.msg === 'success') {
            this.changeState(true); // Success! Change status to subscribed
            this.sendToast('Done! Successfully subscribed to Emails.');
          } else {
            // Do not change state & send toast
            this.sendToast('Aww! Unable to subscribe to Emails.', false);
          }
        },
        complete: () => {
          this.isProcessing = false;
        },
        error: () => {
          this.isProcessing = false;
        }
      }
    );
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
