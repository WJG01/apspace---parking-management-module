import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format } from 'date-fns';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { OrientationStudentDetails, Role, StaffProfile, StudentProfile } from '../../../interfaces';
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
  devUrl = 'https://9t7k8i4yu5.execute-api.ap-southeast-1.amazonaws.com/dev/covid19/user';

  // User Profile
  role: Role;
  isStudent: boolean;
  userProfile: any = {};
  staffProfile$: Observable<StaffProfile>;
  orientationStudentDetails$: Observable<OrientationStudentDetails>;

  // Dates
  todaysDate: string;

  // Input Response
  fullName: string;
  rtkResult: string;
  rtkEvidenceDate: string;
  rtkEvidence: File;
  constructor(
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private router: Router,
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
