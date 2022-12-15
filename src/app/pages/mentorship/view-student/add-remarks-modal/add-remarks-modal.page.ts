import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';

import { ComponentService, MentorshipService, WsApiService } from '../../../../services';

@Component({
  selector: 'app-add-remarks-modal',
  templateUrl: './add-remarks-modal.page.html',
  styleUrls: ['./add-remarks-modal.page.scss'],
})
export class AddRemarksModalPage implements OnInit {
  loading: HTMLIonLoadingElement;
  remarks: string;
  tp: string;
  addedRemarks$: Observable<any>;

  constructor(
    private ws: WsApiService,
    public modalController: ModalController,
    public commonModule: CommonModule,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private mentorship: MentorshipService
  ) { }

  ngOnInit() {
    this.tp = this.navParams.get('studentID');
  }

  onSubmit() {
    this.presentLoading();
    const body = {
      remarks: this.remarks
    };
    const headers = { 'Content-Type': 'application/json' };
    if (body) {
      this.addedRemarks$ = this.mentorship.addRemarks(this.tp, body, headers);
      this.addedRemarks$.subscribe(
        () => {
          this.component.toastMessage('You have successfully submitted the remarks.', 'success');
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
