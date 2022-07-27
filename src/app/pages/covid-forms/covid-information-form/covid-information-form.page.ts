import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

import { Role, StaffProfile, StudentProfile } from 'src/app/interfaces';
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
  studentRole: boolean;
  isCordova: boolean;
  isStudent: boolean;
  userProfile: any = {};
  staffProfile$: Observable<StaffProfile>;
  studentProfile$: Observable<StudentProfile>;

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
  other = 8;

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
    private iab: InAppBrowser,
    private platform: Platform,
  ) {}

  ngOnInit() {
    this.isCordova = this.platform.is('cordova');
    this.todaysDate = format(new Date(), 'yyyy-MM-dd');
    this.getVaccinationStatus();
    this.getVaccinationTypes();
    this.getUserVaccinationInfo();
  }

  ionViewDidEnter() {
    this.getProfile();
  }

  getProfile() {
    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line:no-bitwise
      if (role & Role.Student) {
        this.studentRole = true;
        this.studentProfile$ = this.ws.get<StudentProfile>('/student/profile');
        this.studentProfile$.subscribe(student => this.fullName = student.NAME);
        // tslint:disable-next-line:no-bitwise
      } else if (role & (Role.Lecturer | Role.Admin)) {
        this.staffProfile$ = this.ws.get<StaffProfile>('/staff/profile');
        this.staffProfile$.subscribe(staff => this.fullName = staff[0].FULLNAME);
      }
    });
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
    this.vaccinationType$.subscribe( res => res.map(vaccine =>
      vaccine.id === this.vaccinationType && (this.numberOfDoses = vaccine.number_of_dose.toString()))
    );
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
    // Commented since pcr not compulsory now
    // if (!this.pcrEvidence) {
    //   this.showToastMessage('Error: File cannot be empty!', 'danger');
    //   return;
    // }
    if (this.pcrEvidence.size > 2000000) {
      this.showToastMessage('Error: Maximum File size is 2 MB. Please upload another file', 'danger');
      this.pcrEvidence = null;
    }
  }

  onSubmit() {
    this.presentLoading();
    const body = new FormData();
    body.append('full_name', this.fullName);
    body.append('vaccination_status', this.vaccinationStatus.toString());
    // Vaccinated with Booster
    if (this.vaccinationStatus === this.vaccinatedWithBooster) {
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
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
      if (this.numberOfDoses === '2') {
        const doseTwoDate = new Date(this.doseTwoDate);
        body.append('dose2_date', format(doseTwoDate, 'yyyy-MM-dd'));
      }
    }
    // Partially Vaccinated - One Shot
    else if (this.vaccinationStatus === this.partiallyVaccinated) {
      body.append('vaccine_type', this.vaccinationType.toString());
      body.append('dose1_date', this.doseOneDate);
    }
    if (this.pcrEvidence) {
      body.append('pcr_result', this.pcrResult);
      const pcrDate = new Date(this.pcrEvidenceDate);
      body.append('pcr_date', format(pcrDate, 'yyyy-MM-dd'));
      body.append('pcr_evidence', this.pcrEvidence);
    }
    // Not Vaccinated got nothing exceptional for now
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

  // QUICK ACCESS FUNCTIONS
  openCovidURL() {
    const url = 'https://apu.edu.my/explore-apu/covid-19-updates-advisory';
    if (this.isCordova) {
      this.iab.create(url, '_system');
    } else {
      this.iab.create(url, '_blank');
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

