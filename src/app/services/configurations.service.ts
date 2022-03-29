import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {

  private readonly version = '3.1.2'; // APSpace App Version
  connected = true; // Has to be true initially

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
    startWeek.setDate(numDay - dayOfWeek);
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

  // TODO: Remove this function once the new settings have been implemented
  getMockSettings() {
    return {
      tripFrom: '',
      tripTo: '',
      intakeHistory: [],
      viewWeek: false,
      modulesBlacklist: [],
      intakeGroup: null,
      examIntake: null,
      defaultCampus: '',
      defaultVenue: '',
      scan: false,
      favoriteItems: [
        'classroom-finder',
        'e-forms',
        'fees',
        'iconsult-staff',
        'iconsult-student',
        'monthly-returns',
        'moodle',
        'my-reports-panel',
        'news-feed',
        'notifications',
        'profile',
        'results',
        'staff-directory',
      ],
      theme: '',
      accentColor: 'blue',
      dashboardSections: [],
      menuUI: 'cards',
      disableShakespear: false,
      shakeSensitivity: 40,
      hideProfilePicture: false,
      enableMalaysiaTimezone: false, // TODO: update variable name (it should be disableMalaysianTimezone)
      timeFormat: '12',
      busFirstLocation: '',
      busSecondLocation: '',
      userProfileName: [],
      changedName: false,
      tourGuideSeen: false
    };
  }

  /** APSpace version number (ex: 4.0.0) */
  get appVersion(): string {
    return this.version;
  }
}
