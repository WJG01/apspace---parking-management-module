import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { finalize, map, Observable } from 'rxjs';
import { isValid } from 'date-fns';

import { Storage } from '@ionic/storage-angular';
import { formatDistanceStrict } from 'date-fns';

import { ExamSchedule, Role, StudentProfile } from '../../interfaces';
import { ApiService, ComponentService, SettingsService, WsApiService } from '../../services';
import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { ExamDurationPipe } from '../exam-schedule-admin/add-exam-schedule/exam-duration.pipe';

@Component({
  selector: 'app-exam-schedule',
  templateUrl: './exam-schedule.page.html',
  styleUrls: ['./exam-schedule.page.scss'],
})
export class ExamSchedulePage implements OnInit {

  exams$: Observable<ExamSchedule[]>;
  examDuration: string;
  skeletons = new Array(3);
  intake: string;
  intakes: string[];

  constructor(
    private api: ApiService,
    private ws: WsApiService,
    private storage: Storage,
    private component: ComponentService,
    private modalCtrl: ModalController,
    private router: Router,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    const intake = this.settings.get('examIntake');

    if (intake !== undefined && intake !== null) {
      this.intake = intake;
      this.doRefresh();
    } else {
      this.storage.get('role').then((role: Role) => {
        if (role & Role.Student) {
          this.ws.get<StudentProfile>('/student/profile').subscribe(u => {
            // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
            this.intake = u.INTAKE.replace(/[(]AP[)]|[(]BP[)]/g, '');

            if (this.intake) {
              this.doRefresh();
            }
          });
        } else {
          this.doRefresh();
        }
      })
    }
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    this.api.getIntakes(refresher).pipe(
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    ).subscribe(il => this.intakes = il.map(i => i.INTAKE_CODE));

    if (this.intake) {
      this.exams$ = this.ws.get<ExamSchedule[]>(`/examination/${this.intake}`, { auth: false, caching }).pipe(
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
        finalize(() => {
          if (refresher) {
            refresher.target.complete();
          }
        })
      );
    }
  }

  changeIntake(intake: string) {
    if (intake !== this.intake) {
      this.settings.set('examIntake', this.intake = intake);
      this.doRefresh();
    }
  }

  openFeedback() {
    this.router.navigateByUrl('/feedback');
  }

  openGuidlines() {
    this.component.openLink('https://kb.sites.apiit.edu.my/knowledge-base/examination-guidelines')
  }

  async openIntakeSearch() {
    // TODO: store search history
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items: this.intakes,
        notFound: 'No Intake Selected'
      },
    });
    await modal.present();

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
}
