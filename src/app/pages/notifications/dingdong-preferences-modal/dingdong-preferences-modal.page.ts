import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoadingController, ModalController } from '@ionic/angular';

import { ComponentService, NotificationService } from '../../../services';
import { NotificationStatus } from '../../../interfaces';

@Component({
  selector: 'app-dingdong-preferences-modal',
  templateUrl: './dingdong-preferences-modal.page.html',
  styleUrls: ['./dingdong-preferences-modal.page.scss'],
})
export class DingdongPreferencesModalPage implements OnInit {

  status$: Observable<NotificationStatus>;
  active: boolean;

  constructor(
    private notification: NotificationService,
    private modalCtrl: ModalController,
    private component: ComponentService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.status$ = this.notification.getSubscription().pipe(
      tap(r => this.active = r.active)
    );
  }

  async changePreference() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    if (this.active) {
      this.notification.unsubscribe().subscribe({
        next: (res) => {
          loading.dismiss();
          if (res.msg === 'success') {
            this.component.toastMessage('Successfully unsubscribed from Emails.', 'success');
            this.dismiss();
          } else {
            this.component.toastMessage('Oh no! Unable to unsubscribed from Emails.', 'danger');
            this.dismiss();
          }
        }
      });
    } else {
      this.notification.subscribe().subscribe({
        next: (res) => {
          loading.dismiss();
          if (res.msg === 'success') {
            this.component.toastMessage('Successfully subscribed to Emails.', 'success');
            this.dismiss();
          } else {
            this.component.toastMessage('Oh no! Unable to subscribe to Emails.', 'danger');
            this.dismiss();
          }
        }
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
