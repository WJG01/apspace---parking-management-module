import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { catchError, filter, first, map, pluck, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import {
  AttendanceGQL,
  AttendanceQuery,
  InitAttendanceGQL,
  InitAttendanceMutation,
  NewStatusGQL,
  NewStatusSubscription,
  ScheduleInput,
  Status
} from '../../../../generated/graphql';
type Attendance = 'Y' | 'L' | 'N' | 'R' | '';


@Component({
  selector: 'app-view-attendance',
  templateUrl: './view-attendance.page.html',
  styleUrls: ['./view-attendance.page.scss'],
})

export class ViewAttendancePage implements OnInit {
  doughnutChart = {
    type: 'pie',
    options: {
      responsive: false,
      legend: {
        display: true,
        position: 'bottom',
      }
    },
    data: {}
  };

  schedule: ScheduleInput;
  auto: boolean;
  term = '';
  type: Attendance = '';
  thisClass = false;
  lectureUpdate = '';

  lastMarked$: Observable<Pick<NewStatusSubscription, 'newStatus'>[]>;
  students$: Observable<Partial<Status>[]>;
  totalStudents$: Observable<number>;
  studentsChartData$: Observable<any>;
  statusUpdate = new Subject<{ id: string; attendance: string; absentReason: string | null; }>();
  attendanceStatus: any;

  constructor(
    private attendance: AttendanceGQL,
    private initAttendance: InitAttendanceGQL,
    public navCtrl: NavController,
    private newStatus: NewStatusGQL,
    private route: ActivatedRoute,
    public toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const schedule = this.schedule = {
      classcode: this.route.snapshot.paramMap.get('classcode'),
      date: this.route.snapshot.paramMap.get('date'),
      startTime: this.route.snapshot.paramMap.get('startTime'),
      endTime: this.route.snapshot.paramMap.get('endTime'),
      classType: this.route.snapshot.paramMap.get('classType'),
    };

    let studentsNameById: { [student: string]: string };

    const init = () => {
      const attendance = this.route.snapshot.paramMap.get('defaultAttendance') || 'N';
      this.auto = this.thisClass;
      return this.initAttendance.mutate({ schedule, attendance });
    };
    const list = () => (this.auto = false, this.attendance.fetch({ schedule }));
    const attendance$ = this.thisClass ? init().pipe(catchError(list)) : list().pipe(catchError(init));

    // get attendance state from query and use manual mode if attendance initialized
    const attendancesState$ = attendance$.pipe(
      pluck('data'),
      tap((query: AttendanceQuery | InitAttendanceMutation) => {
        studentsNameById = query.attendance.students.reduce((acc, s) => (acc[s.id] = s, acc), {});
      }),
      tap((query: AttendanceQuery) => {
        if (query.attendance.log) {
          this.lectureUpdate = query.attendance.log.lectureUpdate;
        }
      }),
    );

    // keep updating attendancesState$ with new changes
    const attendances$ = attendancesState$.pipe(
      switchMap(state => this.statusUpdate.asObservable().pipe(startWith(state))),
      scan((state: InitAttendanceMutation, action: { id: string; attendance: string; absentReason: string; }) => {
        const student = state.attendance.students.find(s => s.id === action.id);
        student.attendance = action.attendance;
        student.absentReason = action.absentReason;
        return state;
      }),
      shareReplay(1) // keep track while switching mode
    );

    // take last 10 values updated and ignore duplicates
    this.lastMarked$ = this.newStatus.subscribe(schedule).pipe(
      pluck('data', 'newStatus'),
      tap(({ id }) => console.log('new', id, studentsNameById[id])),
      tap(({ id, attendance, absentReason }) => this.statusUpdate.next({ id, attendance, absentReason })),
      filter(({ attendance }) => attendance === 'Y'),
      scan((acc, { id }) => acc.includes(studentsNameById[id])
        ? acc : [...acc, studentsNameById[id]].slice(-10), []),
      shareReplay(1) // keep track while switching mode
    );

    this.students$ = attendances$.pipe(
      pluck('attendance', 'students'),
      shareReplay(1)
    );

    this.studentsChartData$ = this.students$.pipe(
      map(students => {
        return {
          labels: ['Present', 'Absent', 'Absent With Reason', 'Late'],
          datasets: [{
            label: '# of Votes',
            data: [
              students.filter(student => student.attendance === 'Y').length,
              students.filter(student => student.attendance === 'N').length,
              students.filter(student => student.attendance === 'R').length,
              students.filter(student => student.attendance === 'L').length
            ],
            backgroundColor: [
              'rgba(73, 181, 113, 0.5)',
              'rgba(229, 77, 66, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(212, 154, 13, 0.5)'
            ],
            hoverBackgroundColor: [
              '#49b571', // green
              '#e54d42', // red
              '#36A2EB', // blue
              '#d49a0d' // orange
            ],
            borderColor: [
              '#49b571', // green
              '#e54d42', // red
              '#36A2EB', // blue
              '#d49a0d' // orange
            ],
            borderWidth: 3
          }]
        };
      }),
      shareReplay(1) // keep track while switching mode
    );

    this.totalStudents$ = this.students$.pipe(
      map(students => students.length),
      first() // total does not change so stop counting
    );

  }

  toast(message: string, color: string) {
    this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
    }).then(toast => toast.present());
  }

  async goBackToast() {
    try {
      this.toastCtrl.dismiss().then(() => {
      }).catch(() => {
      }).finally(() => {
        this.navCtrl.navigateBack('/attendix/classes');
      });
    } catch (e) { }
  }

  trackById(_index: number, item: Pick<Status, 'id'>) {
    return item.id;
  }
}
