import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format } from 'date-fns';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { OrientationStudentDetails, Role, StaffProfile, StudentProfile } from '../../../interfaces';
import { UserVaccineInfo, VaccinationStatus, VaccinationType } from '../../../interfaces/covid-forms';
import { WsApiService } from '../../../services';

@Component({
  selector: 'app-covid-vaccination-status-form',
  templateUrl: './covid-vaccination-status-form.page.html',
  styleUrls: ['./covid-vaccination-status-form.page.scss'],
})
export class CovidVaccinationStatusFormPage implements OnInit {
  loading: HTMLIonLoadingElement;
  // User Profile
  role: Role;
  isStudent: boolean;
  userProfile: any = {};
  staffProfile$: Observable<StaffProfile>;
  orientationStudentDetails$: Observable<OrientationStudentDetails>;

  // Vaccination
  vaccinationStatus$: Observable<VaccinationStatus[]>;
  vaccinationType$: Observable<VaccinationType[]>;
  userVaccinationInfo$: Observable<UserVaccineInfo[]>;
  vaccinationStatusProfile: any = {};

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

  disableNotVaccinated: boolean;
  disablePartiallyVaccinated: boolean;
  disableFullyVaccinated: boolean;
  disableVaccinatedWithBooster: boolean;

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

  constructor(
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private storage: Storage,
    private toastCtrl: ToastController,
  ) { }

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
  }

  doRefresh(refresher?) {
    const forkJoinArray = [this.getProfile(refresher)];
    this.getUserVaccinationInfo();
    forkJoin(forkJoinArray).pipe(
      finalize(() => refresher && refresher.target.complete()),
    ).subscribe();
  }

  ionViewDidEnter() {
    console.log(this.vaccinationStatusProfile);
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
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo[]>('/covid19/user').pipe(
      tap(vaccinationProfile => this.vaccinationStatusProfile = vaccinationProfile)
    );
    this.checkExistingVaccineStatus();
  }

  getVaccinationStatus() {
    this.vaccinationStatus$ = this.ws.get<VaccinationStatus[]>('/covid19/vaccine/status');
  }

  getVaccinationTypes() {
    this.vaccinationType$ = this.ws.get<VaccinationType[]>('/covid19/vaccine/type');
  }

  // Returns date from 7 days ago
  getDate() {
    const days = 6;
    const todaysDate = new Date();
    const last = new Date(todaysDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const lastDay = format(last, 'yyyy-MM-dd');
    return lastDay;
  }

  checkExistingVaccineStatus() {
    if (this.vaccinationStatusProfile.vaccine_status_id === this.notVaccinated) {
      this.disableNotVaccinated = true;
    }
    // Partially Vaccinated
    else if (this.vaccinationStatusProfile.vaccine_status_id === this.partiallyVaccinated) {
      this.disablePartiallyVaccinated = true;
    }
    // Fully Vaccinated
    else if (this.vaccinationStatusProfile.vaccine_status_id === this.fullyVaccinated) {
      this.disableFullyVaccinated = true;
    }
    // Fully Vaccinated with booster
    else if (this.vaccinationStatusProfile.vaccine_status_id === this.vaccinatedWithBooster) {
      this.disableVaccinatedWithBooster = true;
    }
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
    const days = 1; // Number of days to eliminate
    const doseDateNew = new Date(doseDate); // Convert doseDate to proper date format
    // Calculate date to eliminate first dose date from second dose date
    const last = new Date(doseDateNew.getTime() + (days * 24 * 60 * 60 * 1000));
    const secondDoseMinDate = format(last, 'yyyy-MM-dd');

    this.doseOneDate = format(new Date(doseDate), 'yyyy-MM-dd');
    const todaysDateString = format(new Date(), 'yyyy-MM-dd');
    this.secondDoseMinDate = secondDoseMinDate;

    // Compare doseOneDate with today's date
    if (this.doseOneDate === todaysDateString) {
      this.maxDate = true;
      return;
    }
    this.maxDate = false;
  }

  onSecondDoseDateChange(doseDate: Date) {
    const days = 1; // Number of days to eliminate
    const doseDateNew = new Date(doseDate); // Convert doseDate to proper date format
    // Calculate date to eliminate first dose date from second dose date
    const last = new Date(doseDateNew.getTime() + (days * 24 * 60 * 60 * 1000));
    const boosterDoseMinDate = format(last, 'yyyy-MM-dd');

    this.doseTwoDate = format(new Date(doseDate), 'yyyy-MM-dd');
    const todaysDateString = format(new Date(), 'yyyy-MM-dd');
    this.boosterDoseMinDate = boosterDoseMinDate;

    // Compare doseOneDate with today's date
    if (this.doseTwoDate === todaysDateString) {
      this.boosterMaxDate = true;
      return;
    }
    this.boosterMaxDate = false;
  }

  onSubmit() {
    const body = new FormData();
    // Vaccinated with Booster
    if (this.vaccinationStatus === this.vaccinatedWithBooster) {
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
      body.append('vaccine_type_booster', this.boosterType.toString());
      const boosterDate = new Date(this.boosterDate);
      body.append('booster_date', format(boosterDate, 'yyyy-MM-dd'));
      if (this.numberOfDoses === '2') {
        const doseTwoDate = new Date(this.doseTwoDate);
        body.append('dose2_date', format(doseTwoDate, 'yyyy-MM-dd'));
      }
    }
    // Fully vaccinated without Booster
    else if (this.vaccinationStatus === this.fullyVaccinated) {
      this.presentLoading();
      body.append('full_name', this.fullName);
      body.append('vaccination_status', this.vaccinationStatus.toString());
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
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
    }
    if (body) {
      this.ws.post<any>('/covid19/user/add', {body}).subscribe(
        () => {
          this.showToastMessage('You have successfully submitted the form.', 'success');
          this.navCtrl.navigateForward('/tabs/dashboard');
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
