import { Component, OnInit } from '@angular/core';
import { AlertButton, ModalController, NavController, Platform } from '@ionic/angular';
import { Observable, Subscription, combineLatest, forkJoin, of, zip, map, finalize, catchError, concatMap, mergeMap, shareReplay, switchMap, tap, toArray } from 'rxjs';

import { differenceInDays, format, parse } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { ChartData, ChartOptions } from 'chart.js';
import SwiperCore, { Autoplay, Lazy, Navigation } from 'swiper';
import { Storage } from '@ionic/storage-angular';

import { accentColors } from 'src/app/constants';
import {
  Apcard, CgpaPerIntake, ConsultationHour, ConsultationSlot,
  Course, CourseDetails,
  EventComponentConfigurations, ExamSchedule, FeesTotalSummary, LecturerTimetable,
  MoodleEvent, OrientationStudentDetails, Quote, Role, ShortNews,
  StaffDirectory, StaffProfile, StudentPhoto, StudentProfile, StudentTimetable, UserVaccineInfo, TransixScheduleSet, TransixDashboardTiming, TransixHolidaySet, TransixHoliday
} from 'src/app/interfaces';
import {
  CasTicketService, NewsService,
  NotificationService, SettingsService, StudentTimetableService,
  WsApiService, ComponentService, AppLauncherService, FcmService
} from 'src/app/services';
import { DateWithTimezonePipe } from 'src/app/shared/date-with-timezone/date-with-timezone.pipe';
import { NewsDetailsModalPage } from '../news/news-details-modal/news-details-modal.page';
// import { NotifierService } from 'src/app/shared/notifier/notifier.service'; v4: this need to migrate in the future
// import { NotificationModalPage } from '../notifications/notification-modal'; v4: this need to migrate in the future

//install swiper modules
SwiperCore.use([Autoplay, Lazy, Navigation]);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  providers: [DateWithTimezonePipe]
})
export class DashboardPage implements OnInit {
  // Roles Variables
  isStudent: boolean;
  isLecturer: boolean;
  isAdmin: boolean;
  // Observable Variable
  quote$: Observable<Quote>;
  holidays$: Observable<TransixHolidaySet>;
  staffProfile$: Observable<StaffProfile>;
  photo$: Observable<string>;
  orientationStudentDetails$: Observable<OrientationStudentDetails>;
  todaysSchedule$: Observable<EventComponentConfigurations[]>;
  userProfileName$: Observable<string>;
  upcomingEvent$: Observable<EventComponentConfigurations[]>;
  apcardTransaction$: Observable<Apcard[]>;
  financial$: Observable<FeesTotalSummary>;
  userVaccinationInfo$: Observable<UserVaccineInfo>;
  lecturerContacts$: Observable<any>;
  upcomingTrips$: Observable<TransixDashboardTiming[]>;
  cgpaPerIntake$: Observable<CgpaPerIntake>;
  news$: Observable<ShortNews[]>;
  // Chart Variables
  apcardChart: {
    options: ChartOptions,
    data: ChartData,
  } = {
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'top',
          }
        },
      },
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Monthly Credit',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(73, 181, 113, .7)',
            backgroundColor: 'rgba(73, 181, 113, .3)',
            pointBackgroundColor: 'rgba(73, 181, 113, .3)',
            pointBorderColor: 'rgb(73, 181, 113, .7)',
            fill: true,
          },
          {
            label: 'Monthly Debit',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(224, 20, 57, .7)',
            backgroundColor: 'rgb(224, 20, 57, .3)',
            pointBackgroundColor: 'rgb(224, 20, 57, .3)',
            pointBorderColor: 'rgb(224, 20, 57, .7)',
            fill: true,
          },
        ],
      }
    };
  financialsChart: {
    options: ChartOptions,
    data: ChartData,
  } = {
      options: {
        hover: { mode: null },
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        },
        responsive: true
      },
      data: null
    };
  cgpaChart: {
    options: ChartOptions,
    data: ChartData,
  };
  // TransiX Variables
  secondLocation: string;
  firstLocation: string;
  showSetLocationsSettings = false;
  transixSkeleton = new Array(2);
  // Other Variables
  isCapacitor: boolean;
  skeletons = new Array(5);
  currentBalance: number; // Show APCard current Balance
  scheduleSegment: 'today' | 'upcoming' = 'today'; // "My Schedule" Segment
  activeDashboardSections: string[] = []; // Get User Dashboard Sections
  hideProfilePicture: boolean; // User Selected Setting
  enableMalaysiaTimezone: boolean;
  pushInit: boolean; // Initialise Push Notification
  timeFormatChangeFlag: boolean;
  notification: Subscription;
  activeAccentColor = '';
  timetableDefaultIntake: string;
  userProfile: any = {};
  numberOfUnreadMsgs: number;
  showAnnouncement = false; // E-Orientation Announcement Image
  intakeGroup: string;
  transixDevUrl = 'https://2o7wc015dc.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    private component: ComponentService,
    private ws: WsApiService,
    private studentTimetableService: StudentTimetableService,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    private news: NewsService,
    private modalCtrl: ModalController,
    private cas: CasTicketService,
    private appLauncherService: AppLauncherService,
    private platform: Platform,
    private settings: SettingsService,
    private storage: Storage,
    // private notifierService: NotifierService,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private fcm: FcmService
  ) {
    // getting the main accent color to color the chart.js (Temp until removing chart.js)
    // TODO handle value change
    // this.initPushNotification();
    // Check if the accent color in user's storage exists in new accent-color.ts.
    // If it doesn't then rollback to standard blue
    const getAccentColor = accentColors.find(ac => ac.name === this.settings.get('accentColor'));

    if (typeof getAccentColor === 'undefined') {
      this.activeAccentColor = accentColors.find(ac => ac.name === 'blue').rgba;
      this.settings.set('accentColor', accentColors.find(ac => ac.name === 'blue').name);
    } else {
      this.activeAccentColor = accentColors.find(ac => ac.name === this.settings.get('accentColor')).rgba;
    }
  }

  ngOnInit() {
    this.isCapacitor = this.platform.is('capacitor');
    // this.notification = this.notifierService.timeFormatUpdated.subscribe(data => {
    //   if (data && data === 'SUCCESS') {
    //     this.timeFormatChangeFlag = !this.timeFormatChangeFlag;
    //   }
    // });

    this.storage.get('role').then((role: Role) => {
      // this.role = role;
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
      // tslint:disable-next-line: no-bitwise
      this.isLecturer = Boolean(role & Role.Lecturer);
      // tslint:disable-next-line: no-bitwise
      this.isAdmin = Boolean(role & Role.Admin);

      this.settings.get$('dashboardSections')
        .subscribe(data => this.activeDashboardSections = data);

      this.settings.get$('hideProfilePicture').subscribe(data =>
        this.hideProfilePicture = data
      );

      this.settings.get$('enableMalaysiaTimezone').subscribe(data =>
        this.enableMalaysiaTimezone = data
      );

      combineLatest([
        this.settings.get$('busFirstLocation'),
        this.settings.get$('busSecondLocation'),
      ]).subscribe(([busFirstLocation, busSecondLocation]) => {
        this.firstLocation = busFirstLocation;
        this.secondLocation = busSecondLocation;
      });

      // if (this.platform.is('cordova')) {
      //   this.runCodeOnReceivingNotification(); // notifications
      // }

      this.settings.initialSync();
      this.doRefresh();
    });
  }

  getUserVaccinationInfo() {
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo>('/covid19/user');
  }

  doRefresh(refresher?) {
    // Get TransiX Trips
    combineLatest([
      this.settings.get$('busFirstLocation'),
      this.settings.get$('busSecondLocation'),
    ]).subscribe(([busFirstLocation, busSecondLocation]) => {
      if (busFirstLocation !== this.firstLocation || busSecondLocation !== this.secondLocation
        || busFirstLocation !== this.firstLocation && busSecondLocation !== this.secondLocation) {
        this.upcomingTrips$ = this.getUpcomingTrips(busFirstLocation, busSecondLocation);
      }
    });

    // tslint:disable-next-line:no-bitwise
    this.news$ = this.news.get(refresher, this.isStudent, this.isLecturer || this.isAdmin).pipe(
      map(newsList => {
        return newsList.map(item => {
          if (item && item.featured_media_source.length > 0 && item.featured_media_source[0].source_url) {
            return {
              url: item.featured_media_source[0].source_url,
              title: item.title && item.title.rendered ? item.title.rendered : '',
              updated: item.modified ? new Date(item.modified) : '',
              body: item.content && item.content.rendered ? item.content.rendered : ''
            };
          }
        }).slice(0, 6);
      }),
    );
    // Get Quotes
    this.quote$ = this.ws.get<Quote>('/apspacequote', { auth: false });
    // Get Holiday TransiX
    this.holidays$ = this.getHolidays(true);
    // Get Upcoming Trips
    this.upcomingTrips$ = this.getUpcomingTrips(this.firstLocation, this.secondLocation);
    // Get Student Photo
    this.photo$ = this.ws.get<StudentPhoto>('/student/photo')
      .pipe(map(image => image.base64_photo = `data:image/jpg;base64,${image?.base64_photo}`));  // no-cache for student photo

    if (!this.isStudent) {
      this.getUpcomingEvents();
    }

    this.apcardTransaction$ = this.getTransactions(true); // no-cache for APCard transactions

    this.getBadge();

    const forkJoinArray = [this.getProfile(refresher)];
    this.getUserVaccinationInfo();
    if (this.isStudent) {
      forkJoinArray.push(this.financial$ = this.getOverdueFee(true));
    }

    forkJoin(forkJoinArray).pipe(
      finalize(() => refresher && refresher.target.complete()),
    ).subscribe();
  }

  // NOTIFICATIONS FUNCTIONS
  getBadge() {
    this.notificationService.getMessages().subscribe(res => {
      this.numberOfUnreadMsgs = +res.num_of_unread_messages;
    });
  }

  getHolidays(refresher: boolean): Observable<any> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    return this.ws.get<TransixHolidaySet[]>('/v2/transix/holiday/active', { url: this.transixDevUrl, caching }).pipe(
      // Auto Refresh if Holidays Not Found
      switchMap(sets => {
        const currentYear = new Date().getFullYear();

        return refresher || sets.find(s => s.year === currentYear) ? of(sets.find(s => s.year === currentYear)) : this.getHolidays(true);
      }),
      shareReplay(1)
    );
  }
  // v4: this will need to mirgate in the future
  // this will fail when the user opens the app for the first time and login because it will run before login
  // => we need to call it here and in login page as well
  // runCodeOnReceivingNotification() {
  //   this.firebaseX.onMessageReceived().subscribe(data => {
  //     if (data.tap) { // Notification received in background
  //       this.notificationService.getMessageDetail(data.message_id).subscribe(notificationData => {
  //         this.openNotificationModal(notificationData);
  //       });
  //     } else { // Notification received in foreground
  //       this.showNotificationAsToast(data);
  //     }
  //   });
  // }

  // async showNotificationAsToast(data: any) {
  //   // need to check with dingdong team about response type
  //   const toast = await this.toastCtrl.create({
  //     header: 'New Message',
  //     message: data.title,
  //     position: 'top',
  //     color: 'primary',
  //     buttons: [
  //       {
  //         icon: 'open',
  //         handler: () => {
  //           this.notificationService.getMessageDetail(data.message_id).subscribe(notificationData => {
  //             this.openNotificationModal(notificationData);
  //           });
  //           // this.openNotificationModal(data);
  //         }
  //       }, {
  //         icon: 'close',
  //         role: 'cancel',
  //         handler: () => { }
  //       }
  //     ]
  //   });
  //   toast.present();
  // }

  // async openNotificationModal(message: any) {
  //   // need to check with dingdong team about response type
  //   const modal = await this.modalCtrl.create({
  //     component: NotificationModalPage,
  //     componentProps: { message, notFound: 'No Message Selected' },
  //   });
  //   await modal.present();
  //   await modal.onDidDismiss();
  // }

  getProfile(refresher: boolean) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.isStudent ? this.ws.get<StudentProfile>('/student/profile', { caching }).pipe(
      // no-cache for results
      tap(() => { this.cgpaPerIntake$ = this.getCgpaPerIntakeData(true); }),
      tap(p => {
        this.orientationStudentDetails$ = this.ws.get<OrientationStudentDetails>(`/orientation/student_details?id=${p.STUDENT_NUMBER}`,
        ).pipe(
          catchError(err => {
            return of(err);
          }),
          tap(response => {
            if (response.status === 200) {
              if (response.councelor_details.length > 0) {
                this.showAnnouncement = true;
              }
            }
          })
        );
      }),
      tap(studentProfile => this.userProfile = studentProfile),
      tap(studentProfile => this.lecturerContacts$ = this.getLecturersContact(studentProfile.INTAKE, refresher)),
      tap(studentProfile => this.getTodaysSchedule(studentProfile.INTAKE, refresher)),
      tap(studentProfile => this.getUpcomingEvents(studentProfile.INTAKE, refresher)), // INTAKE NEEDED FOR EXAMS
    ) : this.staffProfile$ = this.ws.get<StaffProfile>('/staff/profile', { caching }).pipe(
      tap(staffProfile => this.userProfile = staffProfile[0]),
      tap(_ => {
        this.settings.get$('changedName').subscribe(res => {
          if (res) {
            this.userProfileName$ = this.settings.get$('userProfileName').pipe(
              map(data => {
                return data.join(' ');
              })
            );
          } else {
            this.userProfileName$ = of(this.userProfile.FULLNAME);
          }
        });
      }),
      tap(staffProfile => this.getTodaysSchedule(staffProfile[0].ID)),
      shareReplay(1)
    );
  }

  async newsDetails(newsItem: ShortNews) {
    const modal = await this.modalCtrl.create({
      component: NewsDetailsModalPage,
      componentProps: {
        newsItem
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    modal.present();
  }

  // TODAYS SCHEDULE FUNCTIONS
  getTodaysSchedule(intakeOrStaffId: string, refresher?: boolean) {
    // MERGE TWO OBSERVABLES TOGETHER (UPCOMING CONSULTATIONS AND UPCOMING CLASSES)
    this.todaysSchedule$ = combineLatest([
      // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
      this.isStudent ? this.getUpcomingClassesForStudent(intakeOrStaffId.replace(/[(]AP[)]|[(]BP[)]/g, ''), refresher)
        : this.getUpcomingClassesForLecturer(intakeOrStaffId),
      // tslint:disable-next-line: max-line-length
      this.isStudent ? this.getUpcomingConsultationsForStudents() : this.getUpcomingConsultationsForStaff() // no-cache for upcoming consultations (students)
    ]).pipe(
      map(x => x[0].concat(x[1])), // MERGE THE TWO ARRAYS TOGETHER
      map(eventsList => {  // SORT THE EVENTS LIST BY TIME
        return eventsList.sort((eventA, eventB) => {
          // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
          return parse(eventA.dateOrTime, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date()) > parse(eventB.dateOrTime, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date())
            ? 1
            // tslint:disable-next-line: quotemark tslint:disable-next-line: max-line-length
            : parse(eventA.dateOrTime, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date()) < parse(eventB.dateOrTime, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date())
              ? -1
              : 0;
        });
      })
    );
  }

  // FUNCTION POSSIBLE TO MERGE? M01
  getUpcomingClassesForStudent(intake: string, refresher): Observable<EventComponentConfigurations[]> {
    this.timetableDefaultIntake = intake;
    const dateNow = new Date();
    return combineLatest([
      this.studentTimetableService.get(refresher),
      this.settings.get$('modulesBlacklist'),
    ]).pipe(

      // FILTER BLACKLISTED TIMETABLE
      map(([timetables, modulesBlacklist]) =>
        timetables.filter(timetable => !modulesBlacklist.includes(timetable.MODID))),

      // FILTER THE LIST OF TIMETABLES TO GET THE TIMETABLE FOR THE SELECTED INTAKE ONLY
      map(timetables => timetables.filter(timetable => timetable.INTAKE === intake)),

      // FILTER GROUPING
      map(timetables => {
        this.intakeGroup = this.settings.get('intakeGroup');
        if (this.intakeGroup && this.intakeGroup !== 'All') {
          return timetables.filter(timetable => (timetable.GROUPING === this.intakeGroup));
        } else {
          return timetables;
        }
      }),

      // GET TODAYS CLASSES ONLY
      map(intakeTimetable => intakeTimetable.filter(timetable => this.eventIsToday(new Date(timetable.DATESTAMP_ISO), dateNow))),

      // CONVERT TIMETABLE OBJECT TO THE OBJECT EXPECTED IN THE EVENT COMPONENT
      map((timetables: StudentTimetable[]) => {
        const timetableEventMode: EventComponentConfigurations[] = [];
        timetables.forEach((timetable: StudentTimetable) => {
          let classPass = false;
          if (this.eventPass(timetable.TIME_FROM_ISO, dateNow)) { // CHANGE CLASS STATUS TO PASS IF IT PASS
            classPass = true;
          }
          timetableEventMode.push({
            title: timetable.MODULE_NAME + ' | ' + timetable.MODID,
            firstDescription: timetable.LOCATION + ' | ' + timetable.ROOM,
            secondDescription: timetable.NAME,
            // tslint:disable-next-line: quotemark
            thirdDescription: timetable.TIME_TO_ISO,
            color: '#27ae60',
            pass: classPass,
            passColor: '#d7dee3',
            outputFormat: 'event-with-time-and-hyperlink',
            type: 'class',
            // tslint:disable-next-line: quotemark
            dateOrTime: timetable.TIME_FROM_ISO,
          });
        });
        return timetableEventMode;
      })
    );
  }

  // Lecturers Contact
  getLecturersContact(intake: string, refresher) {
    this.timetableDefaultIntake = intake;
    return this.studentTimetableService.get(refresher).pipe(
      // FILTER THE LIST OF TIMETABLES TO GET THE TIMETABLE FOR THE SELECTED INTAKE ONLY
      map(timetables => timetables.filter(timetable => timetable.INTAKE === intake)),

      // FILTER GROUPING
      map(timetableContacts => {
        this.intakeGroup = this.settings.get('intakeGroup');
        if (this.intakeGroup && this.intakeGroup !== 'All') {
          timetableContacts.filter(timetable => (timetable.GROUPING === this.intakeGroup));

          // Convert object to array of objects
          const contacts = Object.keys(timetableContacts).map(res => timetableContacts[res]);

          // Remove same lecturers using lecturer ID
          const uniqueContacts = Array.from(new Set(contacts.map(contact => contact.LECTID))).map(lectID => {
            return contacts.find(contact => contact.LECTID === lectID);
          });
          return uniqueContacts;
        } else {
          // Convert object to array of objects
          const contacts = Object.keys(timetableContacts).map(res => timetableContacts[res]);

          // Remove same lecturers using lecturer ID
          const uniqueContacts = Array.from(new Set(contacts.map(contact => contact.LECTID))).map(lectID => {
            return contacts.find(contact => contact.LECTID === lectID);
          });
          return uniqueContacts;
        }
      }),
    );
  }

  chatTeams(staffEmail: string) {
    this.appLauncherService.chatInTeams(staffEmail);
  }

  // FUNCTION POSSIBLE TO MERGE? M01
  getUpcomingClassesForLecturer(staffId: string): Observable<EventComponentConfigurations[]> {
    const d = new Date();
    const date = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    // const endpoint = '/lecturer-timetable/v2/' + 'anrazali'; // For testing
    const endpoint = '/lecturer-timetable/v2/' + staffId;
    return this.ws.get<LecturerTimetable[]>(endpoint, { auth: false, caching: 'cache-only' }).pipe(
      // GET TODAYS CLASSES ONLY
      map(timetable => timetable.filter(tt => this.eventIsToday(new Date(tt.time), d))),
      // REFRESH LECTURER TIMETABLE ONLY IF NO CLASSES IN LECTURER TIMETABLE AND NOT A HOLIDAY
      switchMap(timetables => timetables.length !== 0
        ? of(timetables)
        : this.holidays$.pipe(
          switchMap(holidays => holidays.holidays.find(holiday => date === holiday.holiday_start_date.toString()) ? of(timetables) : this.ws.get<LecturerTimetable[]>(endpoint, { auth: false, caching: 'network-or-cache' }).pipe(
            map(timetable => timetable.filter(tt => this.eventIsToday(new Date(tt.time), d))),
          ))
        )
      ),
      // CONVERT TIMETABLE OBJECT TO THE OBJECT EXPECTED IN THE EVENT COMPONENT
      map((timetables: LecturerTimetable[]) => {
        const timetableEventMode: EventComponentConfigurations[] = [];

        timetables.forEach((timetable: LecturerTimetable) => {
          let classPass = false;
          // tslint:disable-next-line: quotemark
          if (this.eventPass(format(new Date(timetable.time), "yyyy-MM-dd'T'HH:mm:ssXXX"), d)) { // CHANGE CLASS STATUS TO PASS IF IT PASS
            classPass = true;
          }

          timetableEventMode.push({
            title: timetable.module,
            firstDescription: timetable.location + ' | ' + timetable.room,
            secondDescription: timetable.intakes.join(', '),
            // tslint:disable-next-line: quotemark
            thirdDescription: format(Date.parse(timetable.time) + timetable.duration * 1000, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            color: '#27ae60',
            pass: classPass,
            passColor: '#d7dee3',
            outputFormat: 'event-with-time-and-hyperlink',
            type: 'class',
            dateOrTime: timetable.time
          });

        });

        return timetableEventMode;
      })
    );
  }

  getUpcomingConsultationsForStudents(): Observable<EventComponentConfigurations[]> {
    const dateNow = new Date();
    let consultationsEventMode: EventComponentConfigurations[] = [];
    return forkJoin([this.ws.get<ConsultationHour[]>('/iconsult/bookings?'),
    this.ws.get<StaffDirectory[]>('/staff/listing')
    ]).pipe(
      tap(_ => consultationsEventMode = []),
      map(([consultations, staffList]) => {
        const filteredConsultations = consultations.filter(
          consultation => this.eventIsToday(
            this.enableMalaysiaTimezone ? utcToZonedTime(new Date(consultation.slot_start_time), 'Asia/Kuala_Lumpur')
              : new Date(consultation.slot_start_time), dateNow)
            && consultation.status === 'Booked'
        );

        const staffUsernames = new Set(filteredConsultations.map(consultation =>
          consultation.slot_lecturer_sam_account_name.toLowerCase()));
        const staffKeyMap = staffList
          .filter(staff => staffUsernames.has(staff.ID.toLowerCase()))
          .reduce(
            (previous, current) => {
              previous[current.ID] = current;

              return previous;
            },
            {}
          );
        const listOfBookingWithStaffDetail = filteredConsultations.map(
          consultation => ({
            ...consultation,
            ...{
              staff_detail: staffKeyMap[consultation.slot_lecturer_sam_account_name]
            }
          })
        );
        listOfBookingWithStaffDetail.forEach(upcomingConsultation => {
          let consultationPass = false;
          // tslint:disable-next-line: quotemark
          if (this.eventPass(format(new Date(upcomingConsultation.slot_start_time), "yyyy-MM-dd'T'HH:mm:ssXXX"), dateNow)) {
            // CHANGE CLASS STATUS TO PASS IF IT PASS
            consultationPass = true;
          }
          consultationsEventMode.push({
            title: 'Consultation Hour',
            color: '#d35400',
            outputFormat: 'event-with-time-and-hyperlink',
            type: 'iconsult',
            pass: consultationPass,
            passColor: '#d7dee3',
            firstDescription: upcomingConsultation.slot_room_code + ' | ' + upcomingConsultation.slot_venue,
            secondDescription: upcomingConsultation.staff_detail.FULLNAME,
            // tslint:disable-next-line: quotemark
            thirdDescription: format(new Date(upcomingConsultation.slot_end_time), "yyyy-MM-dd'T'HH:mm:ssXXX"),
            // tslint:disable-next-line: quotemark
            dateOrTime: format(new Date(upcomingConsultation.slot_start_time), "yyyy-MM-dd'T'HH:mm:ssXXX"),
          });
        });
        return consultationsEventMode;
      }
      )
    );
  }

  getUpcomingConsultationsForStaff(): Observable<EventComponentConfigurations[]> {
    const dateNow = new Date();
    let consultationsEventMode: EventComponentConfigurations[] = [];
    return this.ws.get<ConsultationSlot[]>('/iconsult/slots?').pipe(
      tap(_ => consultationsEventMode = []),
      map(consultations =>
        consultations.filter(
          consultation => this.eventIsToday(
            this.enableMalaysiaTimezone ? utcToZonedTime(new Date(consultation.start_time), 'Asia/Kuala_Lumpur')
              : new Date(consultation.start_time), dateNow)
            && consultation.status === 'Booked'
        )
      ),
      map(upcomingConsultations => {
        upcomingConsultations.forEach(upcomingConsultation => {
          let consultationPass = false;
          // tslint:disable-next-line: quotemark
          if (this.eventPass(format(new Date(upcomingConsultation.start_time), "yyyy-MM-dd'T'HH:mm:ssXXX"), dateNow)) {
            // CHANGE CLASS STATUS TO PASS IF IT PASS
            consultationPass = true;
          }
          consultationsEventMode.push({
            title: 'Consultation Hour',
            color: '#d35400',
            outputFormat: 'event-with-time-and-hyperlink',
            type: 'iconsult',
            pass: consultationPass,
            passColor: '#d7dee3',
            firstDescription: upcomingConsultation.room_code + ' | ' + upcomingConsultation.venue,
            // tslint:disable-next-line: quotemark
            thirdDescription: format(new Date(upcomingConsultation.end_time), "yyyy-MM-dd'T'HH:mm:ssXXX"),
            // tslint:disable-next-line: quotemark
            dateOrTime: format(new Date(upcomingConsultation.start_time), "yyyy-MM-dd'T'HH:mm:ssXXX"),
          });
        });
        return consultationsEventMode;
      })
    );
  }

  eventIsToday(eventDate: Date, todaysDate: Date) {
    return eventDate.getFullYear() === todaysDate.getFullYear()
      && eventDate.getMonth() === todaysDate.getMonth()
      && eventDate.getDate() === todaysDate.getDate();
  }

  eventIsComing(eventDate: Date, todaysDate: Date) {
    eventDate.setHours(todaysDate.getHours()); // MAKE THE EVENT TIME EQUAL TO TODAYS TIME TO COMPARE ONLY DATES
    eventDate.setMinutes(todaysDate.getMinutes());
    eventDate.setSeconds(todaysDate.getSeconds());
    eventDate.setMilliseconds(todaysDate.getMilliseconds());
    return eventDate > todaysDate;
  }

  eventPass(eventTime: string, todaysDate: Date) {
    // tslint:disable-next-line: quotemark
    if (parse(eventTime, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date()) >= todaysDate) {
      return false;
    }
    return true;
  }


  // UPCOMING EVENTS FUNCTIONS
  getUpcomingEvents(intake?: string, refresher?: boolean) {
    const todaysDate = new Date();
    this.upcomingEvent$ = this.isStudent ? zip(
      // AP & BP Removed Temp (Requested by Management | DON'T TOUCH)
      this.getupcomingExams(intake.replace(/[(]AP[)]|[(]BP[)]/g, ''), todaysDate, true),
      this.getUpcomingHoliday(todaysDate, refresher),
      // this.getUpcomingMoodle(todaysDate, refresher) //API is down
    ).pipe(
      map(x => this.getSortEvents(x[0].concat(x[1]))) // MERGE THE TWO ARRAYS TOGETHER // NOW THREE
    ) : this.getUpcomingHoliday(todaysDate);
  }

  getupcomingExams(intake: string, todaysDate: Date, refresher: boolean): Observable<EventComponentConfigurations[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws.get<ExamSchedule[]>(
      `/examination/${intake}`,
      { auth: false, caching },
    ).pipe(
      map(examsList => {
        return examsList.filter(exam => this.eventIsComing(new Date(exam.since), todaysDate));
      }),
      map(examsList => {
        const examsListEventMode: EventComponentConfigurations[] = [];
        examsList.forEach((exam: ExamSchedule) => {
          const formattedStartDate = format(new Date(exam.since), 'dd MMM yyyy');
          examsListEventMode.push({
            title: exam.subjectDescription,
            firstDescription: exam.venue,
            secondDescription: exam.since,
            secondDescriptionIsDate: true,
            thirdDescription: exam.until,
            color: '#ff0000',
            pass: false,
            passColor: '#d7dee3',
            outputFormat: 'event-with-date-only',
            type: 'exam',
            dateOrTime: formattedStartDate
          });
        });
        return examsListEventMode;
      })
    );
  }

  getUpcomingHoliday(date: Date, refresher?: boolean): Observable<EventComponentConfigurations[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    return this.ws.get<TransixHolidaySet[]>('/v2/transix/holiday/active', { url: this.transixDevUrl, caching }).pipe(
      map(sets => sets[0].holidays),
      map(holidays => {
        const studentHoliday = holidays
          .filter(h => h.holiday_people_affected === 'students' || h.holiday_people_affected === 'all')
          .find(h => date < new Date(h.holiday_start_date)) || {} as TransixHoliday;

        const staffHoliday = holidays
          .filter(h => h.holiday_people_affected === 'staffs' || h.holiday_people_affected === 'all')
          .find(h => date < new Date(h.holiday_start_date)) || {} as TransixHoliday;

        const holiday = this.isStudent ? studentHoliday : staffHoliday;
        const examsListEventMode: EventComponentConfigurations[] = [];
        const formattedStartDate = format(new Date(holiday.holiday_start_date), 'dd MMM yyyy');

        examsListEventMode.push({
          title: holiday.holiday_name,
          firstDescription: this.getNumberOfDaysForHoliday(holiday.holiday_start_date, holiday.holiday_end_date),
          color: '#273160',
          pass: false,
          passColor: '#d7dee3',
          outputFormat: 'event-with-date-only',
          type: 'holiday',
          dateOrTime: formattedStartDate
        });

        return examsListEventMode
      })
    );
  }

  getNumberOfDaysForHoliday(startDate: Date, endDate: Date): string {
    const difference = differenceInDays(new Date(startDate), new Date(endDate));

    return `${difference + 1} day${difference === 0 ? '' : 's'}`;
  }

  getUpcomingMoodle(date: Date, refresher?: boolean): Observable<EventComponentConfigurations[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws.get<MoodleEvent[]>('/moodle/events',
      { auth: true, caching },
    ).pipe(
      map(moodleList => {
        if (moodleList) {
          return moodleList.filter(moodle => this.eventIsComing(new Date(moodle.timestart), date));
        }
      }),
      map(moodleList => {
        const moodleListEventMode: EventComponentConfigurations[] = [];
        if (moodleList) {
          moodleList.forEach((moodleEvent: MoodleEvent) => {
            const formattedStartDate = format(new Date(moodleEvent.timestart), 'dd MMM yyyy');
            moodleListEventMode.push({
              title: moodleEvent.name,
              firstDescription: this.getNumberOfDaysForHoliday(
                date, (new Date(moodleEvent.timestart))
              ) + ' left',
              color: '#e85d04',
              pass: false,
              passColor: '#d7dee3',
              outputFormat: 'event-with-time-and-hyperlink',
              type: 'moodle',
              dateOrTime: formattedStartDate + ' (Moodle)',
              moodleCourseId: moodleEvent.courseid
            });
          });
        }
        return moodleListEventMode;
      })
    );
  }

  getSortEvents(event: EventComponentConfigurations[]): EventComponentConfigurations[] {
    const sortedEvents: EventComponentConfigurations[] = event.sort((a, b): number => {
      const da = new Date(a.dateOrTime);
      const db = new Date(b.dateOrTime);
      return da.getTime() - db.getTime();
    });
    return sortedEvents;
  }

  // APCARD FUNCTIONS
  getTransactions(refresher) {
    return this.ws.get<Apcard[]>('/apcard/', refresher).pipe(
      tap(transactions => this.analyzeTransactions(transactions)),
      // tap(transactions => this.getCurrentApcardBalance(transactions))
    );
  }

  // getCurrentApcardBalance(transactions) {
  //   if (transactions.length > 0) {
  //     this.balance$ = of({ value: transactions[0].Balance });
  //   } else {
  //     this.balance$ = of({ value: -1 });
  //   }
  // }

  analyzeTransactions(transactions: Apcard[]) {
    // stop analyzing if transactions is empty
    if (transactions.length === 0) {
      this.currentBalance = -1;
      return;
    }
    this.currentBalance = transactions[0].Balance;

    const now = new Date();
    const a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const monthlyData = transactions.reduce(
      (tt, t) => {
        const c = t.SpendVal < 0 ? 'dr' : 'cr'; // classify spent type
        const d = new Date(t.SpendDate);
        if (!(d.getFullYear() in tt[c])) {
          (tt[c][d.getFullYear()] = a.slice());
        }
        tt[c][d.getFullYear()][d.getMonth()] += t.SpendVal;
        return tt;
        // default array with current year
      },
      {
        dr: { [now.getFullYear()]: a.slice() },
        cr: { [now.getFullYear()]: a.slice() }
      }
    );
    // plot graph
    this.apcardChart.data.datasets[0].data = monthlyData.cr[now.getFullYear()];
    this.apcardChart.data.datasets[1].data = monthlyData.dr[now.getFullYear()];
  }

  // FINANCIALS FUNCTIONS
  getOverdueFee(refresher: boolean): Observable<FeesTotalSummary | any> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws.get<FeesTotalSummary[]>(
      '/student/summary_overall_fee',
      { caching }
    ).pipe(
      tap(overdueSummary => {
        this.financialsChart.data = {
          labels: ['Financial Status'],
          datasets: [
            {
              label: 'Paid',
              data: [+overdueSummary[0].TOTAL_PAID],
              backgroundColor: 'rgb(73, 181, 113, .7)' // GREEN
            },
            {
              label: 'Outstanding',
              data: [+overdueSummary[0].TOTAL_OUTSTANDING],
              backgroundColor: 'rgba(241, 196, 15, .8)' // YELLOW
            },
            {
              label: 'Overdue',
              data: [+overdueSummary[0].TOTAL_OVERDUE],
              backgroundColor: 'rgb(224, 20, 57, .7)' // RED
            }
          ]
        };
      })
    );
  }

  // CGPA FUNCTIONS
  getCgpaPerIntakeData(refresher: boolean): Observable<CgpaPerIntake | any> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws
      .get<Course[]>('/student/courses', { caching })
      .pipe(
        mergeMap(intakes => intakes),
        concatMap(intake => {
          const url = `/student/sub_and_course_details?intake=${intake.INTAKE_CODE
            }`;
          return this.ws.get<CourseDetails>(url, { caching }).pipe(
            map(intakeDetails =>
              Object.assign({
                intakeDate: intake.INTAKE_NUMBER,
                intakeCode: intake.INTAKE_CODE,
                intakeDetails,
              }),
            ),
          );
        }),
        toArray(),
        tap(
          d => {
            const data = Array.from(
              new Set(
                (d || []).map(t => ({
                  intakeCode: t.intakeCode,
                  gpa: t.intakeDetails,
                })),
              ),
            );
            const filteredData = data.reverse().filter((res: any) => res.gpa[res.gpa.length - 2]).reverse();
            const labels = filteredData.map((i: any) => i.intakeCode);
            const gpa = filteredData.map((i: any) => i.gpa[i.gpa.length - 2].IMMIGRATION_GPA);
            this.cgpaChart = {
              options: {
                indexAxis: 'y',
                scales: {
                  x: {
                    max: 4,
                    min: 0,
                  },
                  y: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0)',
                    },
                    beginAtZero: true,
                    ticks: {
                      mirror: true,
                      color: 'rgba(' + this.activeAccentColor + ', 1)',
                      font: {
                        style: "normal",
                        weight: 'bolder',
                      },
                    },
                  }
                },
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
              },
              data: {
                labels,
                datasets: [
                  {
                    backgroundColor: 'rgba(98, 98, 98, 0.3)',
                    hoverBackgroundColor: 'rgba(' + this.activeAccentColor + ', .3)',
                    borderColor: '#636363',
                    borderWidth: 2,
                    hoverBorderColor: 'rgba(' + this.activeAccentColor + ', 1)',
                    hoverBorderWidth: 2,
                    data: gpa,
                  },
                ],
              }
            };
          }
        ),
        catchError(err => {
          console.error(err);
          return of();
        }
        )
      );
  }

  getUpcomingTrips(firstLocation: string, secondLocation: string) {
    if (!firstLocation || !secondLocation) {
      this.showSetLocationsSettings = true;
      return of([]);
    }
    this.showSetLocationsSettings = false;
    const currentDate = new Date();

    return this.ws.get<TransixScheduleSet>('/v2/transix/schedule/active', { url: this.transixDevUrl }).pipe(
      map(res => res.trips),
      map(trips => {
        return trips.filter(trip => {
          return trip.day === this.getTodayDay(currentDate)
            && ((trip.trip_from.name === firstLocation && trip.trip_to.name === secondLocation)
              || (trip.trip_from.name === secondLocation && trip.trip_to.name === firstLocation));
        });
      }),
      map(trips => {
        return trips.reduce(
          (prev, curr) => {
            prev[curr.trip_from.name + curr.trip_to.name] = prev[curr.trip_from.name + curr.trip_to.name] || {
              trip_from: curr.trip_from.name,
              trip_from_color: curr.trip_from.color,
              trip_to: curr.trip_to.name,
              trip_to_color: curr.trip_to.color,
              times: []
            };

            prev[curr.trip_from.name + curr.trip_to.name].times.push(curr.time);
            return prev;
          },
          {}
        );
      }),
      map(trips => Object.keys(trips).map(key => trips[key]))
    );
  }

  // QUICK ACCESS FUNCTIONS
  openMoodle() {
    const url = 'https://lms2.apiit.edu.my/login/index.php';
    this.cas.getST(url).subscribe(st => {
      this.component.openLink(`${url}?ticket=${st}`);
    });
  }

  navigateToPage(pageName: string) {
    this.navCtrl.navigateForward(pageName);
  }

  logout() {
    const btn: AlertButton = {
      text: 'Logout',
      cssClass: 'danger',
      handler: () => {
        this.navCtrl.navigateForward('/logout');
      }
    };

    this.component.alertMessage('Warning', 'Are you sure you want to log out?', 'danger', 'Cancel', btn);
  }

  // GET DAY SHORT NAME (LIKE 'SAT' FOR SATURDAY)
  getTodayDay(date: Date) {
    const dayRank = date.getDay();
    if (dayRank === 0) {
      return 'sun';
    } else if (dayRank > 0 && dayRank <= 5) {
      return 'mon-fri';
    } else {
      return 'sat';
    }
  }

  openMoodleEvent(courseId: number) {
    const courseUrl = `https://lms2.apiit.edu.my/course/view.php`;
    const url = 'https://lms2.apiit.edu.my/login/index.php';
    this.cas.getST(url).subscribe(() => {
      this.component.openLink(`${courseUrl}?id=${courseId}&`);
    });
  }

  // initPushNotification() {
  //   if (!this.pushInit) {
  //     this.pushInit = true;
  //     this.fcm.updatePushPermission();
  //   }
  // }
}




