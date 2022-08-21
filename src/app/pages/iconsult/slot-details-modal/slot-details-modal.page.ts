import { Component, Input, OnInit } from '@angular/core';
import { AlertButton, LoadingController, ModalController } from '@ionic/angular';

import { utcToZonedTime } from 'date-fns-tz';

import { ConsultationHour, ConsultationSlot } from '../../../interfaces';
import { SettingsService, ComponentService, WsApiService, AppLauncherService } from '../../../services';

@Component({
  selector: 'app-slot-details-modal',
  templateUrl: './slot-details-modal.page.html',
  styleUrls: ['./slot-details-modal.page.scss'],
})
export class SlotDetailsModalPage implements OnInit {

  @Input() studentBooking: ConsultationHour;
  @Input() staffBooking: ConsultationSlot;
  enableMalaysiaTimezone: boolean;
  showRemarks: boolean;
  todaysDate = new Date();
  remarksText = '';

  constructor(
    private settings: SettingsService,
    private modalCtrl: ModalController,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private ws: WsApiService,
    private appLauncher: AppLauncherService
  ) { }

  ngOnInit() {
    this.settings.get$('enableMalaysiaTimezone').subscribe(data => this.enableMalaysiaTimezone = data);

    if (this.enableMalaysiaTimezone) {
      if (utcToZonedTime(new Date(this.staffBooking.start_time), 'Asia/Kuala_Lumpur') <= utcToZonedTime(this.todaysDate, 'Asia/Kuala_Lumpur')) {
        this.showRemarks = true;
      }
      return;
    }

    if (new Date(this.staffBooking.start_time) <= this.todaysDate) {
      this.showRemarks = true;
    }
  }

  addRemarks() {
    if (this.remarksText === '') {
      this.component.toastMessage('You cannot submit while having a blank field', 'warning');

      return;
    }

    const body = {
      booking_id: this.staffBooking.booking_detail.id,
      remark: this.remarksText,
      synced_to_gims: 0
    };
    const btn: AlertButton = {
      text: 'Yes',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();

        this.ws.put('/iconsult/remark', { body }).subscribe({
          next: () => {
            loading.dismiss();
            this.component.toastMessage('Remarks Added Successfully!', 'success');
            this.modalCtrl.dismiss({ completed: true });
          },
          error: () => {
            loading.dismiss();
            this.component.toastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
          }
        });
      }
    }

    this.component.alertMessage('Adding Remarks!', 'Are you sure you want to add remarks to this booking?', 'No', btn);
  }

  chatInTeams(lecturerCasId: string) {
    const androidSchemeUrl = 'com.microsoft.teams';
    const iosSchemeUrl = 'microsoft-teams://';
    const webUrl = `https://teams.microsoft.com/_#/apps/a2da8768-95d5-419e-9441-3b539865b118/search?q=?${lecturerCasId}`;
    const appStoreUrl = 'https://itunes.apple.com/us/app/microsoft-teams/id1113153706?mt=8';
    const appViewUrl = 'https://teams.microsoft.com/l/chat/0/0?users=';
    // tslint:disable-next-line: max-line-length
    const playStoreUrl = `https://play.google.com/store/apps/details?id=com.microsoft.teams&hl=en&referrer=utm_source%3Dgoogle%26utm_medium%3Dorganic%26utm_term%3D'com.microsoft.teams'&pcampaignid=APPU_1_NtLTXJaHKYr9vASjs6WwAg`;
    this.appLauncher.launchExternalApp(
      iosSchemeUrl,
      androidSchemeUrl,
      appViewUrl,
      webUrl,
      playStoreUrl,
      appStoreUrl,
      `${lecturerCasId}@staffemail.apu.edu.my`);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
