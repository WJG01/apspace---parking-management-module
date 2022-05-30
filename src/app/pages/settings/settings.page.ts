import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { firstValueFrom, Observable, pluck, tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import {
  AccentColors,
  CampusLocation,
  MenuOptions,
  ShakespearSensitivityOptions,
  StaffDashboardName,
  StudentDashboardName,
  Themes,
  TimeFormats
} from '../../constants';
import { APULocation, Role, StudentProfile, Venue } from '../../interfaces';
import { ApiService, SettingsService, StudentTimetableService, WsApiService } from '../../services';
import { ManageSettingsModalPage } from './manage-settings-modal/manage-settings-modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  accentColors = AccentColors;
  campusLocation = CampusLocation;
  menuView = MenuOptions;
  timeFormats = TimeFormats;
  themes = Themes;
  // API Observable Variables
  locations$: Observable<APULocation[]>;
  venues$: Observable<Venue[]>;
  // Settings Variables
  theme$ = this.settings.get$('theme');
  accent$ = this.settings.get$('accentColor');
  dashboardSections$ = this.settings.get$('dashboardSections');
  menuUI$ = this.settings.get$('menuUI');
  hideProfilePicture$ = this.settings.get$('hideProfilePicture');
  enableMalaysiaTimezone$ = this.settings.get$('enableMalaysiaTimezone'); // TODO: update the variable name (it should be disableMalaysiaTimezone)
  timeFormat$ = this.settings.get$('timeFormat');
  disableShakespear$ = this.settings.get$('disableShakespear');
  shakeSensitivity$ = this.settings.get$('shakeSensitivity');
  busShuttleServiceSettings$ = {
    firstLocation: this.settings.get$('busFirstLocation'),
    secondLocation: this.settings.get$('busSecondLocation'),
  };
  studentDashboardName$ = this.settings.get$('userProfileName');
  modulesBlacklist$ = this.settings.get$('modulesBlacklist');
  defaultCampus = '';
  defaultVenue = '';
  // Return Dashboard Section Name from ID
  studentDashboard: { [id: string]: string } = StudentDashboardName;
  staffDashboard: { [id: string]: string } = StaffDashboardName;
  // Other Variables
  skeleton = new Array(2);
  isCapacitor = this.plt.is('capacitor');
  isStudent: boolean;

  constructor(
    private modalCtrl: ModalController,
    private settings: SettingsService,
    private storage: Storage,
    private plt: Platform,
    private api: ApiService,
    private tt: StudentTimetableService,
    private ws: WsApiService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      this.isStudent = Boolean(role & Role.Student);
    });
    // Get Bus Locations
    this.locations$ = this.api.getLocations(true);
    // For Staff
    this.getDefaultLocation();
    if (this.defaultCampus) {
      this.getVenues();
    }
  }

  themeChanged(theme: string) {
    this.settings.set('theme', theme);
  }

  accentChanged(accent: string) {
    this.settings.set('accentColor', accent);
  }

  menuChanged(menu: 'cards' | 'list') {
    this.settings.set('menuUI', menu);
  }

  hideProfilePictureChanged(value: boolean) {
    this.settings.set('hideProfilePicture', value);
  }

  timezoneChanged(value: boolean) {
    this.settings.set('enableMalaysiaTimezone', value);
  }

  timeFormatChanged(format: '12' | '24') {
    this.settings.set('timeFormat', format);
  }

  shakespearChanged(value: boolean) {
    this.settings.set('disableShakespear', value);
  }

  shakespearSensitivityChanged(sensitivity: number) {
    this.settings.set('shakeSensitivity', ShakespearSensitivityOptions[sensitivity].value);
  }

  busShuttleServicesChanged(location: string, type: string) {
    if (type === 'first') {
      this.settings.set('busFirstLocation', location);
      return;
    }
    this.settings.set('busSecondLocation', location);
  }

  updateDefaultLocation(locationType: 'venue' | 'campus') { // for staff only (set iconsult default location)
    if (locationType === 'venue') {
      this.settings.set('defaultVenue', this.defaultVenue);
      return;
    }
    this.getVenues(); // get the venues for the new selected campus
    this.defaultVenue = ''; // set default venue to '' because campus has been changed
    this.settings.set('defaultVenue', this.defaultVenue);
    this.settings.set('defaultCampus', this.defaultCampus);
  }

  async getDefaultLocation() { // for staff only (get iconsult default location)
    this.defaultCampus = await firstValueFrom(this.settings.get$('defaultCampus'));
    this.defaultVenue = await firstValueFrom(this.settings.get$('defaultVenue'));
  }

  getVenues() {
    this.venues$ = this.ws.get<Venue[]>(`/iconsult/locations?venue=${this.defaultCampus}`);
  }

  async timetableModuleBlacklistsAdd() {
    const modulesBlacklist = this.settings.get('modulesBlacklist');
    const timetables = await firstValueFrom(this.tt.get());

    const intakeHistory = this.settings.get('intakeHistory');
    const intake = intakeHistory[intakeHistory.length - 1]
      || await firstValueFrom(this.ws.get<StudentProfile>('/student/profile', { caching: 'cache-only' }).pipe(pluck('INTAKE')));

    // ignored those that are blacklisted
    const filtered = timetables.filter(timetable => !modulesBlacklist.includes(timetable.MODID));
    const items = [...new Set(filtered.map(timetable => timetable.MODID))];
    const defaultItems = [...new Set(filtered
      .filter(timetable => timetable.INTAKE === intake)
      .map(timetable => timetable.MODID))];
    const placeholder = 'Search all modules';
    const notFound = 'No module selected';
    const itemMapper = (item: string) => item;  // no-op item mapper, disables default uppercase

    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items,
        defaultItems,
        placeholder,
        notFound,
        itemMapper
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data && data.item) {
      const newModulesBlacklist = [...modulesBlacklist, data.item];
      this.settings.set('modulesBlacklist', newModulesBlacklist);
    }
  }

  openPage(path: string) {
    this.navCtrl.navigateForward(path);
  }

  async manageSettings(type: string, settingsData: string[]) {
    const modal = await this.modalCtrl.create({
      component: ManageSettingsModalPage,
      componentProps: {
        type,
        settingsData,
        isStudent: this.isStudent
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();
  }

}
