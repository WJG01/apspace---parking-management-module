import { Component } from '@angular/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';

import { ComponentService, WsApiService } from 'src/app/services';
@Component({
  selector: 'page-student-details-modal',
  templateUrl: 'student-details-modal.html',
})
export class StudentDetailsModalPage {
  loading: HTMLIonLoadingElement;
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  studentId: string;
  studentDetails$: any;
  constructor(
    public params: NavParams,
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private component: ComponentService,
    private loadingController: LoadingController
  ) {
    this.studentId = this.params.get('studentId');
  }

  ionViewWillEnter() {
    this.doRefresh();
  }

  doRefresh() {
    this.studentDetails$ = this.ws.get(`/igraduate/student_details?id=${this.studentId}`);
  }

  updateSize(size: string) {
    this.presentLoading();
    this.ws.post<any>(`/igraduate/update_size?id=${this.studentId}&size=${size}`).subscribe({
      next: () => {
        this.component.toastMessage('Size updated successfully!', 'success');
      },
      error: () => {
        this.dismissLoading();
        this.component.toastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
      },
      complete: () => {
        this.dismissLoading();
        this.doRefresh();
      }
    });
  }

  reset() {
    this.presentLoading();
    this.ws.post<any>(`/igraduate/reset?id=${this.studentId}`).subscribe({
      next: () => {
        this.component.toastMessage('Reset has been done successfully!', 'success');
      },
      error: () => {
        this.dismissLoading();
        this.component.toastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
      },
      complete: () => {
        this.dismissLoading();
        this.doRefresh();
      }
    });
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true,
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
