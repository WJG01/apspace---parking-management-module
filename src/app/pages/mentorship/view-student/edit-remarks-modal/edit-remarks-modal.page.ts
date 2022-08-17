import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { format } from 'date-fns';

import { ComponentService, WsApiService } from '../../../../services';

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

  constructor(
    private ws: WsApiService,
    public modalController: ModalController,
    public commonModule: CommonModule,
    private loadingCtrl: LoadingController,
    private component: ComponentService,
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
      this.ws.put<any>(`/mentor/update_remarks?id=${this.tp}`, { body, headers }).subscribe(
        () => {
          this.component.toastMessage('You have successfully edited the remarks.', 'success');
        },
        () => {
          this.component.toastMessage('The remark was not added due to an error. Please contact the IT Helpdesk.', 'danger');
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
