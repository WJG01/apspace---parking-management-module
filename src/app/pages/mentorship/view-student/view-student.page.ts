import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { StaffProfile, StudentProfile } from 'src/app/interfaces';
import { MentorshipCourseDetail, MentorshipIntake, StudentRemark } from 'src/app/interfaces/mentorship';
import { MentorshipService } from 'src/app/services/mentorship.service';
import { AppLauncherService, WsApiService } from '../../../services';
import { AddRemarksModalPage } from './add-remarks-modal/add-remarks-modal.page';
import { EditRemarksModalPage } from './edit-remarks-modal/edit-remarks-modal.page';
import { ShowDetailsPage } from './show-details/show-details.page';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.page.html',
  styleUrls: ['./view-student.page.scss']
})
export class ViewStudentPage {
  tp: string;
  staffID: string;
  selectedIntake: string;
  search: '';

  staffProfile$: Observable<StaffProfile>;
  profile$: Observable<StudentProfile>;
  intake$: Observable<MentorshipIntake[]>;
  selectedIntake$: Observable<MentorshipIntake[]>;
  studentRemarks$: Observable<StudentRemark[]>;

  courseDetail$: Observable<MentorshipCourseDetail[]>;
  subCourse$: Observable<{ index: string; value: any }[]>;
  profileSkeleton = new Array(4);

  allFilters = ['low-attendance', 'full-attendance', 'failed', 'full-cgpa'];

  shownFilters: string[];

  constructor(
    private mentorship: MentorshipService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private appLauncherService: AppLauncherService
  ) {}

  ionViewDidEnter() {
    this.tp = this.route.snapshot.params.tp;
    this.selectedIntake = this.route.snapshot.params.intake;
    this.profile$ = this.mentorship.getStudentProfile(this.tp);
    this.intake$ = this.mentorship.getIntakes(this.tp);
    this.getStaffProfile();
    this.studentRemarks$ = this.staffProfile$.pipe(
      switchMap(staffProfile => {
        return this.mentorship.getStudentRemarks(this.tp).pipe(
          map((studentRemarkArray) => {
            return studentRemarkArray.map((studentRemarkObject: StudentRemark) => {
              if (staffProfile[0].ID === studentRemarkObject.SAMACCOUNTNAME) {
                studentRemarkObject.CAN_EDIT = true;
                return studentRemarkObject;
              } else {
                return studentRemarkObject;
              }
            });
          })
        );
      })
    );
    this.onTap(this.selectedIntake);
    this.runModifierForSelect();
  }

  getStaffProfile() {
    this.staffProfile$ = this.ws.get<StaffProfile>('/staff/profile');
  }

  runModifierForSelect() {
    // Remove the stupid select-icon, select-text
    const ionSelects = document.querySelectorAll('ion-select');
    ionSelects.forEach((select) => {
      const selectIconInner = select.shadowRoot.querySelector('.select-icon');
      const selectTextInner =  select.shadowRoot.querySelector('.select-text');

      if (selectTextInner && selectIconInner) {
        selectIconInner.parentNode.removeChild(selectIconInner);
        selectTextInner.parentNode.removeChild(selectTextInner);
      }
    });
  }

  removeFilter(value: string) {
    this.shownFilters = this.shownFilters.filter(item => item !== value);
  }

  sortResult(results: any, courseSummary: any) {
    // tslint:disable-next-line: max-line-length
    const dataBySemester = results.reduce(
      (acc: any, result: any) => (
        (acc[result.SEMESTER] = (acc[result.SEMESTER] || []).concat(result)),
        acc
      ),
      {}
    );

    const summaryBySemester = courseSummary.reduce(
      (acc: any, result: any) => (
        (acc[result.SEMESTER] = (acc[result.SEMESTER] || []).concat(result)),
        acc
      ),
      {}
    );

    return Object.keys(dataBySemester).map(index => ({
      index,
      value: dataBySemester[index] || [],
      summary: summaryBySemester[index] || []
    }));
  }

  onTap(intake: string) {
    this.selectedIntake = intake;
    this.courseDetail$ = this.mentorship.getStudentCourse(this.tp, intake);
    this.selectedIntake$ = this.intake$.pipe(
      map(items => items.filter(item => item.INTAKE_CODE === intake))
    );

    this.subCourse$ = forkJoin([
      this.mentorship.getSubcourse(this.tp, intake),
      this.mentorship.getSemesterSummary(this.tp, intake),
    ]).pipe(
      map(([subcourse, details]) => this.sortResult(subcourse, details))
    );
  }

  showDetails(module: string) {
    this.presentModal(module);
  }

  async presentModal(moduleCode: string) {
    const modal = await this.modalCtrl.create({
      component: ShowDetailsPage,
      cssClass: 'glob-partial-page-modal',
      componentProps: {
        intake: this.selectedIntake,
        module: moduleCode,
        tp: this.tp
      }
    });
    return await modal.present();
  }

  async presentAddRemarks(studentID: string) {
    const modal = await this.modalCtrl.create({
      component: AddRemarksModalPage,
      componentProps: {
        studentID
      }
    });
    return await modal.present();
  }

  chatInTeams(studentID: string) {
    const androidSchemeUrl = 'com.microsoft.teams';
    const iosSchemeUrl = 'microsoft-teams://';
    const webUrl = `https://teams.microsoft.com/l/chat/0/0?users=${studentID}@mail.apu.edu.my`;
    const appStoreUrl = 'https://itunes.apple.com/us/app/microsoft-teams/id1113153706?mt=8';
    const appViewUrl = 'https://teams.microsoft.com/l/chat/0/0?users=';
    // tslint:disable-next-line: max-line-length
    const playStoreUrl = `https://play.google.com/store/apps/details?id=com.microsoft.teams&hl=en&referrer=utm_source%3Dgoogle%26utm_medium%3Dorganic%26utm_term%3D'com.microsoft.teams'&pcampaignid=APPU_1_NtLTXJaHKYr9vASjs6WwAg`;
    this.appLauncherService.launchExternalApp(
      iosSchemeUrl,
      androidSchemeUrl,
      appViewUrl,
      webUrl,
      playStoreUrl,
      appStoreUrl,
      `${studentID}@mail.apu.edu.my`);
  }

  async presentEditRemarks(studentID: string, remarks: string, staffID: string, remarksDate: string) {
    const modal = await this.modalCtrl.create({
      component: EditRemarksModalPage,
      componentProps: {
        studentID,
        remarks,
        staffID,
        remarksDate
      }
    });
    return await modal.present();
  }
}
