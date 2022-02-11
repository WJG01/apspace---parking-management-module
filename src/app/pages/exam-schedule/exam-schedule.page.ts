import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { isValid } from 'date-fns';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { ExamSchedule, Role, StudentProfile } from '../../interfaces';
import { IntakeListingService, SettingsService, WsApiService } from '../../services';
import { ExamDurationPipe } from '../exam-schedule-admin/add-exam-schedule/exam-duration.pipe';


@Component({
  selector: 'app-exam-schedule',
  templateUrl: './exam-schedule.page.html',
  styleUrls: ['./exam-schedule.page.scss'],
})
export class ExamSchedulePage {
  exam$: Observable<ExamSchedule[]>;
  examDuration: string;
  intake: string;
  intakes: string[];
  selectedIntake: string;
  // devURL = 'https://jhxum5z8ya.execute-api.ap-southeast-1.amazonaws.com/dev/';
  showNoIntakeMessage = false;
  skeletons = new Array(5);

  devUrl = 'https://jhxum5z8ya.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    public plt: Platform,
    private modalCtrl: ModalController,
    private il: IntakeListingService,
    private ws: WsApiService,
    private settings: SettingsService,
    private storage: Storage,
    private iab: InAppBrowser
  ) { }

  /** Check and update intake on change. */
  changeIntake(intake: string) {
    if (intake !== this.intake) {
      this.showNoIntakeMessage = false;
      this.settings.set('examIntake', this.intake = intake);
      this.doRefresh();
    }
  }
  ionViewDidEnter() { // using oninit is casing some issues in naviagting to this page; the data loaded is huge (intake listing)
    const intake = this.settings.get('examIntake');
    if (intake !== undefined && intake !== null) { // intake might be ''
      this.intake = intake;
      this.doRefresh();
    } else {
      this.storage.get('role').then((role: Role) => {
        /* tslint:disable:no-bitwise */
        if (role & Role.Student) {

          /* tslint:enable:no-bitwise */
          this.ws.get<StudentProfile>('/student/profile').subscribe(p => {
            // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
            this.intake = p.INTAKE.replace(/[(]AP[)]|[(]BP[)]/g, '');
          },
            (_) => { },
            () => this.doRefresh()
          );
        } else {
          this.doRefresh();
          this.showNoIntakeMessage = true;
        }
      });
    }
  }
  doRefresh(refresher?) {
    const url = `/examination/${this.intake}`;
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    if (this.intake) {
      this.exam$ = this.ws.get<ExamSchedule[]>(url, { auth: false, caching, url: this.devUrl }).pipe(
        map(res => {
          res.forEach(exam => {
            if (exam.endDate) {
              if (exam.examType === 'Non Exam'){
                return Object.assign(
                  exam, {duration: this.showDuration(new Date(exam.questionReleaseDate), new Date(`${exam.endDate}T${exam.until.split('T')[1]}`))}
                );
              }
              else if (exam.examType === 'Normal Exam'){
                return Object.assign(
                  exam, {duration: this.showDuration(new Date(exam.since), new Date(`${exam.endDate}T${exam.until.split('T')[1]}`))}
                );
              }
            } else {
              if (exam.examType === 'Non Exam'){
                return Object.assign(
                  exam, {duration: this.showDuration(new Date(exam.questionReleaseDate), new Date(`${exam.endDate}T${exam.until.split('T')[1]}`))}
                );
              }
              else if (exam.examType === 'Normal Exam'){
                return Object.assign(
                  exam, {duration: this.showDuration(new Date(exam.since), new Date(`${exam.endDate}T${exam.until.split('T')[1]}`))}
                );
              }
            }
          });
          return res;
        }),
        finalize(() => (refresher && refresher.target.complete())),
      );
      this.il.get(refresher).subscribe(ii => {
        this.intakes = ii.map(i => i.INTAKE_CODE);
      });
    } else {
      this.il.get(refresher).pipe(
        finalize(() => (refresher && refresher.target.complete()))
      ).subscribe(ii => {
        this.intakes = ii.map(i => i.INTAKE_CODE);
      });
    }

  }
  async presentIntakeSearch() {
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      // TODO: store search history
      componentProps: { items: this.intakes, notFound: 'No Intake Selected' },
    });
    await modal.present();
    // default item to current intake if model dismissed without data
    const { data: { item: intake } = { item: this.intake } } = await modal.onDidDismiss();
    if (intake) {
      this.changeIntake(intake);
    }
  }

  showDuration(formattedStartDate: Date, formattedEndDate: Date) {
    const duration = new ExamDurationPipe().transform(formattedStartDate, formattedEndDate);

    if (isValid(formattedStartDate) && isValid(formattedEndDate)) {
      this.examDuration = duration;
      return this.examDuration;
    }
  }


    openGuidlines() {
    this.iab.create('https://kb.sites.apiit.edu.my/knowledge-base/examination-guidelines/', '_system', 'location=true');
  }
}
