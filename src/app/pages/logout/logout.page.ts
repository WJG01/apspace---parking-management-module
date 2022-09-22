import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { DataCollectorService, NotificationService, SettingsService } from '../../services';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    private settings: SettingsService,
    private notification: NotificationService,
    private plt: Platform,
    private dc: DataCollectorService
  ) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    if (this.plt.is('capacitor')) {
      this.notification.sendTokenOnLogout().pipe(
        tap(async () => await this.dc.logout())
      ).subscribe({
        error: (err) => {
          console.error(err);
          this.settings.clear();
          this.storage.clear();
          this.navCtrl.navigateRoot('/login', { replaceUrl: true });
        },
        complete: () => {
          this.settings.clear();
          this.storage.clear();
          this.navCtrl.navigateRoot('/login', { replaceUrl: true });
        }
      });
    } else {
      this.settings.clear();
      this.storage.clear();
      this.navCtrl.navigateRoot('/login', { replaceUrl: true });
    }
    // Dismiss all loading
    loading.dismiss();
  }
}
