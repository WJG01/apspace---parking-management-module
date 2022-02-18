import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { Attendance, AttendanceLegend, Course, MappedAttendance } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { AttendanceDetailsModalPage } from './attendance-details-modal/attendance-details-modal';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

  course$: Observable<Course[]>;
  attendance$: Observable<MappedAttendance[]>;
  legend$: Observable<AttendanceLegend>;
  studentIntakes: string[] = [];
  selectedIntake: string;
  average: number;
  skeletons = new Array(5);

  constructor(
    private ws: WsApiService,
    public actionSheetCtrl: ActionSheetController,
    private router: Router,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    this.studentIntakes = [];

    this.course$ = this.ws.get<Course[]>('/student/courses', { caching: 'network-or-cache' }).pipe(
      tap(intakes => {
        // Select latest intake by default
        this.selectedIntake = intakes[0].INTAKE_CODE;
        // Get all of Student Courses and store in an array
        for (const intake of intakes) {
          if (this.studentIntakes.indexOf(intake.INTAKE_CODE)) {
            this.studentIntakes.push(intake.INTAKE_CODE);
          }
        }
        // Get Attendance based on Intake
        this.attendance$ = this.getAttendances(this.selectedIntake);
        // Get Legends
        this.legend$ = this.ws.get<AttendanceLegend>('/student/attendance_legend', { caching });
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
  }

  getAttendances(intake: string): Observable<MappedAttendance[]> {
    this.average = -2;
    return this.ws.get<Attendance[]>(`/student/attendance?intake=${intake}`, { caching: 'network-or-cache' }).pipe(
      tap(a => this.calculateAverage(a)),
      map(a => {
        // Map data to [{ semester: '1', attendances: Attendance[] }]
        const attendancePerSemester = a.reduce((previous: any, current: any) => {
          if (!previous[current.SEMESTER]) {
            previous[current.SEMESTER] = [current];
          } else {
            previous[current.SEMESTER].push(current);
          }
          return previous;
        }, {});
        return Object.keys(attendancePerSemester).map(semester => ({ semester, attendances: attendancePerSemester[semester] })).reverse();
      })
    );
  }

  intakeChanged() {
    this.attendance$ = this.getAttendances(this.selectedIntake);
  }

  calculateAverage(aa: Attendance[] | null) {
    if (!Array.isArray(aa)) {
      return;
    }
    if (aa.length > 0) {
      const totalClasses = aa.reduce((a, b) => a + b.TOTAL_CLASSES, 0);
      const totalAbsentClasses = aa.reduce((a, b) => a + b.TOTAL_ABSENT, 0);
      const totalAttendedClasses = totalClasses - totalAbsentClasses;

      this.average = (totalAttendedClasses / totalClasses);
    } else {
      this.average = -1;
    }
  }

  async attendanceDetails(module: Attendance, intakeCode: string) {
    const modal = await this.modalCtrl.create({
      component: AttendanceDetailsModalPage,
      componentProps: {
        module,
        intake: intakeCode
      }
    });
    await modal.present();
  }

  comingFromTabs() {
    if (this.router.url.split('/')[1].split('/')[0] === 'tabs') {
      return true;
    }
    return false;
  }
}
