import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BeAPUStudentDetails } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-filing-report',
  templateUrl: './filing-report.page.html',
  styleUrls: ['./filing-report.page.scss'],
})

export class FilingReportPage implements OnInit {
  studentDetails$: Observable<BeAPUStudentDetails[]>;
  studentRecords$: Observable<any>; // records are too long & complicated and keys are numbers
  disableNextButton = false;
  studentName = '';
  skeletons = new Array(3);
  loading: HTMLIonLoadingElement;
  mainCategories = [
    'Attire',
    'Behaviour',
  ];
  subCategories = [
    { title: 'Jogging pants, Cargo pants, Yoga pants, Gym tights/Leotards, Sports tights', show: 'always' },
    { title: 'No Student ID Card', show: 'always' },
    { title: 'Jeans/Pants with Denim Material', show: 'Monday-Thursday' },
    { title: 'Collared  & Activity T-shirts', show: 'Monday-Thursday' },
    { title: 'Sandals (Male), Slippers, Flip-Flops, Slip-ons', show: 'always' },
    { title: 'Short pants', show: 'always' },
    { title: 'Revealing Blouses (Bare-back, Off-shoulder, Crop-top, Deep-V, Spaghetti Strap)', show: 'always' },
    { title: 'Piercing except for ears/nose', show: 'always' },
    { title: 'Ripped/Torn jeans', show: 'always' },
    { title: 'Round neck T-shirts', show: 'always' },
    { title: 'Caps, Hats, Non-customary Headgears', show: 'always' },
  ];
  locations = [
    'Academic Offices',
    'Admin Services Office',
    'Auditoriums',
    'Bursary & Finance Service Counters',
    'Career Services Office',
    'Classrooms',
    'Corridors & Open Spaces within Teaching Blocks',
    'Exam Halls',
    'Immigration Services Office',
    'Laboratories & Workshops',
    'Lecture Halls',
    'Libraries',
    'Student Services Office',
  ];

  days = ['Monday-Thursday', 'Friday'];
  studentId = 'TP';
  description = '';
  selectedMainCategory = this.mainCategories[0];
  selectedSubCategory = this.subCategories[0].title;
  selectedDay = new Date().getDay() !== 5 ? this.days[0] : this.days[1];
  selectedLocation = this.locations[0];
  totalSteps = new Array(3);
  currentStepNumber = 0;
  constructor(
    private loadingController: LoadingController,
    public platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private ws: WsApiService,
    private iab: InAppBrowser
  ) { }

  ngOnInit() { }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'dots',
      duration: 90000,
      message: 'Submitting the report...',
      translucent: true,
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }

  showToastMessage(message: string, color: 'danger' | 'success') {
    this.toastCtrl.create({
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
    }).then(toast => toast.present());
  }

  nextStep() {
    this.currentStepNumber++;
    // for Demo. It will be removed after the backend created
    if (this.currentStepNumber === 1) {
      this.studentDetails$ = this.ws.post<BeAPUStudentDetails[]>('/student/image', {
        body: {
          id: [this.studentId]
        }
      }).pipe(
        tap(studentDetails => {
          if (studentDetails.length === 0) {
            this.disableNextButton = true;
          } else {
            this.studentName = studentDetails[0].name;
            this.disableNextButton = false;
          }
        })
      );
      this.studentRecords$ = this.ws.get(`/dresscode/history?student_id=${this.studentId}`);
    }
  }

  cancel() {
    this.studentId = 'TP';
    this.currentStepNumber = 0;
    this.description = '';
  }

  submitReport() {
    this.alertCtrl.create({
      header: 'Confirm!',
      subHeader: `You are about to file a report against the student with ID ${this.studentId}. Do you want to continue?`,
      buttons: [
        {
          text: 'No',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            // START THE LOADING
            if (this.selectedMainCategory === this.mainCategories[1]) {
              this.selectedSubCategory = ''; // subcategory is not needed when submitting anything for behaviour
            }
            this.presentLoading();
            const body = {
              student_id: this.studentId,
              description: this.description,
              location: this.selectedLocation,
              day: this.selectedDay,
              category: this.selectedMainCategory,
              sub_category: this.selectedSubCategory,
              student_name: this.studentName
            };
            this.ws.post('/dresscode/submit', {
              body
            }).subscribe(
              {
                error: err => {
                  this.showToastMessage(err.error.error, 'danger');
                  this.dismissLoading();
                },
                complete: () => {
                  this.showToastMessage('Report Submitted Successfully!', 'success');
                  this.emptyForm();
                  this.dismissLoading();
                },
              }
            );
            // this.showToastMessage('Report has been submitted successfully!', 'success');
            // this.cancel();
          }
        }
      ]
    }).then(confirm => confirm.present());
  }

  emptyForm() {
    this.selectedMainCategory = this.mainCategories[0];
    this.selectedSubCategory = this.subCategories[0].title;
    this.selectedDay = new Date().getDay() !== 5 ? this.days[0] : this.days[1];
    this.selectedLocation = this.locations[0];
    this.studentId = 'TP';
    this.description = '';
    this.currentStepNumber = 0; // navigate back to step 1
  }

  openStudentHandbook() {
    const studentHandbookUrl = 'https://cdn.webspace.apiit.edu.my/public/2019-12/APU%20Student%20Handbook%20vDec2019_0.pdf';
    this.iab.create(`${studentHandbookUrl}`, '_system', 'location=true');
  }
}
