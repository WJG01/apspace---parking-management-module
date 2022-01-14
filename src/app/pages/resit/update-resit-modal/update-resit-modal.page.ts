import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { format } from 'date-fns';

import { ResitDate } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-update-resit-modal',
  templateUrl: './update-resit-modal.page.html',
  styleUrls: ['./update-resit-modal.page.scss'],
})
export class UpdateResitModalPage implements OnInit {

  resit: ResitDate;
  resitForm: FormGroup;
  todaysDate = new Date().toISOString();
  currentYear = new Date().getFullYear();
  allowUpdate = true;

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.resit = this.navParams.data.resit;

    if (new Date(this.resit.registration_start_date) <= new Date()) {
      this.allowUpdate = false;
    }

    this.resitForm = this.fb.group({
      registration_start_date: ['', [Validators.required]],
      registration_end_date: ['', [Validators.required]],
      referral_date: ['', [Validators.required]],
      enable_date: ['', [Validators.required]]
    });

    this.resitForm.patchValue({
      registration_start_date: this.resit.registration_start_date,
      registration_end_date: this.resit.registration_end_date,
      referral_date: this.resit.referral_date,
      enable_date: this.resit.enable_date
    });
  }

  async update() {
    const loading = await this.loadingCtrl.create({
      message: 'Please Wait...'
    });
    await loading.present();

    const resit: ResitDate = this.resitForm.value;
    const devUrl = 'https://jiscdfg5sh.execute-api.ap-southeast-1.amazonaws.com/dev';

    const formattedResits = {
      registration_start_date: format(new Date(resit.registration_start_date), 'yyyy-MM-dd'),
      enable_date: format(new Date(resit.enable_date), 'yyyy-MM-dd'),
      referral_date: format(new Date(resit.referral_date), 'yyyy-MM-dd'),
      registration_end_date: format(new Date(resit.registration_end_date), 'yyyy-MM-dd'),
    };

    const body = {
      id: this.resit.id,
      dates: formattedResits
    };

    this.ws.put('/multisite/resit/update_date', { body, url: devUrl }).subscribe({
      next: () => {
        loading.dismiss();
        this.showToastMessage('Successfully Updated Resit', 'success');
        this.modalCtrl.dismiss({ completed: true });
      },
      error: (err) => {
        loading.dismiss();
        this.showToastMessage(`Error: ${err.message}`, 'danger');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get startDate(): AbstractControl {
    return this.resitForm.get('registration_start_date');
  }

  async showToastMessage(message: string, color: 'danger' | 'success') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      position: 'top',
      duration: 3000,
      animated: true,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
