import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, combineLatest } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { NotifierService } from 'src/app/shared/notifier/notifier.service';
import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { accentColors } from '../../constants';
import { APULocation, APULocations, Role, StudentProfile, Venue } from '../../interfaces';
import { SettingsService, StudentTimetableService, WsApiService } from '../../services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  isStudent: boolean;
  test = false;
  defaultCampus = '';
  defaultVenue = '';
  disableShakespear;
  shakeSensitivity: number;
  busShuttleServiceSettings = {
    firstLocation: '',
    secondLocation: '',
  };

  locations$: Observable<APULocation[]>;
  venues$: Observable<Venue[]>;
  theme$ = this.settings.get$('theme');
  accentColor$ = this.settings.get$('accentColor');
  modulesBlacklist$ = this.settings.get$('modulesBlacklist');

  menuUI: 'cards' | 'list' = 'list';
  sensitivityOptions = [
    { index: 0, value: 40 },
    { index: 1, value: 50 },
    { index: 2, value: 60 },
    { index: 3, value: 70 },
    { index: 4, value: 80 }
  ];
  hideProfilePicture;
  enableMalaysiaTimezone;
  timeFormat;
  locationOptions = [
    'New Campus',
    'TPM',
    'Online'
  ];
  accentColors = accentColors;
  isCordova: boolean;
  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private settings: SettingsService,
    private storage: Storage,
    private toastCtrl: ToastController,
    private tt: StudentTimetableService,
    private ws: WsApiService,
    private alertCtrl: AlertController,
    private plt: Platform,
    private notifierService: NotifierService
  ) {

    this.settings.get$('menuUI').subscribe(value => this.menuUI = value);
    combineLatest([
      this.settings.get$('busFirstLocation'),
      this.settings.get$('busSecondLocation'),
    ]).subscribe(([busFirstLocation, busSecondLocation]) => {
      this.busShuttleServiceSettings = {
        firstLocation: busFirstLocation,
        secondLocation: busSecondLocation,
      };
    });
    this.settings.get$('disableShakespear').subscribe(value => {
        this.disableShakespear = value;
      }
    );
    this.settings.get$('shakeSensitivity').subscribe(value => {
      this.shakeSensitivity = this.sensitivityOptions.findIndex(item => item.value === value);
    });
    this.settings.get$('hideProfilePicture').subscribe(value => {
        this.hideProfilePicture = value;
      }
    );
    this.settings.get$('enableMalaysiaTimezone').subscribe(value =>
      this.enableMalaysiaTimezone = value
    );
    this.settings.get$('timeFormat').subscribe(value =>
      this.timeFormat = value
    );
  }

  ngOnInit() {
    this.isCordova = this.plt.is('cordova');
    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
    });
    this.locations$ = this.getLocations();
    this.getDefaultLocation();
    if (this.defaultCampus) {
      this.getVenues();
    }
  }

  toggleDisableShakespear() {
    this.settings.set('disableShakespear', this.disableShakespear);
  }

  getSensitivitySlider() {
    this.settings.set('shakeSensitivity', this.sensitivityOptions[this.shakeSensitivity].value);
  }

  toggleDisplayProfilePicture() {
    this.settings.set('hideProfilePicture', this.hideProfilePicture);
  }

  toggleDisplayMalaysiaTimezone() {
    this.settings.set('enableMalaysiaTimezone', this.enableMalaysiaTimezone);
    let message;

    if (this.plt.is('cordova')) {
      message = 'Timezone has been changed. Please restart your application to view your timezone.';
    } else {
      message = 'Timezone has been changed. Please restart your browser to view your timezone.';
    }

    this.presentAlert(
      'Alert',
      message,
      'danger-alert',
      [
        {
          text: 'OK',
          handler: () => {}
        }
      ]
    );
  }

  toggleTimeFormat() {
    this.settings.set('timeFormat', this.timeFormat);
    this.notifierService.timeFormatUpdated.next('SUCCESS');
    this.notifierService.apCardUpdated.next('SUCCESS');
  }

  getLocations() {
    return this.ws.get<APULocations>(`/transix/locations`, { auth: false }).pipe(
      map((res: APULocations) => res.locations),
    );
  }

  getVenues() {
    this.venues$ = this.ws.get<Venue[]>(`/iconsult/locations?venue=${this.defaultCampus}`);
  }


  setBusShuttleServicesSettings() {
    this.settings.set('busFirstLocation', this.busShuttleServiceSettings.firstLocation);
    this.settings.set('busSecondLocation', this.busShuttleServiceSettings.secondLocation);
  }

  changeTheme(theme: string) {
    if (this.settings.get('theme').includes('pure')) { // from pure
      this.settings.set('accentColor', 'blue');
    }
    this.settings.set('theme', theme);
    if (theme.includes('pure')) { // to pure
      this.settings.set('accentColor', 'white');
    }
  }

  changeAccentColor(accentColor: string) {
    this.settings.set('accentColor', accentColor);
  }

  toggleMenuUI() {
    this.settings.set('menuUI', this.menuUI);
  }

  updateDefaultLocation(locationType: 'venue' | 'campus') { // for staff only (set iconsult default location)
    if (locationType === 'venue') {
      this.settings.set('defaultVenue', this.defaultVenue);
    } else {
      this.getVenues(); // get the venues for the new selected campus
      this.defaultVenue = ''; // set default venue to '' because campus has been changed
      this.settings.set('defaultVenue', this.defaultVenue);
      this.settings.set('defaultCampus', this.defaultCampus);
    }
  }

  getDefaultLocation() { // for staff only (get iconsult default location)
    this.defaultCampus = this.settings.get('defaultCampus');
    this.defaultVenue = this.settings.get('defaultVenue');
  }

  async timetableModuleBlacklistsAdd() {
    const modulesBlacklist = this.settings.get('modulesBlacklist');
    const timetables = await this.tt.get().toPromise();

    const intakeHistory = this.settings.get('intakeHistory');
    const intake = intakeHistory[intakeHistory.length - 1]
      || await this.ws.get<StudentProfile>('/student/profile', { caching: 'cache-only' }).pipe(pluck('INTAKE')).toPromise();

    // ignored those that are blacklisted
    const filtered = timetables.filter(timetable => !modulesBlacklist.includes(timetable.MODID));
    const items = [...new Set(filtered.map(timetable => timetable.MODID))];
    const defaultItems = [...new Set(filtered
      .filter(timetable => timetable.INTAKE === intake)
      .map(timetable => timetable.MODID))];
    const placeholder = 'Search all modules';
    const notFound = 'No module selected';
    const itemMapper = item => item;  // no-op item mapper, disables default uppercase
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: { items, defaultItems, placeholder, notFound, itemMapper }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.item) {
      const newModulesBlacklist = [...modulesBlacklist, data.item];
      this.settings.set('modulesBlacklist', newModulesBlacklist);
    }
  }

  timetableModuleBlacklistsRemove(value) {
    const modulesBlacklist = this.settings.get('modulesBlacklist');
    const selectedModule = modulesBlacklist.indexOf(value);
    const newModulesBlacklist = modulesBlacklist.slice(0, selectedModule)
      .concat(modulesBlacklist.slice(selectedModule + 1, modulesBlacklist.length));
    this.settings.set('modulesBlacklist', newModulesBlacklist);
  }

  navigateToPage(pageName: string) {
    this.navCtrl.navigateForward(pageName);
  }

  showToastMessage(message: string) {
    this.toastCtrl.create({
      message,
      duration: 6000,
      position: 'top',
      animated: true,
      color: 'success',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ],
    }).then(toast => toast.present());
  }

  async resetByod() {
    const confirm = await this.alertCtrl.create({
      header: 'BYOD Reset',
      message: 'You are about to send a request to the helpdesk support system to reset your BYOD. Do you want to continue?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.ws.get('/byod/reset').subscribe(
              () => {},
              err => console.error(err),
              async () => {
                const toast = await this.toastCtrl.create({
                  message: 'Your request has been sent to the helpdesk support system and it is being processed now.',
                  duration: 2000
                });
                await toast.present();
              }
            );
          }
        }
      ]
    });
    await confirm.present();
  }

  presentAlert(header, message, cssClass, buttons) {
    this.alertCtrl.create({
      header,
      message,
      cssClass,
      buttons
    }).then(alert => alert.present());
  }
}
