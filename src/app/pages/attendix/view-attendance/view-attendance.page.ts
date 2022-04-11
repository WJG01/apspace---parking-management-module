import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, pluck, tap, switchMap, startWith, scan, shareReplay, filter, map, Subject, Observable } from 'rxjs';

import { AttendanceGQL, AttendanceQuery, InitAttendanceGQL, InitAttendanceMutation, NewStatusGQL, NewStatusSubscription, ScheduleInput, Status } from '../../../../generated/graphql';

interface AttendanceSummary {
  present: number,
  absent: number;
  absentReason: number;
  late: number;
};

type Attendance = 'Y' | 'L' | 'N' | 'R' | '';

@Component({
  selector: 'app-view-attendance',
  templateUrl: './view-attendance.page.html',
  styleUrls: ['./view-attendance.page.scss'],
})
export class ViewAttendancePage implements OnInit {

  schedule: ScheduleInput;
  auto: boolean;
  thisClass = false;
  lectureUpdate: string;
  statusUpdate = new Subject<{ id: string; attendance: string; absentReason: string | null; }>();
  newStatus$: Observable<Pick<NewStatusSubscription, 'newStatus'>[]>;
  students$: Observable<Partial<Status>[]>;
  attendanceSummary$: Observable<AttendanceSummary>;
  totalStudents: number;
  filterObject: {
    term: string,
    type: Attendance
  } = {
      term: '',
      type: ''
    };
  status = ['Y', 'L', 'N', 'R'];

  constructor(
    private route: ActivatedRoute,
    private initAttendance: InitAttendanceGQL,
    private attendance: AttendanceGQL,
    private newStatus: NewStatusGQL
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
        let student = state.attendance.students.find(s => s.id === action.id);
        student.attendance = action.attendance;
        student.absentReason = action.absentReason;
        return state;
      }),
      shareReplay(1) // keep track while switching mode
    );

    // take last 10 values updated and ignore duplicates
    this.newStatus$ = this.newStatus.subscribe(schedule).pipe(
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

    this.attendanceSummary$ = this.students$.pipe(
      map(students => {
        return {
          present: students.filter(student => student.attendance === 'Y').length,
          absent: students.filter(student => student.attendance === 'N').length,
          absentReason: students.filter(student => student.attendance === 'R').length,
          late: students.filter(student => student.attendance === 'L').length,
        }
      })
    );
  }

  trackById(_index: number, item: Pick<Status, 'id'>): string {
    return item.id;
  }
}
