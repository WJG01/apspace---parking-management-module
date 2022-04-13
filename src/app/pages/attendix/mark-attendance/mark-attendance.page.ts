import { LocationStrategy, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, AlertButton, AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { catchError, endWith, filter, first, interval, map, NEVER, Observable, pluck, scan, share, shareReplay, startWith, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';

import { authenticator } from '@otplib/preset-browser';

import { AttendanceGQL, AttendanceQuery, InitAttendanceGQL, InitAttendanceMutation, MarkAttendanceAllGQL, MarkAttendanceGQL, NewStatusGQL, NewStatusSubscription, ResetAttendanceGQL, SaveLectureLogGQL, ScheduleInput, Status } from '../../../../generated/graphql';
import { isoDate, parseTime } from '../date';
import { AttendanceStatusPipe } from '../../../shared/attendance-status/attendance-status.pipe';
import { AttendanceSummary } from '../../../interfaces';
import { ComponentService } from '../../../services';

type Attendance = 'Y' | 'L' | 'N' | 'R' | '';

@Component({
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.page.html',
  styleUrls: ['./mark-attendance.page.scss'],
})
export class MarkAttendancePage implements OnInit {

  selectedSegment: 'qr' | 'manual' = 'qr';
  schedule: ScheduleInput;
  thisClass = false;
  resetable = false;
  hideQr = false;
  lectureUpdate: string;
  toastIsPresent = false;

  countdown$: Observable<number>;
  otp$: Observable<string>;

  lastMarked$: Observable<Pick<NewStatusSubscription, 'newStatus'>[]>;
  students$: Observable<Partial<Status>[]>;
  attendanceSummary$: Observable<AttendanceSummary>;
  statusUpdate = new Subject<{ id: string; attendance: string; absentReason: string | null; }>();
  filterObject: {
    term: string,
    type: Attendance
  } = {
      term: '',
      type: ''
    };
  status = ['Y', 'L', 'N', 'R'];
  totalStudents: number;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private attendance: AttendanceGQL,
    private initAttendance: InitAttendanceGQL,
    private markAttendance: MarkAttendanceGQL,
    private markAttendanceAll: MarkAttendanceAllGQL,
    private newStatus: NewStatusGQL,
    private resetAttendance: ResetAttendanceGQL,
    private route: ActivatedRoute,
    private saveLectureLog: SaveLectureLogGQL,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private locationStrategy: LocationStrategy,
    private datePipe: DatePipe,
    public navCtrl: NavController,
    private attendanceStatusPipe: AttendanceStatusPipe,
    private component: ComponentService
  ) { }

  ngOnInit() {
    // totp options
    authenticator.options = { digits: 3, step: 4 * 60 + 29, window: 30 };

    const schedule = this.schedule = {
      classcode: this.route.snapshot.paramMap.get('classcode'),
      date: this.route.snapshot.paramMap.get('date'),
      startTime: this.route.snapshot.paramMap.get('startTime'),
      endTime: this.route.snapshot.paramMap.get('endTime'),
      classType: this.route.snapshot.paramMap.get('classType')
    };

    let studentsNameById: { [student: string]: string };

    // limit reset to 30 days in the past
    const today = new Date(new Date().setHours(8, 0, 0, 0));
    const limit = new Date(today).setDate(today.getDate() - 30);
    this.resetable = limit <= Date.parse(schedule.date);

    // initAttendance and attendance query order based on probability
    const newDate = new Date();

    const localToUtcOffset = (newDate.getTimezoneOffset());
    const localParsedDate = Date.parse(newDate.toString());

    const utcDate = new Date(localParsedDate + (localToUtcOffset * 60000));
    const utcParsedDate = Date.parse(utcDate.toUTCString());

    const d = new Date(utcParsedDate + (480 * 60000));
    const d1 = new Date(utcParsedDate + (480 * 60000));
    const nowMins = d.getHours() * 60 + d.getMinutes();
    // if this is the current class
    this.thisClass = schedule.date === isoDate(today)
      && parseTime(schedule.startTime) <= nowMins
      && nowMins <= parseTime(schedule.endTime) + 5;

    const init = () => {
      const attendance = this.route.snapshot.paramMap.get('defaultAttendance') || 'N';
      this.hideQr = attendance === 'Y';
      // this.auto = this.thisClass;
      return this.initAttendance.mutate({ schedule, attendance });
    };
    const list = () => this.attendance.fetch({ schedule });
    const attendance$ = this.thisClass ? init().pipe(catchError(list)) : list().pipe(catchError(init));

    // get attendance state from query and use manual mode if attendance initialized
    const attendancesState$ = attendance$.pipe(
      catchError(err => {
        this.component.toastMessage('Failed to mark attendance: ' + err.message.replace('GraphQL error: ', ''), 'danger');
        console.error(err);
        return NEVER;
      }),
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
        const student = JSON.parse(JSON.stringify(state.attendance.students.find(s => s.id === action.id)));
        student.attendance = action.attendance;
        student.absentReason = action.absentReason;
        return state;
      }),
      shareReplay(1) // keep track while switching mode
    );

    const secret$ = attendances$.pipe(
      pluck('attendance', 'secret'),
      shareReplay(1) // used shareReplay for observable subscriptions time gap
    );

    // stop timer until class ends with 5 minutes buffer
    const hh = +schedule.endTime.slice(0, 2) % 12 + (schedule.endTime.slice(-2) === 'PM' ? 12 : 0);
    const mm = +schedule.endTime.slice(3, 5) + 5;
    const stopTimer$ = timer(d1.setHours(hh, mm) - d.getTime());
    const reload$ = timer(authenticator.timeRemaining() * 1000, authenticator.options.step * 1000).pipe(
      takeUntil(stopTimer$),
      share()
    );

    // display countdown timer
    this.countdown$ = interval(1000).pipe(
      takeUntil(stopTimer$),
      map(() => authenticator.timeRemaining() + authenticator.options.window - 1), // ignore current second
      shareReplay(1) // keep track while switching mode
    );

    // only regenerate otp when needed during class
    this.otp$ = secret$.pipe(
      switchMap(secret =>
        reload$.pipe(
          startWith(() => null), // start immediately
          map(() => authenticator.generate(secret)),
          endWith('---')
        ),
      ),
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
      map(s => s.attendance['students']),
      tap(s => this.totalStudents = s.length),
      shareReplay(1)
    );

    // Get the attendance summary and color based on status
    this.attendanceSummary$ = this.students$.pipe(
      map(students => {
        return {
          present: {
            color: this.attendanceStatusPipe.transform('Y', true),
            data: students.filter(student => student.attendance === 'Y').length
          },
          absent: {
            color: this.attendanceStatusPipe.transform('N', true),
            data: students.filter(student => student.attendance === 'N').length
          },
          absentReason: {
            color: this.attendanceStatusPipe.transform('R', true),
            data: students.filter(student => student.attendance === 'R').length
          },
          late: {
            color: this.attendanceStatusPipe.transform('L', true),
            data: students.filter(student => student.attendance === 'L').length
          }
        };
      }),
      shareReplay(1) // keep track while switching mode
    );

    if (!this.thisClass || this.hideQr) {
      this.selectedSegment = 'manual';
    }

    this.handleBeforeGoBack();
  }

  /** Mark student attendance. */
  mark(student: string, attendance: string, absentEvent?: KeyboardEvent) {
    const el = absentEvent && absentEvent.target as HTMLInputElement;
    if (el) {
      el.blur();
    }
    const absentReason = el && el.value || null;

    // fallback to absent if reason is left empty
    if (attendance === 'R' && absentReason === null) {
      attendance = 'N';
    }

    const options = {
      optimisticResponse: {
        __typename: 'Mutation' as 'Mutation',
        markAttendance: {
          __typename: 'Status' as 'Status',
          id: student,
          attendance,
          absentReason,
          ...this.schedule
        }
      }
    };
    const schedule = this.schedule;
    this.markAttendance.mutate({ schedule, student, attendance, absentReason }, options).subscribe({
      error: (err) => {
        this.component.toastMessage(`Mark ${this.attendanceStatusPipe.transform(attendance, false)} failed: ${err}`, 'danger');
        console.error(err);
      }
    });
  }

  private _markAll(attendance: Attendance) {
    return this.students$.pipe(first()).subscribe(students => {
      const options = {
        optimisticResponse: {
          __typename: 'Mutation' as 'Mutation',
          markAttendanceAll: students.map(({ id }) => ({
            __typename: 'Status' as 'Status',
            id,
          }))
        }
      };

      const schedule = this.schedule;
      const absentReason = null;

      this.markAttendanceAll.mutate({ schedule, attendance }, options).pipe(
        pluck('data', 'markAttendanceAll'),
        tap(statuses => statuses.forEach(({ id }) => {
          this.statusUpdate.next({ id, attendance, absentReason })
        }))
      ).subscribe({
        next: () => {
          this.component.toastMessage(`Marked all ${this.attendanceStatusPipe.transform(attendance, false)}`, 'success');
        },
        error: (err) => {
          this.component.toastMessage(`Mark all ${this.attendanceStatusPipe.transform(attendance, false)} failed: ${err}`, 'danger');
          console.error(err);
        }
      });
    });
  }

  async markAll() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Mark All Students As',
      cssClass: 'mark-all',
      buttons: [
        {
          text: 'Present',
          cssClass: 'Y',
          handler: () => {
            this._markAll('Y');
          }
        },
        {
          text: 'Late',
          cssClass: 'L',
          handler: () => {
            this._markAll('L');
          }
        },
        {
          text: 'Absent',
          cssClass: 'N',
          handler: () => {
            this._markAll('N');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }]
    });
    await actionSheet.present();
  }

  /** Additional way to mark all as absent. */
  markAllAbsent() {
    const btn: AlertButton = {
      text: 'Reset',
      cssClass: 'danger',
      handler: () => {
        this._markAll('N');
      }
    }

    this.component.alertMessage('Reset All To Absent!', 'Are you sure that you want to <span class="glob-danger-text glob-text-bold">Reset</span> the attendance for all students to \'Absent\'?', 'Cancel', btn);
  }

  /** Delete attendance, double confirm */
  reset() {
    const btn: AlertButton = {
      text: 'Delete',
      cssClass: 'danger',
      handler: () => {
        const schedule = this.schedule;

        this.resetAttendance.mutate({ schedule }).subscribe({
          next: () => {
            this.component.toastMessage('Attendance Deleted!', 'success');
            this.navCtrl.navigateBack('/attendix/classes');
          },
          error: (err) => {
            this.component.toastMessage(`Attendance delete failed: ${err}`, 'danger');
            console.error(err);
          }
        });
      }
    }

    this.component.alertMessage('Delete Attendance Record!', `Are you sure that you want to <span class="glob-danger-text glob-text-bold">Permanently Delete</span> the selected attendance record?<br><br> <span class="glob-text-bold">Class Code:</span> ${this.schedule.classcode}<br> <span class="glob-text-bold">Class Date:</span> ${this.datePipe.transform(this.schedule.date, 'EEEE, MMMM d, y')}<br> <span class="glob-text-bold">Class Time:</span> ${this.schedule.startTime} - ${this.schedule.endTime}<br> <span class="glob-text-bold">Class Type:</span> ${this.schedule.classType}`, 'Cancel', btn);
  }

  /** Save lecture update notes. */
  save(lectureUpdate: string) {
    if (this.lectureUpdate !== lectureUpdate) {
      const schedule = this.schedule;

      this.saveLectureLog.mutate({ schedule, log: { lectureUpdate } }).subscribe({
        next: () => {
          this.component.toastMessage('Lecturer update saved!', 'success');
        },
        error: (err) => {
          this.component.toastMessage(`Lecture update failed: ${err}`, 'danger');
          console.error(err);
        }
      });

      this.lectureUpdate = lectureUpdate;
    }
  }

  trackById(_index: number, item: Pick<Status, 'id'>): string {
    return item.id;
  }

  async goBackToast() {
    try {
      this.toastCtrl.dismiss().then(() => {
      }).catch(() => {
      }).finally(() => {
      });
    } catch (e) { }

    const toast = await this.toastCtrl.create({
      header: 'Attention -- do you want to save the attendance?',
      position: 'top',
      color: 'danger',
      duration: 8000,
      buttons: [
        {
          text: 'Save Changes',
          handler: () => {
            this.navCtrl.navigateBack('/attendix/classes');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.toastIsPresent = false;
          }
        }
      ]
    });
    await toast.present();
    this.toastIsPresent = true;
  }

  /** Trigger on browser back button press */
  handleBeforeGoBack() {
    this.locationStrategy.onPopState(async () => {
      if (this.toastIsPresent) {
        await this.toastCtrl.dismiss();
        this.toastIsPresent = false;
      }
    });
  }

  /** Trigger on browser button close */
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload() {
    return false;
  }
}
