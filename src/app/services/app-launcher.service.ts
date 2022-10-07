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

  chatInTeams(personID: string) {
    let webUrl: string;
    let username: string;
    const androidSchemeUrl = 'com.microsoft.teams';
    const iosSchemeUrl = 'microsoft-teams://';

    if (personID.startsWith('TP')) {
      webUrl = `https://teams.microsoft.com/l/chat/0/0?users=${personID}@mail.apu.edu.my`;
    }
    else {
      webUrl = `https://teams.microsoft.com/l/chat/0/0?users=${personID}@staffemail.apu.edu.my`;
    }

    const appStoreUrl = 'https://itunes.apple.com/us/app/microsoft-teams/id1113153706?mt=8';
    const appViewUrl = 'https://teams.microsoft.com/l/chat/0/0?users=';
    // tslint:disable-next-line: max-line-length
    const playStoreUrl = `https://play.google.com/store/apps/details?id=com.microsoft.teams&hl=en&referrer=utm_source%3Dgoogle%26utm_medium%3Dorganic%26utm_term%3D'com.microsoft.teams'&pcampaignid=APPU_1_NtLTXJaHKYr9vASjs6WwAg`;

    if (personID.startsWith('TP')) {
      username = '${personID}@mail.apu.edu.my';
    }
    else {
      username = '${personID}@staffemail.apu.edu.my';
    }

    this.launchExternalApp(
      iosSchemeUrl,
      androidSchemeUrl,
      appViewUrl,
      webUrl,
      appStoreUrl,
      playStoreUrl,
      username
    );
  }
}
