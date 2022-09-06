import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertButton, LoadingController, ModalController } from '@ionic/angular';

import { ComponentService, SettingsService, WsApiService } from '../../../../services';
import { AddFreeSlotBody, AddFreeSlotReview } from '../../../../interfaces';

@Component({
  selector: 'app-review-slots-modal',
  templateUrl: './review-slots-modal.page.html',
  styleUrls: ['./review-slots-modal.page.scss'],
})
export class ReviewSlotsModalPage {

  @Input() data: AddFreeSlotReview;
  @Input() body: AddFreeSlotBody;

  constructor(
    private modalCtrl: ModalController,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private ws: WsApiService,
    private settings: SettingsService,
    private router: Router
  ) { }

  async submit() {
    const btn: AlertButton = {
      text: 'Confirm',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();

        this.ws.post('/iconsult/slot', { body: this.body, timeout: 30000 })
          .subscribe({
            next: () => {
              loading.dismiss();
              this.dismiss();
              this.component.toastMessage('Slot(s) added successfully!', 'success');
            },
            error: (err) => {
              const message = err?.error?.error || 'Unknown Error Occured.'; // Fallback if no error message

              loading.dismiss();
              this.component.toastMessage(message, 'danger');
            },
            complete: () => {
              const defaultVenue = this.settings.get('defaultVenue');

              loading.dismiss();

              if (this.data.venueId !== defaultVenue) {
                this.showDefaultLocationWarningAlert(this.data.location, this.data.venueId);
              }

              const navigationExtras: NavigationExtras = {
                state: { reload: true }
              }
              this.router.navigateByUrl('iconsult/consultations', navigationExtras);
            }
          });
      }
    }
    this.component.alertMessage('Confirm Submission', 'These slot(s) will be added into the database. Do you want to proceed?', '', btn);
  }

  showDefaultLocationWarningAlert(newCampus: string, newVenue: string) {
    const btn: AlertButton = {
      text: 'Yes',
      handler: () => {
        this.settings.set('defaultCampus', newCampus);
        this.settings.set('defaultVenue', newVenue);
      }
    }

    this.component.alertMessage('Updating Your Default Location', 'We noticed that you have entered a new location for your consultation hour. Do you want to use the new location as your default iConsult location?', 'No', btn);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
