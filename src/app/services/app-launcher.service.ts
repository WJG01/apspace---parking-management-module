import { Injectable } from '@angular/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';

import { ComponentService } from './component.service';

@Injectable({
  providedIn: 'root'
})
export class AppLauncherService {

  constructor(private component: ComponentService) { }

  async chatInTeams(userEmail: string) {
    // Native Scheme
    const androidSchemeUrl = 'com.microsoft.teams';
    const iosSchemeUrl = 'msteams://';
    // Web URL
    const webUrl = `https://teams.microsoft.com/l/chat/0/0?users=${userEmail}`;
    // Native Platform Url
    const appStoreUrl = 'https://itunes.apple.com/us/app/microsoft-teams/id1113153706?mt=8';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.microsoft.teams';
    // Get Platform
    const platform = Capacitor.getPlatform().toLowerCase();
    // Download url when Teams is not installed
    const downloadUrl = platform === 'android' ? playStoreUrl : appStoreUrl;
    // Scheme Used to open Teams
    const openUrl = platform === 'android' ? androidSchemeUrl : iosSchemeUrl;

    if (platform === 'web') {
      return this.component.openLink(webUrl);
    }

    const appLauncher = await AppLauncher.openUrl({ url: openUrl });

    if (appLauncher.completed) return;

    this.component.openLink(downloadUrl);
  }
}
