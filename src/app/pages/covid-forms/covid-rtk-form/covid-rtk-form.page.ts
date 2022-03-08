import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

import { UserVaccineInfo } from '../../../interfaces/covid-forms';
import { WsApiService } from '../../../services';

@Component({
  selector: 'app-covid-rtk-form',
  templateUrl: './covid-rtk-form.page.html',
  styleUrls: ['./covid-rtk-form.page.scss'],
})
export class CovidRtkFormPage implements OnInit {
  loading: HTMLIonLoadingElement;

  // User Vaccine Information
  userVaccinationInfo$: Observable<UserVaccineInfo[]>;

  // Dates
  todaysDate: string;

  // Input Response
  rtkResult: string;
  rtkEvidenceDate: string;
  rtkEvidence: File;

  constructor(
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.todaysDate = format(new Date(), 'yyyy-MM-dd');
    this.getUserVaccinationInfo();
  }

  getUserVaccinationInfo() {
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo[]>('/covid19/user');
  }

  // Returns date from 7 days ago
  getDate() {
    const days = 6;
    const todaysDate = new Date();
    const last = new Date(todaysDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const lastDay = format(last, 'yyyy-MM-dd');
    return lastDay;
  }

  uploadFile($event): void {
    this.rtkEvidence = $event.target.files[0];
    if (!this.rtkEvidence) {
      this.showToastMessage('Error: File cannot be empty!', 'danger');
      return;
    }
    if (this.rtkEvidence.size > 2000000) {
      this.showToastMessage('Error: Maximum File size is 2 MB. Please upload another file', 'danger');
      this.rtkEvidence = null;
    }
  }

  onSubmit() {
    this.presentLoading();
    const body = new FormData();
    body.append('rtk_result', this.rtkResult);
    const rtkDate = new Date(this.rtkEvidenceDate);
    body.append('rtk_date', format(rtkDate, 'yyyy-MM-dd'));
    body.append('rtk_evidence', this.rtkEvidence);
    if (body) {
      this.ws.post<any>('/covid19/user/add/covid_test_result', {body}).subscribe(
        () => {
          this.showToastMessage('You have successfully submitted the form.', 'success');
          this.router.navigate(['/tabs/dashboard']);
        } ,
        () => {
          this.showToastMessage('The form was not sent due to an error. Please contact IT Helpdesk.', 'danger');
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
      return await this.loading.dismiss();
    }
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

}
