import { Component, Input, OnInit } from '@angular/core';
import { AlertButton, LoadingController, ModalController } from '@ionic/angular';

import { utcToZonedTime } from 'date-fns-tz';

import { ConsultationSlot } from '../../../../interfaces';
import { ComponentService, SettingsService, WsApiService } from '../../../../services';

@Component({
  selector: 'app-slot-details-modal',
  templateUrl: './slot-details-modal.page.html',
  styleUrls: ['./slot-details-modal.page.scss'],
})
export class SlotDetailsModalPage implements OnInit {

  @Input() slot: ConsultationSlot;
  enableMalaysiaTimezone: boolean;
  showRemarks: boolean;
  todaysDate = new Date();
  remarksText = '';

  constructor(
    private settings: SettingsService,
    private modalCtrl: ModalController,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private ws: WsApiService
  ) { }

  ngOnInit() {
    this.settings.get$('enableMalaysiaTimezone').subscribe(data => this.enableMalaysiaTimezone = data);

    if (this.enableMalaysiaTimezone) {
      if (utcToZonedTime(new Date(this.slot.start_time), 'Asia/Kuala_Lumpur') <= utcToZonedTime(this.todaysDate, 'Asia/Kuala_Lumpur')) {
        this.showRemarks = true;
      }
      return;
    }

    if (new Date(this.slot.start_time) <= this.todaysDate) {
      this.showRemarks = true;
    }
  }

  addRemarks() {
    if (this.remarksText === '') {
      this.component.toastMessage('You cannot submit while having a blank field', 'warning');

      return;
    }

    const body = {
      booking_id: this.slot.booking_detail.id,
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

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
