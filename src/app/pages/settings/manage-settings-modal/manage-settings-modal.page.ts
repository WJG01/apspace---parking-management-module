import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, map, tap } from 'rxjs';

import { StaffProfile } from '../../../interfaces';
import { StaffDashboardSection, StudentDashboardSection } from '../../../constants';
import { SettingsService, WsApiService } from '../../../services';

@Component({
  selector: 'app-manage-settings-modal',
  templateUrl: './manage-settings-modal.page.html',
  styleUrls: ['./manage-settings-modal.page.scss'],
})
export class ManageSettingsModalPage implements OnInit {

  @Input() type: string;
  @Input() settingsData: string[];
  @Input() isStudent?: boolean;
  allSettings = [];
  profileName$: Observable<string[]>;
  skeleton = new Array(4);

  constructor(
    private modalCtrl: ModalController,
    private settings: SettingsService,
    private ws: WsApiService
  ) { }

  async ngOnInit() {
    if (this.type === 'dashboard sections') {
      const staff = StaffDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));
      const student = StudentDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));

      this.allSettings = this.isStudent ? student : staff;
    }

    if (this.type === 'hidden modules') {
      this.allSettings = this.settingsData;
    }

    if (this.type === 'dashboard name') {
      this.profileName$ = this.getProfileName().pipe(
        tap(name => this.allSettings = name.map(n => ({ value: n, selected: this.settingsData.includes(n) })))
      );
    }
  }

  getProfileName(): Observable<string[]> {
    return this.ws.get<StaffProfile[]>('/staff/profile').pipe(
      map(res => res[0].FULLNAME.split(' ')),
    );
  }

  timetableModuleBlacklistsRemove(value: string) {
    this.allSettings = [];
    const modulesBlacklist = this.settings.get('modulesBlacklist');
    const selectedModule = modulesBlacklist.indexOf(value);
    const newModulesBlacklist = modulesBlacklist.slice(0, selectedModule)
      .concat(modulesBlacklist.slice(selectedModule + 1, modulesBlacklist.length));
    this.allSettings = newModulesBlacklist;

    this.settings.set('modulesBlacklist', newModulesBlacklist);
  }

  saveChanges() {
    if (this.type === 'dashboard sections') {
      const sectionID = this.allSettings.filter(s => s.selected).map(s => s.value);

      this.settings.set('dashboardSections', sectionID);
      this.dismiss();
    }

    if (this.type === 'hidden modules') {
      this.dismiss();
    }

    if (this.type === 'dashboard name') {
      const name = this.allSettings.filter(s => s.selected).map(s => s.value);

      this.settings.set('userProfileName', name);
      this.dismiss();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
