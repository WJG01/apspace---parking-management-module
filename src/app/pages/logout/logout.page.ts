import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, Platform } from "@ionic/angular";

// import { NotificationService, SettingsService } from "../../services";
// import { DataCollectorService } from "../../services/data-collector.service";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    // private settings: SettingsService,
    // private notification: NotificationService,
    // private platform: Platform,
    // private dc: DataCollectorService
  ) { }

  ngOnInit() {
    // this.loadingCtrl.create({
    //   spinner: 'dots',
    //   message: 'Please wait...',
    //   translucent: true,
    // }).then(loading => {
    //   loading.present;
    //   if (this.platform.is('capacitor')) {
    //     this.notification.sendTokenOnLogout().pipe(
    //       tap(async _ => await this.dc.logout())
    //     ).
    //       subscribe(
    //       {
    //         complete: () => {
    //           this.settings.clear();
    //           this.storage.clear();
    //           this.navCtrl.navigateRoot('/login', { replaceUrl: true });
    //         },
    //         error: err => {
    //           console.error(err);
    //           this.settings.clear();
    //           this.storage.clear();
    //           this.navCtrl.navigateRoot('/login', { replaceUrl: true });
    //         }
    //       }
    //     );
    //   } else {
    //     this.settings.clear();
    //     this.storage.clear();
    //     this.navCtrl.navigateRoot('/login', { replaceUrl: true });
    //   }
    //   // destroy all cached/active views which angular router does not
    //   loading.dismiss();
    // });
  }

}
