import { Component, Input } from '@angular/core';
import { AlertButton, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';

import { ComponentService, WsApiService } from '../../../../services';
import { ConsultationSlot, MappedSlots } from '../../../../interfaces';

@Component({
  selector: 'app-review-deletion-modal',
  templateUrl: './review-deletion-modal.page.html',
  styleUrls: ['./review-deletion-modal.page.scss'],
})
export class ReviewDeletionModalPage {

  @Input() slots: MappedSlots[];

  constructor(
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private component: ComponentService,
    private alertCtrl: AlertController
  ) { }

  deleteSlots() {
    const bookedSlots: ConsultationSlot[] = [];
    const availableSlots: ConsultationSlot[] = [];

    for (const date of this.slots) {
      for (const slot of date.slots) {
        if (slot.booking_detail) {
          bookedSlots.push(slot);
        } else {
          availableSlots.push(slot);
        }
      }
    }

    if (bookedSlots.length > 0) {
      const btn: AlertButton = {
        text: 'Yes',
        handler: async () => {
          // TODO: Change this to small modal
          const alert = await this.alertCtrl.create({
            header: `Cancelling Appointment`,
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

                  const listApiToForkJoin = [];
                  const cancellationBookedBody = bookedSlots.reduce((previous, current) => {
                    previous.push({
                      booking_id: current.booking_detail.id,
                      remark: data.cancellationReason
                    });

                    return previous;
                  }, []);
                  listApiToForkJoin.push(this.sendCancelBookingRequest(cancellationBookedBody));

                  if (availableSlots.length > 0) {
                    const cancellationAvailableBody = availableSlots.reduce((previous, current) => {
                      previous.push({
                        slot_id: current.slot_id
                      });

                      return previous;
                    }, []);

                    listApiToForkJoin.push(this.sendCancelSlotRequest(cancellationAvailableBody));
                  }

                  forkJoin(listApiToForkJoin).subscribe({
                    next: () => {
                      this.modalCtrl.dismiss({ completed: true });
                      this.component.toastMessage('Slot has been cancelled successfully!', 'success');
                    },
                    error: (err) => {
                      loading.dismiss();
                      this.component.toastMessage(`${err.error.error}`, 'danger');
                    },
                    complete: () => {
                      loading.dismiss();
                    }
                  });
                }
              }
            ]
          });
          await alert.present();
          document.getElementById('maxLength50').setAttribute('maxlength', '50');
        }
      }

      this.component.alertMessage('Warning', 'You have booked slots that you\'re about to cancel. Do you want to continue?', 'No', btn);
      return;
    }

    const btn: AlertButton = {
      text: 'Confirm',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();

        const cancellationBody = availableSlots.reduce((previous, current) => {
          previous.push({
            slot_id: current.slot_id
          });

          return previous;
        }, []);

        this.sendCancelSlotRequest(cancellationBody).subscribe({
          next: () => {
            this.modalCtrl.dismiss({ completed: true });
            this.component.toastMessage('Slot has been cancelled successfully!', 'success');
          },
          error: (err) => {
            loading.dismiss();
            this.component.toastMessage(`${err.error.error}`, 'danger');
          },
          complete: () => {
            loading.dismiss();
          }
        });
      }
    }

    this.component.alertMessage('Cancelling Open slots', 'Are you sure you want to delete these selected slots? This action cannot be undone. Do you want to proceed?', '', btn);
  }

  sendCancelSlotRequest(slotsId: number[]) {
    return this.ws.put('/iconsult/slot/cancel', {
      body: slotsId
    });
  }

  sendCancelBookingRequest(cancelBookingDetails: { booking_id: number, remark: string }[]) {
    return this.ws.put('/iconsult/booking/cancel', {
      body: cancelBookingDetails,
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
