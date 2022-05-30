import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { StaffDashboardSection, StudentDashboardSection } from '../../../constants';
import { SettingsService } from '../../../services';

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

  constructor(
    private modalCtrl: ModalController,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    if (this.type === 'dashboard sections') {
      const staff = StaffDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));
      const student = StudentDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));

      this.allSettings = this.isStudent ? student : staff;
    }

    if (this.type === 'hidden modules') {
      this.allSettings = this.settingsData;
    }
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
      this.modalCtrl.dismiss();
    }

    if (this.type === 'hidden modules') {
      this.dismiss();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
