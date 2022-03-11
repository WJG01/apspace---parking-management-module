import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { format } from 'date-fns';

import { WsApiService } from '../../../../services';

@Component({
  selector: 'app-edit-remarks-modal',
  templateUrl: './edit-remarks-modal.page.html',
  styleUrls: ['./edit-remarks-modal.page.scss'],
})
export class EditRemarksModalPage implements OnInit {
  loading: HTMLIonLoadingElement;
  remarks: string;
  staffID: string;
  remarksDate: string;
  tp: string;
  devURL = 'https://gmywrxsd75.execute-api.ap-southeast-1.amazonaws.com/dev/mentor/update_remarks';

  constructor(
    private ws: WsApiService,
    public modalController: ModalController,
    public commonModule: CommonModule,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navParams: NavParams,
  ) { }

  ngOnInit() {
    this.tp = this.navParams.get('studentID');
    this.remarks = this.navParams.get('remarks');
    this.staffID = this.navParams.get('staffID');
    this.remarksDate = this.navParams.get('remarksDate');
  }

  onSubmit() {
    this.presentLoading();
    const date = new Date(this.remarksDate);
    const newRemarksDate = format(date, 'yyyy-MM-dd HH:mm:ss');
    const body = {
      remarks: this.remarks,
      remarks_date: newRemarksDate,
      recorded_by: this.staffID
    };
    const headers = { 'Content-Type': 'application/json' };
    if (body) {
      this.ws.put<any>('', { url: this.devURL + `?id=${this.tp}`, body, headers }).subscribe(
        () => {
          this.showToastMessage('You have successfully edited the remarks.', 'success');
        },
        () => {
          this.showToastMessage('The remark was not added due to an error. Please contact the IT Helpdesk.', 'danger');
          this.dismissLoading();
        },
        () => this.dismissLoading()
      );
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 20000,
      message: 'Loading ...',
      translucent: true,
      animated: true
    });
    return await this.loading.present();
  }

  showToastMessage(message: string, color: 'danger' | 'success') {
    this.toastCtrl
      .create({
        message,
        duration: 6000,
        position: 'top',
        color,
        animated: true,
        buttons: [
          {
            text: 'Close',
            role: 'cancel'
          }
        ],
      })
      .then(toast => toast.present());
  }

  async dismissLoading() {
    if (this.loading) {
      this.dismiss();
      return await this.loading.dismiss();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

}
