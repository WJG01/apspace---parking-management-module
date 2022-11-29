import { Component } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AlertButton, NavController, Platform } from '@ionic/angular';
import { Observable, tap } from 'rxjs';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';

import { Storage } from '@ionic/storage-angular';

import { VersionValidator } from './interfaces';
import { ComponentService, ConfigurationsService, SettingsService, WsApiService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  theme$: Observable<string>;
  accentColor$: Observable<string>;

  constructor(
    private storage: Storage,
    private config: ConfigurationsService,
    private ws: WsApiService,
    private navCtrl: NavController,
    private component: ComponentService,
    private settings: SettingsService,
    private plt: Platform
  ) {
    this.initialiseStorage();

    this.plt.ready().then(() => {
      this.accentColor$ = this.settings.get$('accentColor');
      this.theme$ = this.settings.get$('theme').pipe(
        tap(async theme => {
          if (!(Capacitor.getPlatform() === 'web')) {
            if (theme === 'dark') {
              await StatusBar.setStyle({ style: Style.Dark });
            }
            if (theme === 'light') {
              await StatusBar.setStyle({ style: Style.Light });
            }
          }
        })
      );
      this.checkForUpdate();
    });
  }

  async initialiseStorage() {
    await this.storage.create();
    // Initialise Settings
    this.settings.initSettings();
  }

  async checkForUpdate() {
    const networkConnection = await Network.getStatus();

    if (!networkConnection.connected) return;

    this.ws.get<VersionValidator>('/apspace_mandatory_update.json', { url: 'https://d370klgwtx3ftb.cloudfront.net', auth: false })
      .subscribe(res => {
        let navigationExtras: NavigationExtras;
        const currentAppVersion = this.config.appVersion;
        const currentAppPlatform = Capacitor.getPlatform();

        if (res.maintenanceMode) { // maintenance mode is on
          navigationExtras = {
            state: { forceUpdate: false }
          };
          this.navCtrl.navigateRoot(['/maintenance-and-update'], navigationExtras);
        } else { // maintenance mode is off
          navigationExtras = {
            state: { forceUpdate: true, storeUrl: '' }
          };
          if (currentAppPlatform === 'android') {
            if (res.android.minimum > currentAppVersion) { // force update
              navigationExtras.state.storeUrl = res.android.url;
              this.navCtrl.navigateRoot(['/maintenance-and-update'], navigationExtras);
            } else if (res.android.latest > currentAppVersion) { // optional update
              this.showUpdateAlert(res.android.url);
            }
          } else if (currentAppPlatform === 'ios') {
            if (res.ios.minimum > currentAppVersion) { // force update
              navigationExtras.state.storeUrl = res.ios.url;
              this.navCtrl.navigateRoot(['/maintenance-and-update'], navigationExtras);
            } else if (res.ios.latest > currentAppVersion) { // optional update
              this.showUpdateAlert(res.ios.url);
            }
          }
        }
      });
  }

  showUpdateAlert(url: string) {
    const btn: AlertButton = {
      text: 'Update',
      cssClass: 'success',
      handler: () => {
        this.component.openLink(url);
      }
    }

    this.component.alertMessage('Update Available', 'A new version of APSpace is available. Updating the app will ensure you get the latest features.', 'success', '', btn);
  }
}
