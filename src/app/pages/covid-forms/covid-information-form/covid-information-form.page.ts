import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format } from 'date-fns';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { OrientationStudentDetails, Role, StaffProfile, StudentProfile } from 'src/app/interfaces';
import { UserVaccineInfo, VaccinationStatus, VaccinationType } from '../../../interfaces/covid-forms';
import { WsApiService } from '../../../services';

@Component({
  selector: 'app-covid-information-form',
  templateUrl: './covid-information-form.page.html',
  styleUrls: ['./covid-information-form.page.scss'],
})
export class CovidInformationFormPage implements OnInit {
  loading: HTMLIonLoadingElement;
  // User Profile
  role: Role;
  isStudent: boolean;
  userProfile: any = {};
  staffProfile$: Observable<StaffProfile>;
  orientationStudentDetails$: Observable<OrientationStudentDetails>;

  // Vaccination
  devUrl = 'https://9t7k8i4yu5.execute-api.ap-southeast-1.amazonaws.com/dev/covid19';
  vaccinationStatus$: Observable<VaccinationStatus[]>;
  vaccinationType$: Observable<VaccinationType[]>;
  userVaccinationInfo$: Observable<UserVaccineInfo[]>;

  // Dates
  todaysDate: string;
  secondDoseMinDate = '2020';
  boosterDoseMinDate = '2021';
  maxDate: boolean;
  boosterMaxDate: boolean;

  // Vaccine Status
  notVaccinated = 1;
  partiallyVaccinated = 2;
  fullyVaccinated = 3;
  vaccinatedWithBooster = 4;

  // Vaccine Type
  pfizer = 1;
  sinovac = 2;
  astraZeneca = 3;
  cansino = 4;
  sinopharm = 5;
  other = 6;
  john = 7;

  number = '2';

  // Input Response
  fullName: string;
  vaccinationStatus: number;
  vaccinationType: number;
  numberOfDoses: string;
  doseOneDate: string;
  doseTwoDate: string;
  boosterType: number;
  boosterDate: string;
  pcrResult: string;
  pcrEvidenceDate: string;
  pcrEvidence: File;

  constructor(
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private storage: Storage,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      this.role = role;
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
      this.doRefresh();
    });
    this.todaysDate = format(new Date(), 'yyyy-MM-dd');
    this.getVaccinationStatus();
    this.getVaccinationTypes();
    this.getUserVaccinationInfo();
  }

  doRefresh(refresher?) {
    const forkJoinArray = [this.getProfile(refresher)];
    forkJoin(forkJoinArray).pipe(
      finalize(() => refresher && refresher.target.complete()),
    ).subscribe();
  }

  getProfile(refresher: boolean) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.isStudent ? this.ws.get<StudentProfile>('/student/profile', { caching }).pipe(
      tap(p => {
        this.orientationStudentDetails$ = this.ws.get<OrientationStudentDetails>(`/orientation/student_details?id=${p.STUDENT_NUMBER}`,
        ).pipe(
          catchError(err => {
            return of(err);
          }),
        );
      }),
      tap(studentProfile => this.userProfile = studentProfile),
    ) : this.staffProfile$ = this.ws.get<StaffProfile>('/staff/profile', { caching }).pipe(
      tap(staffProfile => this.userProfile = staffProfile[0]),
    );
  }

  getUserVaccinationInfo() {
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo[]>('', {url: this.devUrl + '/user'});
  }

  getVaccinationStatus() {
    this.vaccinationStatus$ = this.ws.get<VaccinationStatus[]>('', {url: this.devUrl + '/vaccine/status'});
  }

  getVaccinationTypes() {
    this.vaccinationType$ = this.ws.get<VaccinationType[]>('', {url: this.devUrl + '/vaccine/type'});
  }

  // Returns date from 7 days ago
  getDate() {
    const days = 2;
    const todaysDate = new Date();
    const last = new Date(todaysDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const lastDay = format(last, 'yyyy-MM-dd');
    return lastDay;
  }

  onVaccineTypeChange(vaccinationType: number) {
    this.vaccinationType = vaccinationType;
    if (this.vaccinationType === this.astraZeneca || this.vaccinationType === this.pfizer || this.vaccinationType === this.sinopharm
      || this.vaccinationType === this.sinovac) {
      this.numberOfDoses = '2';
    }
    if (this.vaccinationType === this.john || this.vaccinationType === this.cansino ) {
      this.numberOfDoses = '1';
    }
    if (this.vaccinationType === this.other) {
      this.numberOfDoses = '';
    }
  }

  onFirstDoseDateChange(doseDate: Date) {
    this.doseOneDate = format(new Date(doseDate), 'yyyy-MM-dd');
    if (this.numberOfDoses === '2') {
      const days = 1; // Number of days to eliminate
      const doseDateNew = new Date(doseDate); // Convert doseDate to proper date format
      // Calculate date to eliminate first dose date from second dose date
      const last = new Date(doseDateNew.getTime() + (days * 24 * 60 * 60 * 1000));
      const secondDoseMinDate = format(last, 'yyyy-MM-dd');

      const todaysDateString = format(new Date(), 'yyyy-MM-dd');
      this.secondDoseMinDate = secondDoseMinDate;

      // Compare doseOneDate with today's date
      if (this.doseOneDate === todaysDateString) {
        this.maxDate = true;
        return;
      }
      this.maxDate = false;
    }
    else if (this.numberOfDoses === '1' && this.vaccinationStatus === this.vaccinatedWithBooster) {
      const days = 1; // Number of days to eliminate
      const doseDateNew = new Date(doseDate); // Convert doseDate to proper date format
      // Calculate date to eliminate first dose date from second dose date
      const last = new Date(doseDateNew.getTime() + (days * 24 * 60 * 60 * 1000));
      const boosterDoseMinDate = format(last, 'yyyy-MM-dd');
      const todaysDateString = format(new Date(), 'yyyy-MM-dd');
      this.boosterDoseMinDate = boosterDoseMinDate;

      // Compare doseOneDate with today's date
      if (this.doseOneDate === todaysDateString) {
        this.boosterMaxDate = true;
        return;
      }
      this.boosterMaxDate = false;
    }
  }

  onSecondDoseDateChange(doseDate: Date) {
    this.doseTwoDate = format(new Date(doseDate), 'yyyy-MM-dd');
    if (this.vaccinationStatus === this.vaccinatedWithBooster) {
      const days = 1; // Number of days to eliminate
      const doseDateNew = new Date(doseDate); // Convert doseDate to proper date format
      // Calculate date to eliminate first dose date from second dose date
      const last = new Date(doseDateNew.getTime() + (days * 24 * 60 * 60 * 1000));
      const boosterDoseMinDate = format(last, 'yyyy-MM-dd');
      const todaysDateString = format(new Date(), 'yyyy-MM-dd');
      this.boosterDoseMinDate = boosterDoseMinDate;

      // Compare doseOneDate with today's date
      if (this.doseTwoDate === todaysDateString) {
        this.boosterMaxDate = true;
        return;
      }
      this.boosterMaxDate = false;
    }
  }

  uploadFile($event): void {
    this.pcrEvidence = $event.target.files[0];
    if (!this.pcrEvidence) {
      this.showToastMessage('Error: File cannot be empty!', 'danger');
      return;
    }
    if (this.pcrEvidence.size > 2000000) {
      this.showToastMessage('Error: Maximum File size is 2 MB. Please upload another file', 'danger');
      this.pcrEvidence = null;
    }
  }

  onSubmit() {
    this.presentLoading();
    const body = new FormData();
    // Vaccinated with Booster
    if (this.vaccinationStatus === this.vaccinatedWithBooster) {
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
      if (this.numberOfDoses === '2') {
        const doseTwoDate = new Date(this.doseTwoDate);
        body.append('dose2_date', format(doseTwoDate, 'yyyy-MM-dd'));
      }
      body.append('vaccine_type_booster', this.boosterType.toString());
      const boosterDate = new Date(this.boosterDate);
      body.append('booster_date', format(boosterDate, 'yyyy-MM-dd'));
    }
    // Fully vaccinated without Booster
    else if (this.vaccinationStatus === this.fullyVaccinated) {
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
      body.append('pcr_result', this.pcrResult);
      const pcrDate = new Date(this.pcrEvidenceDate);
      body.append('pcr_date', format(pcrDate, 'yyyy-MM-dd'));
      body.append('pcr_evidence', this.pcrEvidence);
      if (this.numberOfDoses === '2') {
        const doseTwoDate = new Date(this.doseTwoDate);
        body.append('dose2_date', format(doseTwoDate, 'yyyy-MM-dd'));
      }
    }
    // Partially Vaccinated - One Shot
    else if (this.vaccinationStatus === this.partiallyVaccinated) {
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
      body.append('pcr_result', this.pcrResult);
      const pcrDate = new Date(this.pcrEvidenceDate);
      body.append('pcr_date', format(pcrDate, 'yyyy-MM-dd'));
      body.append('pcr_evidence', this.pcrEvidence);
    }
    // Not Vaccinated
    else if (this.vaccinationStatus === this.notVaccinated) {
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('pcr_result', this.pcrResult);
      const pcrDate = new Date(this.pcrEvidenceDate);
      body.append('pcr_date', format(pcrDate, 'yyyy-MM-dd'));
      body.append('pcr_evidence', this.pcrEvidence);
    }
    if (body) {
      this.ws.post<any>('', { url: this.devUrl + '/user/add', body }).subscribe(
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

