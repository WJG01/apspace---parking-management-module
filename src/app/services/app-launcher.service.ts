import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AppAvailability } from '@awesome-cordova-plugins/app-availability/ngx';

import { ComponentService } from './component.service';

declare var detectBrowser;

@Injectable({
  providedIn: 'root'
})
export class AppLauncherService {

  constructor(
    private plt: Platform,
    private appAvailability: AppAvailability,
    private component: ComponentService
  ) { }

  getPlatform(): string {
    let platform: string;
    if (this.plt.platforms().find(ele => ele === 'core')) {
      platform = detectBrowser();
    } else if (this.plt.platforms().find(ele => ele === 'android')) {
      platform = 'Android';
    } else if (this.plt.platforms().find(ele => ele === 'ios')) {
      platform = 'iOS';
    } else if (this.plt.platforms().find(ele => ele === 'windows')) {
      platform = 'Window Mobile';
    } else {
      platform = this.plt.platforms().toString();
    }
    return platform;
  }

  launchExternalApp(
    iosSchemaName: string,
    androidPackageName: string,
    appViewUrl: string,
    httpUrl: string,
    playStoreUrl: string,
    appStoreUrl: string,
    username: string
  ) {
    // window.location.href = 'msteams://'
    let app: string;
    if (this.getPlatform() === 'iOS') {
      app = iosSchemaName;
    } else if (this.getPlatform() === 'Android') {
      app = androidPackageName;
    } else { // WEB
      this.component.openLink(httpUrl);
      return;
    }
    this.appAvailability.check(app).then(
      () => { // APP INSTALLED
        window.location.href = `${appViewUrl + username}`;
      },
      () => { // APP IS NOT INSTALLED
        if (this.getPlatform() === 'Android') {
          this.component.openLink(playStoreUrl);
        } else if (this.getPlatform() === 'iOS') {
          this.component.openLink(appStoreUrl);
        }
      }
    );
  }

}
