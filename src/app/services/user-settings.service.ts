import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  activeAccentColor = 'blue-accent-color';
  private darkTheme: BehaviorSubject<boolean>;
  private pureDarkTheme: BehaviorSubject<boolean>;
  private accentColor: BehaviorSubject<string>;

  accentColors = [
    { name: 'red-accent-color', value: '#e54d42', rgbaValues: '229, 77, 66' },
    { name: 'yellow-accent-color', value: '#DFA847', rgbaValues: '223, 168, 71' },
    { name: 'blue-accent-color', value: '#3A99D9', rgbaValues: '58, 153, 217' },
    { name: 'green-accent-color', value: '#08a14f', rgbaValues: '8, 161, 79' },
    { name: 'red-accent-color', value: '#ec2a4d', rgbaValues: '236, 42, 77' },
    { name: 'white-accent-color', value: '#b0acac', rgbaValues: '175, 175, 175' }
  ];

  constructor(
    private storage: Storage,
    public statusBar: StatusBar,
    private platform: Platform
  ) {
    this.darkTheme = new BehaviorSubject(false);
    this.pureDarkTheme = new BehaviorSubject(false);
    this.accentColor = new BehaviorSubject('blue-accent-color');
  }

  // DARK THEME
  toggleDarkTheme(val: boolean) {
    this.storage.set('dark-theme', val);
    this.darkTheme.next(val);
  }

  darkThemeActivated() {
    return this.darkTheme.asObservable();
  }

  clearStorage() {
    let tgt: string;
    let cred: string;
    let settings: {};
    return this.storage.get('cred').then((credValue) => { // KEEP CRED TO GENERATE TGT WHEN EXPIRED
      cred = credValue;
      this.storage.get('tgt').then((tgtValue) => { // KEEP TGT TO PREVENT BREAKING THE APP
        tgt = tgtValue;
        this.storage.get('settings').then((settingsValue) => {
          settings = settingsValue;
          this.storage.clear().then(() => {
            this.storage.set('tgt', tgt);
            this.storage.set('cred', cred);
            this.storage.set('settings', settings);
          });
        });
      });
    }
    );
  }

  // PURE DARK THEME
  togglePureDarkTheme(val: boolean) {
    this.storage.set('pure-dark-theme', val);
    this.pureDarkTheme.next(val);
  }

  PureDarkThemeActivated() {
    return this.pureDarkTheme.asObservable();
  }

  // ACCENT COLORS
  getAccentColor() {
    return this.accentColor.asObservable();
  }

  setAccentColor(val: string) {
    this.storage.set('accent-color', val);
    this.accentColor.next(val);
  }

  getAccentColorRgbaValue() {
    let value = '';
    this.accentColors.forEach(accentColor => {
      if (accentColor.name === this.accentColor.value) {
        value = accentColor.rgbaValues;
      }
    });
    return value;
  }

  changeStatusBarColor(darkThemeSelected: boolean) {
    if (this.platform.is('cordova')) {
      if (darkThemeSelected === false) {
        this.statusBar.backgroundColorByHexString('#e7e7e7');
        this.statusBar.styleDefault();
      } else {
        this.statusBar.backgroundColorByHexString('#1d1b1b');
        this.statusBar.styleLightContent();
      }
    }
  }

  getUserSettingsFromStorage() {
    // GETTING THE USER SETTINGS FROM STORAGE
    // IT IS CALLED ONLY IN APP COMPONENT AND THE VALUE PASSED BACK TO HERE
    this.storage.get('dark-theme').then(value => {
      if (value) {
        this.toggleDarkTheme(value);
        this.changeStatusBarColor(value);
      } else {
        this.toggleDarkTheme(false);
        this.changeStatusBarColor(false);
      }
    });
    this.storage.get('pure-dark-theme').then(value => {
      if (value) {
        this.togglePureDarkTheme(value);
      } else {
        this.togglePureDarkTheme(false);
      }
    });
    this.storage.get('accent-color').then(value => {
      value
        ? this.setAccentColor(value)
        : this.setAccentColor('blue-accent-color');
    });
  }

}
