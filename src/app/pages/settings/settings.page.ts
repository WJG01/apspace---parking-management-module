import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccentColors, CampusLocation, LocationTestData, MenuOptions, Themes, TimeFormats, VenueLocation } from 'src/app/constants';
import { ManageSettingsModalPage } from './manage-settings-modal/manage-settings-modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  accentColors = AccentColors;
  campusLocation = CampusLocation;
  venueLocation = VenueLocation;
  menuView = MenuOptions;
  timeFormats = TimeFormats;
  themes = Themes;
  location = LocationTestData;
  isStudent = true;

  data = [];

  skeleton = new Array(4);


  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.data = this.isStudent ? ['noticeBoard', 'upcomingTrips', 'financials', 'cgpa'] : ['noticeBoard', 'apcard'];
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
