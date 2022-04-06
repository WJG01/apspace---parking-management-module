import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize, map, Observable } from 'rxjs';

import { Storage } from '@ionic/storage-angular';
import { formatDistanceStrict } from 'date-fns';

import { ExamSchedule, Role, StudentProfile } from '../../interfaces';
import { ApiService, ComponentService, WsApiService } from '../../services';
import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-schedule',
  templateUrl: './exam-schedule.page.html',
  styleUrls: ['./exam-schedule.page.scss'],
})
export class ExamSchedulePage implements OnInit {

  exams$: Observable<ExamSchedule[]>;
  skeletons = new Array(3);
  intake: string;
  intakes: string[];

  constructor(
    private api: ApiService,
    private ws: WsApiService,
    private storage: Storage,
    private component: ComponentService,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    // const intake = this.settings.get('examIntake'); TODO: Renable This
    if (this.intake) {
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
        map(exams => {
          for (const exam of exams) {
            if (exam.endDate) {
              if (exam.examType === 'Non Exam') {
                exam.duration = formatDistanceStrict(new Date(exam.questionReleaseDate), new Date(exam.until));
                // return Object.assign(exam, { duration:  })
              } else if (exam.examType === 'Normal Exam') {
                exam.duration = formatDistanceStrict(new Date(exam.since), new Date(exam.until));
              }
            } else {
              if (exam.examType === 'Non Exam') {
                exam.duration = formatDistanceStrict(new Date(exam.questionReleaseDate), new Date(exam.until));
              } else if (exam.examType === 'Normal Exam') {
                exam.duration = formatDistanceStrict(new Date(exam.since), new Date(exam.until));
              }
            }
          }

          return exams;
        }),
        finalize(() => {
          if (refresher) {
            refresher.target.complete();
          }
        })
      );
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
      if (intake !== this.intake) {
        // TODO: Set Local Storage
        this.intake = intake;
        this.doRefresh();
      }
    }
  }
}
