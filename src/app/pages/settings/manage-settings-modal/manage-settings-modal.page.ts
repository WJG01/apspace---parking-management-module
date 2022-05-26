import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StaffDashboardSection, StudentDashboardSection } from 'src/app/constants';

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
  skeleton = new Array(4);

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    if (this.type === 'dashboard sections') {
      const staff = StaffDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));
      const student = StudentDashboardSection.map(s => ({ ...s, selected: this.settingsData.includes(s.value) }));

      this.allSettings = this.isStudent ? student : staff;
    }
  }

  saveChanges() {
    if (this.type === 'dashboard sections') {
      const sectionID = this.allSettings.filter(s => s.selected).map(s => s.value);

      console.log('Sections to Save: ', sectionID);
    }

  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
