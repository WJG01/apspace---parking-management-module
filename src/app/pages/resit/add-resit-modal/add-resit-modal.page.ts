import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { format } from 'date-fns';

import { ResitDate } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-add-resit-modal',
  templateUrl: './add-resit-modal.page.html',
  styleUrls: ['./add-resit-modal.page.scss'],
})
export class AddResitModalPage implements OnInit {

  resitForm: FormArray;
  todaysDate = new Date().toISOString();
  currentYear = new Date().getFullYear();

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.resitForm = this.fb.array([this.fb.group({
      registration_start_date: ['', [Validators.required]],
      registration_end_date: ['', [Validators.required]],
      referral_date: ['', [Validators.required]],
      enable_date: ['', [Validators.required]]
    })]);
  }

  addResit() {
    const form = this.fb.group({
      registration_start_date: ['', [Validators.required]],
      registration_end_date: ['', [Validators.required]],
      referral_date: ['', [Validators.required]],
      enable_date: ['', [Validators.required]]
    });

    this.resitForm.push(form);
  }

  removeResit(index: number) {
    this.resitForm.removeAt(index);
  }

  async submit() {
    const loading = await this.loadingCtrl.create({
      message: 'Adding...'
    });
    await loading.present();

    const resits: ResitDate[] = this.resitForm.value;
    const devUrl = 'https://jiscdfg5sh.execute-api.ap-southeast-1.amazonaws.com/dev';

    resits.map(r => {
      r.registration_start_date = format(new Date(r.registration_start_date), 'yyyy-MM-dd');
      r.enable_date = format(new Date(r.enable_date), 'yyyy-MM-dd');
      r.referral_date = format(new Date(r.referral_date), 'yyyy-MM-dd');
      r.registration_end_date = format(new Date(r.registration_end_date), 'yyyy-MM-dd');

      return r;
    });

    const body = { dates: resits };

    this.ws.post('/multisite/resit/add_date', { body, url: devUrl }).subscribe({
      next: () => {
        loading.dismiss();
        this.showToastMessage('Successfully Added Resits', 'success');
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

  getStartDate(i: number): AbstractControl {
    return this.resitForm.controls[i].get('registration_start_date');
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
