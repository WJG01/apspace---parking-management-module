import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { AlertController, IonSlides, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format, parse, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Observable, Subscription, combineLatest, forkJoin, of, zip } from 'rxjs';
import { catchError, concatMap, finalize, map, mergeMap, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { accentColors } from 'src/app/constants';
import {
  APULocation, APULocations,
  Apcard, BusTrips, CgpaPerIntake, ConsultationHour, ConsultationSlot,
  Course, CourseDetails, DashboardCardComponentConfigurations,
  EventComponentConfigurations, ExamSchedule, FeesTotalSummary, Holiday, Holidays, LecturerTimetable,
  MoodleEvent, News, OrientationStudentDetails, Quote, Role, ShortNews,
  StaffDirectory, StaffProfile, StudentPhoto, StudentProfile, StudentTimetable
} from 'src/app/interfaces';
import {
  AppLauncherService, CasTicketService,
  NewsService, NotificationService, SettingsService, StudentTimetableService,
  WsApiService,
} from 'src/app/services';
import { DateWithTimezonePipe } from 'src/app/shared/date-with-timezone/date-with-timezone.pipe';
import { NotifierService } from 'src/app/shared/notifier/notifier.service';
import { NewsModalPage } from '../news/news-modal';
import { NotificationModalPage } from '../notifications/notification-modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  providers: [DateWithTimezonePipe]
})
export class DashboardPage implements OnInit, DoCheck {
  // USER SETTINGS
  @ViewChild('slides') slides: IonSlides;

  @ViewChild('imageSliderSlides') sliderSlides: IonSlides;
  imageSliderOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: true,
    centeredContent: true,
    speed: 400,
    loop: true,
    autoplayDisableOnInteraction: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (_, className) => {
        return '<span style="width: 10px; height: 10px; background-color: #E50565 !important;" class="' + className + '"></span>';
      }
    }
  };

  noticeSlideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: true,
    centeredContent: false,
    speed: 500,
    loop: false,
    autoplayDisableOnInteraction: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (_, className) => {
        return '<span style="width: 10px; height: 10px; background-color: #E50565 !important;" class="' + className + '"></span>';
      }
    }
  };

  role: Role;
  isStudent: boolean;
  isLecturer: boolean;
  isCordova: boolean;
  skeletons = new Array(5);

  timeFormatChangeFlag: boolean;
  notification: Subscription;


  scheduleSegment: 'today' | 'upcoming' = 'today';


  // shownDashboardSections get the data from local storage and hide/show elements based on that
  activeDashboardSections: string[] = [];

  hideProfilePicture;
  userProfileName$: Observable<string>;
  changedName: boolean;

  activeAccentColor = '';
  lowAttendanceChart: any;
  editableList = null;
  busShuttleServiceSettings: any;
  secondLocation: string;
  firstLocation: string;

  // QUOTE
  quote$: Observable<Quote>;

  // HOLIDAYS
  holidays$: Observable<Holiday[]>;

  // PROFILE
  staffProfile$: Observable<StaffProfile>;
  photo$: Observable<StudentPhoto>;
  greetingMessage = '';
  orientationStudentDetails$: Observable<OrientationStudentDetails>;
  councelorProfile$: Observable<StaffDirectory>;
  // attendance default intake can be different from timetable default intake
  // attendanceDefaultIntake = '';
  timetableDefaultIntake = '';
  userProfile: any = {};
  block = false;
  numberOfUnreadMsgs: number;
  showAnnouncement = false;

  // TODAY'S SCHEDULE
  todaysSchedule$: Observable<EventComponentConfigurations[] | any>;
  todaysScheduleCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'Today\'s Schedule',
  };
  intakeGroup = '';

  // UPCOMING EVENTS
  upcomingEvent$: Observable<EventComponentConfigurations[]> | any;
  upcomingEventsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'Upcoming Events',
    cardSubtitle: 'Today: ' + format(new Date(), 'dd MMMM yyyy')
  };

  // UPCOMING MOODLE EVENTS
  moodleEvents$: Observable<MoodleEvent[]>;

  // ATTENDANCE
  // modulesWithLowAttendance$: Observable<Attendance[]>;
  // overallAttendancePercent$: Observable<{ value: number }>;
  subject: string;
  lowAttendanceCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'Attendance Summary',
    contentPadding: true
  };

  // APCARD
  balance$: Observable<{ value: number }>;
  apcardTransaction$: Observable<Apcard[]>;
  monthlyData: any;
  currentBalance: number;
  apcardTransactionsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'APCard Transactions',
    contentPadding: true
  };
  apcardChart = {
    type: 'line',
    options: {
      legend: {
        display: true,
        position: 'top',
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
          fill: true,
        },
        {
          label: 'Monthly Debit',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(224, 20, 57, .7)',
          backgroundColor: 'rgb(224, 20, 57, .3)',
          fill: true,
        },
      ],
    }
  };

  // FINANCIALS
  totalOverdue$: Observable<{ value: number }>;
  hasOutstanding: boolean;
  financial$: Observable<FeesTotalSummary>;
  financialsChart = {
    type: 'bar',
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }]
      },
      responsive: true
    },
    data: {}
  };
  financialsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'Financials',
    contentPadding: true
  };

  // UPCOMING TRIPS
  upcomingTrips$: Observable<any>;
  showSetLocationsSettings = false;
  locations: APULocation[];
  busCardConfigurations: DashboardCardComponentConfigurations = {
    cardTitle: 'Upcoming Trips',
    contentPadding: false,
    withOptionsButton: false
  };

  // CONTACTS
  lecturerContacts$: Observable<any>;

  // NEWS
  news$: Observable<ShortNews[]>;
  newsCardConfigurations: DashboardCardComponentConfigurations = {
    cardTitle: 'Latest News',
    contentPadding: false,
    withOptionsButton: false
  };
  newsIndexToShow = 0; // open the first news section by default
  noticeBoardCardConfigurations: DashboardCardComponentConfigurations = {
    cardTitle: 'Notice Board',
    contentPadding: false,
    withOptionsButton: false
  };
  noticeBoardItems$: Observable<any[]>;
  noticeBoardSliderOpts = {
    autoplay: true,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) { tx -= swiper.translate; }
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) { return; }
            if (!swiper || swiper.destroyed) { return; }
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    }
  };

  // CGPA
  cgpaChart: any;
  cgpaPerIntake$: Observable<CgpaPerIntake>;
  barChartData: any;
  overallCgpa = 0;
  cgpaCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: 'CGPA Per Intake',
    contentPadding: true
  };

  // timezone
  enableMalaysiaTimezone;

  constructor(
    private ws: WsApiService,
    private studentTimetableService: StudentTimetableService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private notificationService: NotificationService,
    private news: NewsService,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private cas: CasTicketService,
    private network: Network,
    private appLauncherService: AppLauncherService,
    private platform: Platform,
    private firebaseX: FirebaseX,
    private toastCtrl: ToastController,
    private settings: SettingsService,
    private storage: Storage,
    private notifierService: NotifierService,
    private dateWithTimezonePipe: DateWithTimezonePipe

  ) {
    // getting the main accent color to color the chart.js (Temp until removing chart.js)
    // TODO handle value change
    this.activeAccentColor = accentColors.find(ac => ac.name === this.settings.get('accentColor')).rgba;
  }

  ngOnInit() {
    this.isCordova = this.platform.is('cordova');
    this.notification = this.notifierService.timeFormatUpdated.subscribe(data => {
      if (data && data === 'SUCCESS') {
        this.timeFormatChangeFlag = !this.timeFormatChangeFlag;
      }
    });

    this.storage.get('role').then((role: Role) => {
      this.role = role;
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
      // tslint:disable-next-line: no-bitwise
      this.isLecturer = Boolean(role & Role.Lecturer);

      this.settings.get$('dashboardSections')
        .subscribe(data => this.activeDashboardSections = data);

      this.settings.get$('hideProfilePicture').subscribe(data =>
        this.hideProfilePicture = data
      );

      this.settings.get$('enableMalaysiaTimezone').subscribe(data =>
        this.enableMalaysiaTimezone = data
      );

      this.holidays$ = this.getHolidays(false);

      combineLatest([
        this.settings.get$('busFirstLocation'),
        this.settings.get$('busSecondLocation'),
      ]).subscribe(([busFirstLocation, busSecondLocation]) => {
        this.firstLocation = busFirstLocation;
        this.secondLocation = busSecondLocation;
      });

      if (this.platform.is('cordova')) {
        this.runCodeOnReceivingNotification(); // notifications
      }
      this.settings.initialSync();
      this.doRefresh();
    });
  }

  // For Upcoming Trips
  ngDoCheck() {
    combineLatest([
      this.settings.get$('busFirstLocation'),
      this.settings.get$('busSecondLocation'),
    ]).subscribe(([busFirstLocation, busSecondLocation]) => {
      if (busFirstLocation !== this.firstLocation || busSecondLocation !== this.secondLocation
        || busFirstLocation !== this.firstLocation && busSecondLocation !== this.secondLocation) {
        this.upcomingTrips$ = this.getUpcomingTrips(busFirstLocation, busSecondLocation);
      }
    });
  }

  doRefresh(refresher?) {
    this.getLocations(refresher);
    // tslint:disable-next-line:no-bitwise
    this.news$ = this.news.get(refresher, this.isStudent, this.isLecturer || Boolean(this.role & Role.Admin)).pipe(
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

    this.quote$ = this.ws.get<Quote>('/apspacequote', { auth: false });
    this.holidays$ = this.getHolidays(true);
    // tslint:disable-next-line: no-bitwise
    this.noticeBoardItems$ = this.news.getSlideshow(refresher, this.isStudent, this.isLecturer || Boolean(this.role & Role.Admin));
    this.upcomingTrips$ = this.getUpcomingTrips(this.firstLocation, this.secondLocation);
    this.photo$ = this.ws.get<StudentPhoto>('/student/photo');  // no-cache for student photo
    this.moodleEvents$ = this.ws.get<MoodleEvent[]>('/moodle/events', { auth: true });
    this.displayGreetingMessage();
    if (!this.isStudent) {
      this.getUpcomingEvents();
    }
    this.apcardTransaction$ = this.getTransactions(true); // no-cache for APCard transactions
    this.getBadge();
    const forkJoinArray = [this.getProfile(refresher)];

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

  // GET DETAILS FOR HOLIDAYS
  // holidays$ REQUIRED FOR $upcomingTrips
  getHolidays(refresher: boolean): Observable<Holiday[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws.get<Holidays>('/transix/holidays/filtered/staff', { auth: false, caching }).pipe(
      map(res => res.holidays),
      // AUTO REFRESH IF HOLIDAY NOT FOUND
      switchMap(holidays => {
        const date = new Date();
        return refresher || holidays.find(h => date < new Date(h.holiday_start_date))
          ? of(holidays)
          : this.getHolidays(true);
      }),
      shareReplay(1),
    );
  }

  // this will fail when the user opens the app for the first time and login because it will run before login
  // => we need to call it here and in login page as well
  runCodeOnReceivingNotification() {
    this.firebaseX.onMessageReceived().subscribe(data => {
      if (data.tap) { // Notification received in background
        this.notificationService.getMessageDetail(data.message_id).subscribe(notificationData => {
          this.openNotificationModal(notificationData);
        });
      } else { // Notification received in foreground
        this.showNotificationAsToast(data);
      }
    });
  }

  async showNotificationAsToast(data: any) {
    // need to check with dingdong team about response type
    const toast = await this.toastCtrl.create({
      header: 'New Message',
      message: data.title,
      position: 'top',
      color: 'primary',
      buttons: [
        {
          icon: 'open',
          handler: () => {
            this.notificationService.getMessageDetail(data.message_id).subscribe(notificationData => {
              this.openNotificationModal(notificationData);
            });
            // this.openNotificationModal(data);
          }
        }, {
          icon: 'close',
          role: 'cancel',
          handler: () => { }
        }
      ]
    });
    toast.present();
  }

  async openNotificationModal(message: any) {
    // need to check with dingdong team about response type
    const modal = await this.modalCtrl.create({
      component: NotificationModalPage,
      componentProps: { message, notFound: 'No Message Selected' },
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  // PROFILE AND GREETING MESSAGE FUNCTIONS
  getProfile(refresher: boolean) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.isStudent ? this.ws.get<StudentProfile>('/student/profile', { caching }).pipe(
      tap(studentProfile => {
        if (studentProfile.BLOCK === true) {
          this.block = false;
          this.cgpaPerIntake$ = this.getCgpaPerIntakeData(true); // no-cache for results
        } else {
          this.block = true;
        }
      }),
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
                this.councelorProfile$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).pipe(
                  map(res =>
                    res.find(staff =>
                      staff.ID.toLowerCase() === response.councelor_details[0].SAMACCOUNTNAME.toLowerCase()
                    )
                  )
                );
              }
            }
          })
        );
      }),
      // tap(studentProfile => this.attendanceDefaultIntake = studentProfile.INTAKE),
      tap(studentProfile => this.userProfile = studentProfile),
      tap(studentProfile => this.lecturerContacts$ = this.getLecturersContact(studentProfile.INTAKE, refresher)),
      tap(studentProfile => this.getTodaysSchedule(studentProfile.INTAKE, refresher)),
      tap(studentProfile => this.getUpcomingEvents(studentProfile.INTAKE, refresher)), // INTAKE NEEDED FOR EXAMS
      // tap(studentProfile => this.getAttendance(studentProfile.INTAKE, true)), // no-cache for attendance
      // tap(studentProfile => this.getUpcomingExam(studentProfile.INTAKE)),
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

  displayGreetingMessage() {
    const hoursNow = new Date().getHours();
    if (hoursNow < 12) {
      this.greetingMessage = 'Good morning';
    } else if (hoursNow >= 12 && hoursNow <= 18) {
      this.greetingMessage = 'Good afternoon';
    } else {
      this.greetingMessage = 'Good evening';
    }
  }

  // NEWS
  async openModal(newsItem: ShortNews) {
    const modal = await this.modalCtrl.create({
      component: NewsModalPage,
      componentProps: { newsItem },
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  async openNewsModal(item: News) {
    const modal = await this.modalCtrl.create({
      component: NewsModalPage,
      componentProps: { item, notFound: 'No news Selected' },
    });
    await modal.present();
    await modal.onDidDismiss();
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

      // CONVERT TIMETABLE OBJECT TO THE OBJECT EXPECTED IN THE EVENT COMPONENET
      map((timetables: StudentTimetable[]) => {
        const timetableEventMode: EventComponentConfigurations[] = [];
        timetables.forEach((timetable: StudentTimetable) => {
          let classPass = false;
          if (this.eventPass(timetable.TIME_FROM_ISO, dateNow)) { // CHANGE CLASS STATUS TO PASS IF IT PASS
            classPass = true;
          }
          timetableEventMode.push({
            title: timetable.MODID,
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


  chatInTeams(lecturerCasId: string) {

    const androidSchemeUrl = 'com.microsoft.teams';

    const iosSchemeUrl = 'microsoft-teams://';

    const webUrl = `https://teams.microsoft.com/l/chat/0/0?users=${lecturerCasId}@staffemail.apu.edu.my`;

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

      `${lecturerCasId}@staffemail.apu.edu.my`);

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
          // XXX: ONLY START DAY IS BEING MATCHED
          switchMap(holidays => holidays.find(holiday => date === holiday.holiday_start_date)
            ? of(timetables)
            : this.ws.get<LecturerTimetable[]>(endpoint, { auth: false, caching: 'network-or-cache' }).pipe(
              map(timetable => timetable.filter(tt => this.eventIsToday(new Date(tt.time), d))),
            )
          ),
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
      this.getUpcomingMoodle(todaysDate, refresher)
    ).pipe(
      map(x => x[0].concat(x[1]).concat(x[2])), // MERGE THE TWO ARRAYS TOGETHER // NOW THREE
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
    return forkJoin([
      this.ws.get<Holidays>('/transix/holidays/filtered/students', { auth: false, caching }),
      this.holidays$
    ]).pipe(
      map(([studentHolidays, staffHolidays]) => {
        const holiday = this.isStudent ? studentHolidays.holidays.find(h => date < new Date(h.holiday_start_date)) || {} as Holiday
          : staffHolidays.find(h => date < new Date(h.holiday_start_date)) || {} as Holiday;

        const examsListEventMode: EventComponentConfigurations[] = [];
        const formattedStartDate = format(parseISO(holiday.holiday_start_date), 'dd MMM yyyy');
        examsListEventMode.push({
          title: holiday.holiday_name,
          firstDescription: this.getNumberOfDaysForHoliday(
            parseISO(holiday.holiday_start_date),
            parseISO(holiday.holiday_end_date)),
          color: '#273160',
          pass: false,
          passColor: '#d7dee3',
          outputFormat: 'event-with-date-only',
          type: 'holiday',
          dateOrTime: formattedStartDate
        });
        return examsListEventMode;
      })
    );
  }

  getNumberOfDaysForHoliday(startDate: Date, endDate: Date): string {
    const secondsDiff = this.getSecondsDifferenceBetweenTwoDates(startDate, endDate);
    const daysDiff = Math.floor(secondsDiff / (3600 * 24));
    return (daysDiff + 1) + ' day' + (daysDiff === 0 ? '' : 's');
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

  // APCARD FUNCTIONS
  getTransactions(refresher) {
    return this.ws.get<Apcard[]>('/apcard/', refresher).pipe(
      tap(transactions => this.analyzeTransactions(transactions)),
      tap(transactions => this.getCurrentApcardBalance(transactions))
    );
  }

  getCurrentApcardBalance(transactions) {
    if (transactions.length > 0) {
      this.balance$ = of({ value: transactions[0].Balance });
    } else {
      this.balance$ = of({ value: -1 });
    }
  }

  analyzeTransactions(transactions: Apcard[]) {
    // stop analyzing if transactions is empty
    if (transactions.length === 0) {
      this.currentBalance = -1;
      return;
    }
    this.currentBalance = transactions[0].Balance;

    const now = new Date();
    const a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.monthlyData = transactions.reduce(
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
    this.apcardChart.data.datasets[0].data = this.monthlyData.cr[now.getFullYear()];
    this.apcardChart.data.datasets[1].data = this.monthlyData.dr[now.getFullYear()];
  }

  // FINANCIALS FUNCTIONS
  getOverdueFee(refresher: boolean): Observable<FeesTotalSummary | any> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.ws.get<FeesTotalSummary[]>(
      '/student/summary_overall_fee',
      { caching }
    ).pipe(
      tap((overdueSummary) => {
        // GET THE VALUE OF THE TOTAL OVERALL USED IN THE QUICK ACCESS ITEM
        this.totalOverdue$ = of({ value: overdueSummary[0].TOTAL_OVERDUE });
      }),
      tap((overdueSummary) => {
        // Basically checking the Student's financial data to identify if there's any outstanding
        // tslint:disable-next-line: max-line-length
        if (overdueSummary[0].FINE !== 0 || overdueSummary[0].TOTAL_PAID !== overdueSummary[0].TOTAL_PAYABLE || overdueSummary[0].TOTAL_OUTSTANDING !== 0 || overdueSummary[0].TOTAL_OVERDUE !== 0) {
          this.hasOutstanding = true;
        } else {
          this.hasOutstanding = false;
        }
      }),
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
      }),
      catchError(err => {
        this.totalOverdue$ = of({ value: -1 });
        return err;
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
        tap(_ => this.overallCgpa = 0),
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
            gpa.forEach(intakeGpa => {
              this.overallCgpa += +intakeGpa;
            });
            this.overallCgpa = this.overallCgpa / gpa.length;
            this.cgpaChart = {
              type: 'horizontalBar',
              options: {
                scales: {
                  xAxes: [{
                    ticks: {
                      min: 0,
                      max: 4
                    }
                  },
                  ],
                  yAxes: [{
                    gridLines: {
                      color: 'rgba(0, 0, 0, 0)',
                    },
                    ticks: {
                      beginAtZero: true,
                      mirror: true,
                      fontColor: 'rgba(' + this.activeAccentColor + ', 1)',
                      fontStyle: 900,
                      padding: -10
                    },
                  }]
                },
                responsive: true,
                legend: {
                  display: false,
                },
                title: {
                  display: false,
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



  // UPCOMING TRIPS

  getLocationColor(locationName: string) {
    for (const location of this.locations) {
      if (location.location_name === locationName) {
        return location.location_color;
      }
    }
  }

  getLocations(refresher: boolean) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    this.ws.get<APULocations>(`/transix/locations`, { auth: false, caching }).pipe(
      map((res: APULocations) => res.locations),
      tap(locations => this.locations = locations)
    ).subscribe();
  }

  getUpcomingTrips(firstLocation: string, secondLocation: string) {
    if (!firstLocation || !secondLocation) {
      this.showSetLocationsSettings = true;
      return of({});
    }
    this.showSetLocationsSettings = false;
    const currentDate = new Date();
    return this.ws.get<BusTrips>('/transix/trips/applicable', { auth: false }).pipe(
      map(res => res.trips),
      map(trips => {
        return trips.filter(trip => {
          return parse(trip.trip_time, 'kk:mm', new Date()) >= currentDate
            && trip.trip_day === this.getTodayDay(currentDate)
            && ((trip.trip_from === firstLocation && trip.trip_to === secondLocation)
              || (trip.trip_from === secondLocation && trip.trip_to === firstLocation));
        });
      }),
      map(trips => {
        return trips.reduce(
          (prev, curr) => {
            prev[curr.trip_from + curr.trip_to] = prev[curr.trip_from + curr.trip_to] || {
              trip_from: curr.trip_from_display_name,
              trip_from_color: this.getLocationColor(curr.trip_from),
              trip_to: curr.trip_to_display_name,
              trip_to_color: this.getLocationColor(curr.trip_to),
              times: []
            };
            // Convert to dateObject for time format
            const localToUtcOffset = (currentDate.getTimezoneOffset());
            const localParsedDate = Date.parse(currentDate.toString());

            const utcDate = new Date(localParsedDate + (localToUtcOffset * 60000));
            const utcParsedDate = Date.parse(utcDate.toUTCString());

            const d = new Date(utcParsedDate + (480 * 60000));
            const dateObject = parse(curr.trip_time, 'HH:mm', d);
            curr.trip_time = this.dateWithTimezonePipe.transform(dateObject, 'bus');

            prev[curr.trip_from + curr.trip_to].times.push(curr.trip_time);
            return prev;
          },
          {}
        );
      }),
      map(trips => {
        return Object.keys(trips).map(
          key => trips[key]
        );
      })
    );
  }

  // QUICK ACCESS FUNCTIONS
  openMoodle() {
    const url = 'https://lms2.apiit.edu.my/login/index.php';
    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.cas.getST(url).subscribe(st => {
          this.iab.create(`${url}?ticket=${st}`, '_system', 'location=true');
        });
      } else {
        this.cas.getST(url).subscribe(st => {
          this.iab.create(`${url}?ticket=${st}`, '_blank', 'location=true');
        });
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: 'danger',
      duration: 6000,
      position: 'top',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ],
    });
    toast.present();
  }

  // GENERAL FUNCTIONS
  getSecondsDifferenceBetweenTwoDates(startDate: Date, endDate: Date): number {
    // PARAMETERS MUST BE STRING. FORMAT IS ('HH:mm A')
    // RETURN TYPE IS STRING. FORMAT: 'HH hrs mm min'
    return (endDate.getTime() - startDate.getTime()) / 1000;
  }

  secondsToHrsAndMins(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return hours + ' hr' + (hours > 1 ? 's' : '') + ' ' + mins + ' min' + (mins > 1 ? 's' : '');
  }

  navigateToPage(pageName: string) {
    this.navCtrl.navigateForward(pageName);
  }

  logout() {
    this.alertCtrl.create({
      header: 'Are you sure you want to log out?',
      cssClass: 'danger-alert',
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'cancel',
          role: 'cancel'
        },
        {
          text: 'Log Out',
          cssClass: 'main',
          handler: () => {
            this.navCtrl.navigateForward('/logout');
          }
        }
      ]
    }).then(alert => alert.present());
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

  // SLIDER
  prevSlide() {
    this.sliderSlides.slidePrev();
  }

  nextSlide() {
    this.sliderSlides.slideNext();
  }

  openMoodleEvent(courseId: number) {
    const courseUrl = `https://lms2.apiit.edu.my/course/view.php`;
    const url = 'https://lms2.apiit.edu.my/login/index.php';
    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.cas.getST(url).subscribe(() => {
          this.iab.create(`${courseUrl}?id=${courseId}&`, '_system', 'location=true');
        });
      } else {
        this.cas.getST(url).subscribe(() => {
          this.iab.create(`${courseUrl}?id=${courseId}`, '_blank', 'location=true');
        });
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }
  }

  // FOR FUTURE CLICKABLE UPCOMING EVENTS
  openUpComingLinks(event: EventComponentConfigurations) {
    switch (event.type) {
      case 'moodle': {
        this.openMoodleEvent(event.moodleCourseId);
        break;
      }
      default: {
        break;
      }
    }
  }
}
