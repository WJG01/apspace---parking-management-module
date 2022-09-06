import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Storage } from '@ionic/storage-angular';
import { format } from 'date-fns';

import { Role, StaffProfile, StudentProfile, UserVaccineInfo, VaccinationStatus, VaccinationType } from 'src/app/interfaces';
import { ComponentService, WsApiService } from '../../../services';

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
    private component: ComponentService
  ) {}

  ngOnInit() {
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
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo[]>('/covid19/user');
  }

  getVaccinationStatus() {
    this.vaccinationStatus$ = this.ws.get<VaccinationStatus[]>('/covid19/vaccine/status');
  }

  getVaccinationTypes() {
    this.vaccinationType$ = this.ws.get<VaccinationType[]>('/covid19/vaccine/type');
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
      this.ws.post<any>('/covid19/user/add', { body }).subscribe(
        () => {
          this.component.toastMessage('You have successfully submitted the form.', 'success');
          this.router.navigate(['/tabs/dashboard']);
        } ,
        () => {
          this.component.toastMessage('The form was not sent due to an error. Please contact IT Helpdesk.', 'danger');
          loading.dismiss();
        },
        () => loading.dismiss()
      );
    }
  }

  // QUICK ACCESS FUNCTIONS
  openCovidURL() {
    const url = 'https://apu.edu.my/explore-apu/covid-19-updates-advisory';

    this.component.openLink(url);
  }
}

