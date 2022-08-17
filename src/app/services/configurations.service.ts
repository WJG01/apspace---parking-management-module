import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {

  private readonly version = '3.1.2'; // APSpace App Version
  private connected = true; // Has to be true initially

  constructor(private router: Router) {
    this.networkStatus();

    /**
     * Listens to Network Change
     */
    Network.addListener('networkStatusChange', status => {
      this.connected = status.connected;
    });
  }

  get logoType(): string {
    // TODO: Check this when app settings is completed
    const autoDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (autoDark) return 'assets/icon/apspace-white.svg';

    return 'assets/icon/apspace-black.svg';
  }

  get comingFromTabs(): boolean {
    if (this.router.url.split('/')[1].split('/')[0] === 'tabs') {
      return true;
    }
    return false;
  }

  /**
   * Return the current week dates
   */
  get currentWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6
    const numDay = now.getDate();

    const startWeek = new Date(now); // Current Day
    startWeek.setDate(numDay - dayOfWeek + 1); // +1 is to ensure the week starts on a Monday
    startWeek.setHours(0, 0, 0, 0);


    const endWeek = new Date(now); // Current Day
    endWeek.setDate(numDay + (7 - dayOfWeek));
    endWeek.setHours(0, 0, 0, 0);

    return { startWeek, endWeek };
  }

  /**
   * Get Current Status of Network
   */
  private async networkStatus() {
    const status = await Network.getStatus();
    this.connected = status.connected;
  }

  /** APSpace version number (ex: 4.0.0) */
  get appVersion(): string {
    return this.version;
  }

  /** Get the Internet connection status */
  get connectionStatus(): boolean {
    return this.connected;
  }

  /** Get Current Year. Usually used for Footer */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  /** Footer Text for Login and About page */
  get copyrightText(): string {
    return `&copy; ${this.currentYear} Asia Pacific University of Technology & Innovation (APU). All
    rights reserved.`;
  }
}
