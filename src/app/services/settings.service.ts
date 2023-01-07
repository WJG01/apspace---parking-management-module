import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, NEVER, Observable, Subscription, from } from 'rxjs';
import {
  catchError, distinctUntilChanged, finalize, pluck, switchMap, tap
} from 'rxjs/operators';

import { Role, Settings, SettingsOld, StaffProfile, StudentProfile } from '../interfaces';
import { ConfigurationsService, WsApiService } from './';


// TODO replace any isEqual usage with own implementation later
// lodash does not seem to be alive
// refer to https://github.com/lodash/lodash/issues/5388
import { isEqual } from 'lodash-es';

/** Settings metadata. */
interface SettingsMeta {
  version: string;
  appVersion: string;
}

/** Raw settings, how it was stored in ionic storage. */
type SettingsRaw = {
  [K in keyof Settings]: {
    epoch: number; // epoch
    data: Settings[K];
    oldData?: Settings[K]; // backup of old data
    lastEpoch?: number; // when was it last changed
  }
} & SettingsMeta;

/** Settings request to S3, it is how it was stored in S3. */
type SettingsReq = { [K in keyof Settings]: SettingReq<K> } & SettingsMeta;

/** Individual setting change request to be sent to lambda. */
type SettingReq<K extends keyof Settings> = {
  epoch: number;
  data: Settings[K];
};

/** Default data for settings, first observed value until settings is loaded. */
const defaultData: Settings = {
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

const BUCKET_URL = 'https://s3-ap-southeast-1.amazonaws.com/apspace-user-settings-sync';

/**
 * Settings storage with a similar interface to ionic storage with memory cache.
 */

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // start with default settings
  private data = new BehaviorSubject<Readonly<SettingsRaw>>({
    version: '2020-05-27', // settings version
    appVersion: '1.2.3', // to be merged with synced version
    ...Object.assign({}, ...Object.entries(defaultData).map(([k, v]) =>
      ({ [k]: { epoch: 0, data: v } }))),
  });

  // keep track of all requests subscriptions, one at a time for each requests key
  private requests = {} as Record<keyof Settings, Subscription>;

  // deprecated way to check if settings is ready, keeping it for compatibility
  private readyPromise: Promise<void>;

  // make sure initialSync only runned once per session
  private initialSynced = false;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private config: ConfigurationsService,
    private ws: WsApiService
  ) { }

  initSettings() {
    // migrate old settings
    this.readyPromise = this.storage.get('settings').then((raw: SettingsRaw | SettingsOld | null) => {
      if (raw === null) { // keep default settings
        return;
      } else if ('role' in raw) { // migrate old storage method
        const { role, canAccessResults, attendixv1, ...rest } = raw;

        // move role and canAccessResults to storage
        this.storage.set('role', role);
        this.storage.set('canAccessResults', !!canAccessResults);

        // tslint:disable-next-line:no-bitwise
        const epoch = Date.now() / 1000 | 0;

        // change data into new format
        const busShuttleServices = this.storage.get('bus-shuttle-services');
        Promise.all([
          this.storage.get('timetable').then((value: { blacklists: [] }) => value?.blacklists || []),
          this.storage.get('dashboard-sections').then(value => value || defaultData.dashboardSections),
          this.storage.get('menu-ui').then(value => value || defaultData.menuUI),
          this.storage.get('disable-shakespear').then(value => value || defaultData.disableShakespear),
          this.storage.get('shake-sensitivity').then(value => +value || defaultData.shakeSensitivity),
          this.storage.get('accent-color').then(value => value?.slice(0, -13) || defaultData.accentColor),
          busShuttleServices.then(value => value?.firstLocation || defaultData.busFirstLocation),
          busShuttleServices.then(value => value?.secondLocation || defaultData.busSecondLocation),
        ]).then(items => items.map(data => ({ epoch, data })))
          .then(([
            modulesBlacklist, dashboardSections, menuUI, disableShakespear, shakeSensitivity,
            accentColor, busFirstLocation, busSecondLocation
          ]) => {
            this.data.next({
              ...this.data.value, // built with default value
              appVersion: this.config.appVersion,
              modulesBlacklist,
              dashboardSections,
              menuUI,
              disableShakespear,
              shakeSensitivity,
              accentColor,
              busFirstLocation,
              busSecondLocation,
              theme: { epoch, data: '' },
              ...Object.assign({}, ...Object.entries(rest).map(([k, v]) =>
              ({
                [k]: isEqual(v, defaultData[k]) || v === undefined // check if value changed
                  ? { epoch, data: defaultData[k] } // keep default
                  : { epoch, data: v, lastEpoch: 0, oldData: null }
              }))), // needs sync
            } as SettingsRaw);
            this.storage.set('settings', this.data.value);
            this.initialSync();

            const oldStorage = [
              'dark-theme', 'pure-dark-theme', 'bus-shuttle-services', 'timetable',
              'dashboard-sections', 'menu-ui', 'shake-sensitivity', 'accent-color',
            ];
            for (const key of oldStorage) {
              this.storage.remove(key);
            }
          });
      } else { // saved settings
        this.data.next(raw);
      }
    });
  }

  /**
   * Return a promise to check if settings provider is initialized.
   *
   * @deprecated use `get` or `get$` directly.
   */
  ready(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * Set value in settings. It is not possible to change by reference
   * with set so be careful with non-primitive types like array.
   *
   * @param key - key stored
   * @param value - value to be set
   */
  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    if (this.data.value[key].data === value) { return; }
    const { data, epoch, oldData, lastEpoch } = this.data.value[key];
    // tslint:disable-next-line:no-bitwise
    const newEpoch = Date.now() / 1000 | 0;
    if (oldData === undefined) {
      this.data.next({ ...this.data.value, [key]: { epoch: newEpoch, data: value, oldData: data, lastEpoch: epoch } });
    } else if (!isEqual(oldData, value)) {
      this.data.next({ ...this.data.value, [key]: { epoch: newEpoch, data: value, oldData, lastEpoch } });
    } else {
      if (key in this.requests) { // cancel any ongoing subscription for key if any
        this.requests[key].unsubscribe();
      }
      this.data.next({ ...this.data.value, [key]: { epoch: lastEpoch, data: oldData } });
    }
    this.storage.set('settings', this.data.value);
    this.sync();
  }

  /**
   * Get value in settings. It will always return one observed value on
   * subscription and one should handle subsequent observed values and
   * unsubscription of the observable.
   *
   * Returned value could be in the order of:
   * 1. default setting
   * 2. stored setting
   * 3. changed setting
   *
   * @param key - key stored
   * @returns observable - observed values only if key and value changed
   */
  get$<K extends keyof Settings>(key: K): Observable<Settings[K]> {
    return this.data.asObservable().pipe(
      pluck(key, 'data'),
      distinctUntilChanged(isEqual),
    ) as Observable<Settings[K]>;
  }

  /**
   * Get snapshot value in settings. It is more preferable to use `get$`
   * to handle settings change in real time.
   *
   * @param key - key stored
   */
  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.data.value[key].data as Settings[K];
  }

  /**
   * Attempt to sync settings sequentially.
   */
  sync(): void {
    Object.entries(this.data.value)
      // keep items for synchronization
      .filter(<K extends keyof Settings>([_, v]: [K, SettingsRaw[K]]) => v?.lastEpoch !== undefined)
      .forEach(<K extends keyof Settings>([k, v]: [K, SettingsRaw[K]]) => {
        const { epoch, data } = v;
        const body = { epoch, data } as SettingReq<K>;
        if (k in this.requests) { // cancel ongoing subscription to prevent data change race
          this.requests[k].unsubscribe();
        }
        this.requests[k] = this.ws.put<any>(`/settings-sync/${k}`, { body }).subscribe(() => {
          this.data.next({ ...this.data.value, [k]: { epoch, data } });
          this.storage.set('settings', this.data.value);
        }, err => console.error('sync', err), () => delete this.requests[k]); // clear subscription
      });
  }

  /**
   * First attempt to sync settings, should be done on login or startup.
   */
  initialSync(): void {
    // make sure initial sync only runs once per session
    if (this.initialSynced) {
      return;
    }
    this.initialSynced = true;



    const options = this.config.connectionStatus ? { headers: { 'x-refresh': '' } } : {};
    from(this.storage.get('role')).pipe(
      // tslint:disable-next-line:no-bitwise
      switchMap(role => role & Role.Student
        ? this.ws.get<StudentProfile>('/student/profile').pipe(pluck('STUDENT_NUMBER'))
        : this.ws.get<StaffProfile[]>('/staff/profile').pipe(pluck(0, 'ID'))
      ),
      switchMap(user => this.http.get<SettingsReq>(`${BUCKET_URL}/${user.toLowerCase()}`, options)),
      tap(data => this.data.next({
        ...this.data.value,
        ...Object.assign({}, ...Object.keys(data)
          .filter(k => !['version', 'appVersion'].includes(k))
          .map(k => k in defaultData
            // merge with current data according to timestamp
            ? { [k]: data[k]?.epoch > this.data.value[k]?.epoch ? data[k] : this.data.value[k] }
            // remove additional unused fields (not stored)
            : this.ws.delete<any>(`/settings-sync/${k}`).subscribe()
          )
        )
      })),
      catchError(err => {
        const { version, appVersion, ...rest } = this.data.value;
        const body = {
          version,
          appVersion,
          ...Object.assign({}, ...Object.entries(rest).map(([k, v]) =>
            ({ [k]: { epoch: v.epoch, data: v.data } }))) // remove extra values
        } as SettingsReq;
        if (400 <= err.status && err.status < 500) {
          return this.ws.post<any>('/settings-sync/', { body });
        } else {
          console.error('Unknown error', err);
          return NEVER;
        }
      }),
      finalize(() => this.sync()),
      finalize(() => this.storage.set('settings', this.data.value)),
    ).subscribe();
  }

  /** Clear settings, should be done on logout. */
  clear(): void {
    this.data.next({
      version: '2020-05-27', // settings version
      appVersion: '1.2.3', // to be merged with synced version
      ...Object.assign({}, ...Object.entries(defaultData).map(([k, v]) =>
        ({ [k]: { epoch: 0, data: v } }))),
    });
    this.storage.set('settings', this.data.value);
    this.initialSynced = false; // allow sync after logout
  }
}
