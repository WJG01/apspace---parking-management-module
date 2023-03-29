import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DmuFormContent,
  DmuFormRegistration,
  OrientationStudentDetails,
  Role,
  StaffDirectory,
  StaffProfile,
  StudentPhoto,
  StudentProfile
} from '../../interfaces';
import { NEVER, catchError, map, Observable, of, tap, timeout } from 'rxjs';
import { ComponentService, AppLauncherService, WsApiService, ConfigurationsService } from '../../services';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController } from '@ionic/angular';
import { VirtualCardModalPage } from './virtual-card-modal/virtual-card-modal';
import { RequestChangeModalPage } from './request-update-modal/request-update-modal';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  photo$: Observable<StudentPhoto>;
  profile$: Observable<StudentProfile>;
  staffProfile$: Observable<StaffProfile[]>;
  counselorProfile$: Observable<StaffDirectory>;
  orientationStudentDetails$: Observable<OrientationStudentDetails>;
  visa$: Observable<any>;

  indicator = false;
  skeletons = [80, 30, 100, 45, 60, 76];
  intakeModified = false;
  timetableAndExamScheduleIntake = '';
  local = true; // Set the initial value to true so the Visa status does not flash
  studentRole = false;
  countryName: string;
  showOrientationProfile = false;
  file: File;
  loading: HTMLIonLoadingElement;


  registration$: Observable<DmuFormRegistration>;
  form$: Observable<DmuFormContent>;
  dmuNeeded$: Observable<boolean>;

  constructor(
    private storage: Storage,
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private alertCtrl: AlertController,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private appLauncher: AppLauncherService,
    private router: Router,
    private config: ConfigurationsService
  ) { }

  ngOnInit() {
    this.indicator = true;
  }

  ionViewDidEnter() {
    /*
    * The page's response is very huge, which is causing issues on ios if we use oninit
    * the indecitor is used to define if the page should call the dorefresh of not
    * If we do not use the indecitor, the page in the tabs (tabs/attendance) will be reloading every time we enter the tab
    */
    this.getProfile();
    this.dmuNeeded$ = this.isDmuNeeded();
    this.registration$ = this.getDmuRegistration();
    this.form$ = this.getDmuForm();
    this.config.goToTopEvent.subscribe({
      next: (tabPath) => {
        if (tabPath === 'profile') {
          this.content.scrollToTop(500);
        }
      }
    });
  }

  isDmuNeeded() {
    return this.ws.get<any>('/dmu_form/checkDmuForm');
  }

  getDmuRegistration() {
    return this.ws.get<DmuFormRegistration>('/dmu_form/getRegistration').pipe(
      catchError(_ => NEVER)
    );
  }

  getDmuForm() {
    return this.ws.get<DmuFormContent>('/dmu_form/getDmu');
  }

  getProfile() {
    if (this.indicator) {
      this.storage.get('role').then((role: Role) => {
        // tslint:disable-next-line:no-bitwise
        if (role & Role.Student) {
          this.studentRole = true;
          this.photo$ = this.ws.get<StudentPhoto>('/student/photo');
          this.profile$ = this.ws.get<StudentProfile>('/student/profile').pipe(
            map(studentProfile => {
              // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
              if (studentProfile.INTAKE.includes('(AP)') || studentProfile.INTAKE.includes('(BP)')) {
                this.intakeModified = true;
                this.timetableAndExamScheduleIntake = studentProfile.INTAKE.replace(/[(]AP[)]|[(]BP[)]/g, '');
              }
              return studentProfile;
            }),
            tap(p => {
              this.showOrientationProfile = true;
              this.orientationStudentDetails$ = this.ws.get<OrientationStudentDetails>(
                `/orientation/student_details?id=${p.STUDENT_NUMBER}`).pipe(
                timeout(800),
                catchError(err => {
                  // api returns 401 when student should not access this orientation form
                  this.showOrientationProfile = false;
                  return of(err);
                }),
                tap(studentOrientationDetails => {
                  if (studentOrientationDetails.councelor_details !== undefined && studentOrientationDetails.councelor_details.length > 0) {
                    this.counselorProfile$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).pipe(
                      map(res =>
                        res.find(staff =>
                          staff.ID.toLowerCase() === studentOrientationDetails.councelor_details[0].SAMACCOUNTNAME.toLowerCase()
                        )
                      )
                    );
                  } else {
                    this.showOrientationProfile = false;
                  }
                })
              );
            }),
            tap(p => {
              this.countryName = p.COUNTRY;
              if (p.COUNTRY === 'Malaysia') {
                this.local = true;
              } else {
                this.local = false;
                this.visa$ = this.getVisaStatus();
              }
            }),
          );
          // tslint:disable-next-line:no-bitwise
          this.profile$.subscribe(res => {
          });
        } else if (role & (Role.Lecturer | Role.Admin)) {
          this.staffProfile$ = this.ws.get<StaffProfile[]>('/staff/profile');
        }
      });
      this.indicator = false;
    }
  }

  openStaffDirectoryInfo(id: string) {
    this.router.navigate(['/staffs', id]);
  }

  getVisaStatus() {
    return this.ws.get<any>('/student/visa_status', { caching: 'cache-only' });
  }

  comingFromTabs() {
    if (this.router.url.split('/')[1].split('/')[0] === 'tabs') {
      return true;
    }
    return false;
  }

  // tslint:disable-next-line: max-line-length
  async change(
    itemToChange: 'STUDENT_EMAIL' | 'STUDENT_MOBILE_NO' | 'RELIGION' | 'STUDENT_PERMANENT_ADDRESS'
      | 'PARENTS_NAME' | 'PARENTS_RELATIONSHIP' | 'PARENTS_MOBILE_TEL' | 'PARENTS_EMAIL'
      | 'GUARDIAN_NAME' | 'GUARDIAN_RELATIONSHIP' | 'GUARDIAN_MOBILE_TEL' | 'GUARDIAN_EMAIL',
    value: string, studentID: string
  ) {

    const alert = await this.alertCtrl.create({
      header: `UPDATE ${itemToChange.replace(/_/g, ' ')}`,
      message: 'Please enter the new value:',
      inputs: [
        {
          name: 'newValue',
          value,
          type: itemToChange === 'STUDENT_EMAIL' ? 'email' : itemToChange === 'STUDENT_MOBILE_NO' ? 'tel' : 'text',
          placeholder: `NEW ${itemToChange.replace(/_/g, ' ')} VALUE`
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary-txt-color',
          handler: () => { }
        }, {
          text: 'Update',
          handler: (data) => {
            if (!data.newValue) {
              this.component.toastMessage('New Value Cannot Be Empty!!', 'danger');
            } else {
              this.presentLoading();
              const body = {};
              body[itemToChange] = data.newValue;
              this.ws.post(`/orientation/update_profile?id=${studentID}`,
                { body }
              ).subscribe(
                _ => this.component.toastMessage(`${itemToChange} Has Been Updated Successfully!`, 'success'),
                err => {
                  this.component.toastMessage(`Error: ${err.error.errors[0].message}`, 'danger');
                  this.dismissLoading();
                },
                () => {
                  this.indicator = true;
                  this.dismissLoading();
                  this.getProfile();
                }
              );
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async requestChange(orientationProfile: OrientationStudentDetails) {
    const modal = await this.modalCtrl.create({
      component: RequestChangeModalPage,
      cssClass: 'custom-modal-style',
      componentProps: { orientationProfile }
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  chatTeams(staffEmail: string) {
    this.appLauncher.chatInTeams(staffEmail);
  }

  changeListener($event): void {
    this.file = $event.target.files[0];
  }

  uploadDocument(STUDENT_NAME: string, COUNSELLOR_NAME: string, COUNSELLOR_EMAIL: string) {
    if (!this.file) {
      this.component.toastMessage('Error: File Cannot Be Empty!!', 'danger');
    } else {
      if (this.file.size > 1500000) {
        this.component.toastMessage('Error: Maximum File Size is 1.5MB', 'danger');
      } else if (this.file.type === 'application/pdf' || this.file.type === 'image/jpeg' || this.file.type === 'image/png') {
        this.presentLoading();
        const reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = () => {
          const body = { STUDENT_NAME, COUNSELLOR_EMAIL, COUNSELLOR_NAME, DOCUMENT: reader.result };
          this.ws.post<any>(`/orientation/profile_change_request`, { body }).subscribe(
            () => this.component.toastMessage('Your Request Has Been Submitted Successfully. Your E-COUNSELLOR Will Review It And Get Back To You As Soon As Possible.', 'success'),
            () => {
              this.component.toastMessage('Something Went Wrong From Our Side. Please Contact Your E-COUNSELLOR And Inform Him/Her About The Issue', 'danger');
              this.dismissLoading();
            },
            () => this.dismissLoading()
          );
        };
      } else {
        this.component.toastMessage('Error: File Format is not supported. File Format Should Be Either .png, .jpeg, or .pdf', 'danger');
      }

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

  openDmuFormModal() {
    this.router.navigate(['/profile/dmu-form']);
  }

  async virtualCardModal(profile: any, studentRole: boolean) {
    const modal = await this.modalCtrl.create({
      component: VirtualCardModalPage,
      cssClass: 'virtual-card-modal',
      componentProps: {
        profile,
        studentRole
      }
    });
    return await modal.present();
  }

}
