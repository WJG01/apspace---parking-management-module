import { Component, Input, OnInit } from '@angular/core';
import { AlertButton, AlertController, LoadingController, ModalController } from '@ionic/angular';

import { formatISO } from 'date-fns';
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
    private appLauncher: AppLauncherService,
    private alertCtrl: AlertController
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
      cssClass: 'success',
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

    this.component.alertMessage('Adding Remarks!', 'Are you sure you want to add remarks to this booking?', 'success', 'No', btn);
  }

  async cancelSlot() {
    const startDate = formatISO(new Date(this.studentBooking.slot_start_time), { representation: 'date' });
    // TODO: Change this to small modal
    const alert = await this.alertCtrl.create({
      header: `Cancelling Appointment with ${this.studentBooking.staff_detail.FULLNAME} on ${startDate}`,
      message: `Please provide us with the cancellation reason <br /> (Max 50 Characters):`,
      inputs: [
        {
          name: 'cancellationReason',
          id: 'maxLength50',
          type: 'text',
          placeholder: 'Enter The Cancellation Reason'
        },
      ],
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { }
        }, {
          text: 'Cancel Booking Slot',
          handler: async (data) => {
            if (!data.cancellationReason) {
              this.component.toastMessage('Cancellation Reason is Required!', 'warning');
              return;
            }

            const loading = await this.loadingCtrl.create({
              message: 'Please wait...'
            });
            await loading.present();
            const body = [{
              booking_id: this.studentBooking.id,
              remark: data.cancellationReason
            }];

            this.ws.put('/iconsult/booking/cancel', { body }).subscribe({
              next: () => {
                this.component.toastMessage('Booking has been cancelled successfully!', 'success');
              },
              error: (err) => {
                loading.dismiss();
                this.component.toastMessage(`${err.error.error}`, 'danger');
              },
              complete: () => {
                loading.dismiss();
                this.modalCtrl.dismiss({ completed: true });
              }
            });
          }
        }
      ]
    });
    await alert.present();
    document.getElementById('maxLength50').setAttribute('maxlength', '50');
  }

  chatTeams(staffEmail: string) {
    this.appLauncher.chatInTeams(staffEmail);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
