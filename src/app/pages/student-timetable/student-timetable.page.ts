import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Browser } from '@capacitor/browser';
import { format, formatISO } from 'date-fns';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

import * as ics from 'ics';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { Role, StudentProfile, StudentTimetable } from '../../interfaces';
import { SettingsService, StudentTimetableService, WsApiService, NotifierService, ConfigurationsService, ComponentService } from '../../services';
import { ClassesPipe } from './classes.pipe';
import { TheWeekPipe } from './theweek.pipe';

@Component({
  selector: 'app-student-timetable',
  templateUrl: './student-timetable.page.html',
  styleUrls: ['./student-timetable.page.scss'],
})
export class StudentTimetablePage implements OnInit {
  printUrl = 'https://api.apiit.edu.my/timetable-print/index.php';
  wday = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  legends = [
    {
      name: 'L',
      desc: 'Lecture',
    },
    {
      name: 'T',
      desc: 'Tutorial',
    },
    {
      name: 'G1',
      desc: 'Tutorial Group 1',
    },
    {
      name: 'G2',
      desc: 'Tutorial Group 2',
    },
    {
      name: 'Lab',
      desc: 'Computer Lab',
    },
    {
      name: 'Lab 1',
      desc: 'Computer Lab Group 1',
    },
    {
      name: 'Lab 2',
      desc: 'Computer Lab Group 2',
    },
    {
      name: 'Lab 3',
      desc: 'Computer Lab Group 3',
    },
    {
      name: 'TPM',
      desc: 'APIIT/APLC Campus',
    },
    {
      name: 'New Campus',
      desc: 'APU Campus',
    },
    {
      name: 'B',
      desc: 'Buffer Week',
    },
    {
      name: 'R',
      desc: 'Revision Week',
    },
  ];

  comingFromTabs = this.router.url.split('/')[1].split('/')[0] === 'tabs';

  timetable$: Observable<StudentTimetable[]>;
  selectedWeek: Date; // week is the first day of week
  availableWeek: Date[] = [];
  selectedDate: Date;
  availableDate: Date[];
  availableDays: string[]; // wday[d.getDay()] for availableDate
  availableGrouping: string[] = [];
  selectedGrouping: string;
  intakeLabels: string[] = [];
  intakeSelectable = true;
  viewWeek: boolean; // weekly or daily display
  skeletons = new Array(5);
  role: Role;

  room: string;
  intake: string;
  freeTime = false;
  timeFormatChangeFlag: boolean;
  notification: Subscription;

  // timezone
  enableMalaysiaTimezone;


  hideHeader: boolean;
  // ICS Timetable Generate Variables
  downloadTimetable: string;
  filename: string;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private changeDetectorRef: ChangeDetectorRef,
    private config: ConfigurationsService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private settings: SettingsService,
    private storage: Storage,
    private tt: StudentTimetableService,
    private ws: WsApiService,
    private notifierService: NotifierService,
    private fileOpener: FileOpener,
    private component: ComponentService,
    private plt: Platform
  ) {
    this.hideHeader = this.config.comingFromTabs;
  }

  ngOnInit() {
    this.notification = this.notifierService.timeFormatUpdated.subscribe(data => {
      if (data && data === 'SUCCESS') {
        this.timeFormatChangeFlag = !this.timeFormatChangeFlag;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.settings.get$('enableMalaysiaTimezone').subscribe(data =>
      this.enableMalaysiaTimezone = data
    );

    // select current day by default
    this.selectedDate = new Date();
    this.selectedDate.setHours(0, 0, 0, 0);

    // select current start of week
    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    date.setHours(0, 0, 0, 0);
    this.selectedWeek = date;

    // optional room paramMap to filter timetables by room (separated from intake filter)
    this.room = this.route.snapshot.paramMap.get('room');

    // optional intake passed by other pages
    const intake = this.route.snapshot.params.intake;
    if (this.room) { // indirect timetable page access
      this.intakeSelectable = false;
      this.freeTime = true;
    }

    // quick exit when room is specified (and do not set intake)
    if (this.room !== null) {
      return this.doRefresh();
    }

    // intake from params -> intake from settings -> student default intake
    const intakeHistory = this.settings.get('intakeHistory');
    this.intake = intake || intakeHistory[intakeHistory.length - 1];

    // default to daily view
    this.viewWeek = this.settings.get('viewWeek');

    // default intake to student current intake
    this.storage.get('role').then((role: Role) => {
      this.role = role;
      // tslint:disable-next-line: no-bitwise
      if (role & Role.Student) { // intake is not defined & user role is student
        if (!this.intake) {
          this.ws.get<StudentProfile>('/student/profile', { caching: 'cache-only' }).subscribe(p => {
            // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
            this.intake = p.INTAKE.replace(/[(]AP[)]|[(]BP[)]/g, '');
            this.changeDetectorRef.markForCheck();
            this.settings.set('intakeHistory', [this.intake]);
            this.doRefresh();
          });
        } else {
          this.changeDetectorRef.markForCheck();
          this.doRefresh();
        }

      } else {
        if (!this.intake) {
          if (this.role) {
            this.settings.set('intakeHistory', []);
          }
        }

        // intake is not defined & user role is staff or lecturers
        this.changeDetectorRef.markForCheck();
        this.doRefresh();
      }
    });

  }

  ngOnDestroy() {
    this.notification.unsubscribe();
  }

  presentActionSheet(labels: string[], handler: (_: string) => void) {
    const buttons = labels.map(text => ({ text, handler: () => handler.call(this, text) }));
    this.actionSheetCtrl.create({
      buttons: [...buttons, { text: 'Cancel', role: 'cancel' }],
    }).then(actionSheet => actionSheet.present());
  }

  /** Switch between daily and weekly view and save. */
  rotateView() {
    this.viewWeek = !this.viewWeek;
    this.changeDetectorRef.markForCheck();
    this.timetable$.subscribe();
    if (this.role) {
      this.settings.set('viewWeek', this.viewWeek);
    }
  }

  /** Choose week with presentActionSheet. */
  chooseWeek() {
    const date = new DatePipe('en');
    const labels = this.availableWeek.map(d => date.transform(d));
    this.presentActionSheet(labels, (weekStr: string) => {
      const week = this.availableWeek[labels.indexOf(weekStr)];
      if (this.selectedWeek.getDate() !== week.getDate()) {
        this.selectedWeek = week;
        this.changeDetectorRef.markForCheck();
        this.timetable$.subscribe();
      }
    });
  }

  /** Check and update intake on change. */
  changeIntake(intake: string) {
    if (intake !== null && intake !== this.intake) {
      this.intake = intake;
      if (this.role) {
        this.settings.set('intakeHistory', this.settings.get('intakeHistory')
          .concat(intake)
          .filter((v, i, a) => a.lastIndexOf(v) === i)
          .slice(-5));
      }
      this.selectedGrouping = 'All';
      this.changeDetectorRef.markForCheck();

      this.timetable$.subscribe((res) => {
        this.availableGrouping = [
          ...Array.from(new Set(
            (res || []).filter(t => t.INTAKE === this.intake && t.GROUPING).map(t => t.GROUPING.toUpperCase())
          )).sort(),
          'All'
        ];
        this.selectedGrouping = this.availableGrouping.length <= 2 ? this.availableGrouping[0] : 'All';
        this.changeDetectorRef.markForCheck();
        // always reset grouping to the only intake or 'All' as fallback after changing intake and recalculation
        if (this.role) {
          this.settings.set('intakeGroup', this.selectedGrouping);
        }
      });
    }
  }

  /** Choose selectedGrouping with presentActionSheet. */
  chooseGrouping() {
    this.presentActionSheet(this.availableGrouping, (selectedGrouping: string) => {
      if (this.selectedGrouping !== selectedGrouping) {
        this.selectedGrouping = selectedGrouping;
        if (this.role) {
          this.settings.set('intakeGroup', this.selectedGrouping);
        }
        this.changeDetectorRef.markForCheck();
        this.timetable$.subscribe();
      }
    });
  }

  /** Display intake search modal. */
  async presentIntakeSearch() {
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items: this.intakeLabels,
        defaultItems: this.settings.get('intakeHistory'),
        autofocus: true
      }
    });
    await modal.present();
    // default item to current intake if model dismissed without data
    const { data: { item: intake } = { item: this.intake } } = await modal.onDidDismiss();
    this.changeIntake(intake);
  }

  /** Check if the day is in week. */
  dayInWeek(date: Date) {
    date.setDate(date.getDate() - (date.getDay() + 6) % 7); // monday
    return date.getFullYear() === this.selectedWeek.getFullYear()
      && date.getMonth() === this.selectedWeek.getMonth()
      && date.getDate() === this.selectedWeek.getDate();
  }

  /** Refresh timetable, forcefully if refresher is passed. */
  doRefresh(refresher?) {
    if (this.role) {
      const timetable$ = this.tt.get(true).pipe( // force refersh for now
        finalize(() => refresher && refresher.complete())
      );
      this.timetable$ = combineLatest([timetable$, this.settings.get$('modulesBlacklist')]).pipe(

        map(([tt, modulesBlacklist]) => tt.filter(t => !modulesBlacklist.includes(t.MODID))),
        tap(tt => this.updateDay(tt)),
        // initialize or update intake labels only if timetable might change
        tap(tt => (Boolean(refresher) || this.intakeLabels.length === 0)
          && (this.intakeLabels = Array.from(new Set((tt || []).map(t => t.INTAKE))).sort())),
        // always recalculate availableGrouping based on intake selected, then update selectedGrouping selected
        tap(tt => {
          this.availableGrouping = [
            ...Array.from(new Set(
              (tt || []).filter(t => t.INTAKE === this.intake && t.GROUPING).map(t => t.GROUPING.toUpperCase())
            )).sort(),
            'All'
          ];
          if (!this.selectedGrouping) {
            const localIntakeGroupingValue = this.settings.get('intakeGroup');
            if (localIntakeGroupingValue && this.availableGrouping.includes(localIntakeGroupingValue)) {
              this.selectedGrouping = this.settings.get('intakeGroup');
            } else {
              this.selectedGrouping = this.availableGrouping[0];
              this.settings.set('intakeGroup', this.availableGrouping[0]);
            }
          }

        }),
        tap(() => this.changeDetectorRef.markForCheck()),
      );
    } else {
      this.timetable$ = this.tt.get(true).pipe( // force refersh for now
        tap(tt => this.updateDay(tt)),
        tap(tt => (Boolean(refresher) || this.intakeLabels.length === 0)
          && (this.intakeLabels = Array.from(new Set((tt || []).map(t => t.INTAKE))).sort())),
        tap(tt => {
          this.availableGrouping = [
            ...Array.from(new Set(
              (tt || []).filter(t => t.INTAKE === this.intake && t.GROUPING).map(t => t.GROUPING.toUpperCase())
            )).sort(),
            'All'
          ];
          if (!this.selectedGrouping) {
            this.selectedGrouping = this.availableGrouping[0];
          }
        }),
        tap(_ => this.changeDetectorRef.markForCheck()),
        finalize(() => refresher && refresher.complete())
      );
    }
  }

  /** Track timetable objects. */
  trackByIndex(index: number): number {
    return index;
  }

  /** Track and update week and date in the order of day, week, intake. */
  updateDay(tt: StudentTimetable[]) {
    // filter by intake and room (need not to track intake)
    // XXX: remove this so that classes pipe is only called once
    tt = new ClassesPipe().transform(tt, this.intake, this.room, this.selectedGrouping);

    // get week
    this.availableWeek = Array.from(new Set(tt.map(t => {
      const date = new Date(t.DATESTAMP_ISO);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (date.getDay() + 6) % 7); // monday
      return date.valueOf();
    }))).sort().map(d => new Date(d));

    // prevent further processing if no week available
    if (this.availableWeek.length === 0) {
      this.selectedDate = undefined; // rollback displayed date to selected week
      return;
    }

    // get days in week for intake
    this.availableDate = Array.from(new Set(tt
      .filter(t => this.dayInWeek(new Date(t.DATESTAMP_ISO)))
      .map(t => t.DATESTAMP_ISO))).map(d => new Date(d));
    this.availableDays = this.availableDate.map(d => this.wday[(d.getDay() + 6) % 7]); // monday

    // set default day
    if (this.availableDate.length === 0) {
      this.selectedDate = undefined;
    } else if (!this.selectedDate || !this.availableDate.find(d => d.getDay() === this.selectedDate.getDay())) {
      const date = new Date();
      const today = this.availableDate.find(d => d.getDate() === date.getDate());
      this.selectedDate = today || this.availableDate[0];
    } else if (!this.availableDate.some(d => d.getDate() === this.selectedDate.getDate())) {
      this.selectedDate = this.availableDate.find(d => d.getDay() === this.selectedDate.getDay());
    }
  }

  async sendToPrint() {
    const week = formatISO(this.selectedWeek, { representation: 'date' }); // week in apspace starts with sunday, API starts with monday
    // For student timetable:
    // printUrl?Week=2019-11-18&Intake=APTDF1805DSM(VFX)&print_request=print_tt
    // For lecturer timetable:
    // printUrl?LectID=ARW&Submit=Submit&Week=2019-11-18&print_request=print
    await Browser.open({ url: `${this.printUrl}?Week=${week}&Intake=${this.intake}&Intake_Group=${this.selectedGrouping}&print_request=print_tt`, windowName: '_system' });
  }

  generateCalendar() {
    this.timetable$.pipe(
      tap(async res => {
        const studentTimetable = new ClassesPipe().transform(res, this.intake, this.room, this.selectedGrouping);
        const selectedWeekTimetable = new TheWeekPipe().transform(studentTimetable, this.selectedWeek);
        const timetableArray = [];

        for (const tt of selectedWeekTimetable) {
          const startDate = new Date(tt.TIME_FROM_ISO);
          const endDate = new Date(tt.TIME_TO_ISO);


          const start = format(startDate, 'yyyy-M-d-H-m').split('-').map(s => +s);
          const end = format(endDate, 'yyyy-M-d-H-m').split('-').map(s => +s);

          const response = {
            start,
            end,
            title: tt.MODID
          }

          timetableArray.push(response);
        }

        const { error, value } = ics.createEvents(timetableArray);
        const fileName = `${this.intake.toLowerCase()}-${this.selectedWeek.getTime()}-schedule`

        if (error) {
          this.component.toastMessage('Error Generating Timetable. Please try again later.', 'danger');
          return;
        }

        if (this.plt.is('capacitor')) {
          try {
            const path = `apspace/timetable/${fileName}`;
            const result = await Filesystem.writeFile({
              path,
              data: value,
              directory: Directory.Documents,
              recursive: true,
              encoding: Encoding.UTF8
            });

            this.fileOpener.open(result.uri, 'text/calendar');
          } catch (error) {
            this.component.toastMessage('Error Opening Timetable. Please try again later.', 'danger');
            console.log(error);
          }
        } else {
          const blobTT = new Blob([value], { type: 'text/calendar' })
          this.downloadTimetable = window.URL.createObjectURL(blobTT);
          this.filename = fileName;
        }
      })
    ).subscribe();
  }
}
