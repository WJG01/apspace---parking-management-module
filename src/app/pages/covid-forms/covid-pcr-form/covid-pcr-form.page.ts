import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { format } from 'date-fns';

import { UserVaccineInfo } from '../../../interfaces/covid-forms';
import { ComponentService, WsApiService } from '../../../services';

@Component({
  selector: 'app-covid-pcr-form',
  templateUrl: './covid-pcr-form.page.html',
  styleUrls: ['./covid-pcr-form.page.scss'],
})

export class CovidPcrFormPage implements OnInit {
  // User Vaccine Information
  userVaccinationInfo$: Observable<UserVaccineInfo[]>;

  // Dates
  todaysDate: string;

  // Input Response
  pcrResult: string;
  pcrEvidenceDate: string;
  pcrEvidence: File;
  constructor(
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private component: ComponentService
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
    const days = 2;
    const todaysDate = new Date();
    const last = new Date(todaysDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const lastDay = format(last, 'yyyy-MM-dd');
    return lastDay;
  }

  uploadFile($event): void {
    this.pcrEvidence = $event.target.files[0];
    if (!this.pcrEvidence) {
      this.component.toastMessage('Error: File cannot be empty!', 'danger');
      return;
    }
    if (this.pcrEvidence.size > 2000000) {
      this.component.toastMessage('Error: Maximum File size is 2 MB. Please upload another file', 'danger');
      this.pcrEvidence = null;
    }
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    const body = new FormData();
    body.append('pcr_result', this.pcrResult);
    const pcrDate = new Date(this.pcrEvidenceDate);
    body.append('pcr_date', format(pcrDate, 'yyyy-MM-dd'));
    body.append('pcr_evidence', this.pcrEvidence);
    if (body) {
      this.ws.post<any>('/covid19/user/add/pcr_result', { body }).subscribe(
        () => {
          this.component.toastMessage('You have successfully submitted the form.', 'success');
          this.router.navigate(['/tabs/dashboard']);
        },
        () => {
          this.component.toastMessage('The form was not sent due to an error. Please contact IT Helpdesk.', 'danger');
          loading.dismiss();
        },
        () => loading.dismiss()
      );
    }
  }
}
