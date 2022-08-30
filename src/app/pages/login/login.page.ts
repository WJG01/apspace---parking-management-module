import { Component, OnInit } from '@angular/core';
import SwiperCore, { Autoplay, Lazy, Navigation } from 'swiper';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { catchError, throwError, switchMap, timeout, tap, Observable, map } from 'rxjs';

import { CasTicketService, ComponentService, ConfigurationsService, SettingsService, WsApiService } from '../../services';
import { Browser } from '@capacitor/browser';
import { ShortNews } from '../../interfaces/news';
import { QuixCustomer, Role } from '../../interfaces';
import { NewsModalPage } from '../news/news-modal';
import { DataCollectorService } from '../../services/data-collector.service';
import { NewsService } from '../../services/news.service';

// install Swiper modules
SwiperCore.use([Autoplay, Lazy, Navigation]);

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  quixCompanies$: Observable<any[]>;
  news$: Observable<ShortNews[]>;

  selectedQuixSegment: 'APU' | 'APIIT' = 'APU';
  apkey: string;
  password: string;
  showPassword: boolean;
  showLoginSection: boolean;
  // LOGIN BUTTON ANIMATIONS ITEMS
  userDidLogin = false;
  loginProcessLoading = false;
  userAuthenticated = false;
  userUnauthenticated = false;
  currentYear = new Date().getFullYear();
  isCapacitor: boolean;

  constructor(
    public alertCtrl: AlertController,
    private fb: FormBuilder,
    private dc: DataCollectorService,
    private cas: CasTicketService,
    private ws: WsApiService,
    private component: ComponentService,
    private route: ActivatedRoute,
    private platform: Platform,
    private router: Router,
    private configuration: ConfigurationsService,
    private loadingCtrl: LoadingController,
    private settings: SettingsService,
    private modalCtrl: ModalController,
    private news: NewsService
  ) { }

  ngOnInit() {
    this.isCapacitor = this.platform.is('capacitor');
    this.news$ = this.news.get(true, true, false).pipe(
      map(newsList => {
        return newsList.map(item => {
          if (item && item.featured_image_src.length > 0) {
            return {
              url: item.featured_image_src,
              title: item.title && item.title.rendered ? item.title.rendered : '',
              updated: item.modified ? new Date(item.modified) : '',
              body: item.content && item.content.rendered ? item.content.rendered : ''
            };
          }
        }).slice(0, 6);
      }),
    );
    const headers = { 'X-Filename': 'quix-customers' };
    return this.quixCompanies$ = this.ws.get<QuixCustomer[]>('/quix/get/file', {
        auth: false,
        caching: 'cache-only',
        headers
      }
    ).pipe(map(companies => {
      return [
        {
          company_departments: [
            {
              dept_email: companies[0].company_departments[0].dept_email,
              dept_icon: 'chatbubbles',
              dept_icon_color: '#1f640a',
              dept_id: companies[0].company_departments[0].dept_id,
              dept_name: companies[0].company_departments[0].dept_name,
              dept_phone: companies[0].company_departments[0].dept_phone,
              shifts: companies[0].company_departments[0].shifts
            },
            {
              dept_email: companies[0].company_departments[1].dept_email,
              dept_icon: 'airplane',
              dept_icon_color: '#260033',
              dept_id: companies[0].company_departments[1].dept_id,
              dept_name: companies[0].company_departments[1].dept_name,
              dept_phone: companies[0].company_departments[1].dept_phone,
              shifts: companies[0].company_departments[1].shifts
            },
            {
              dept_email: companies[0].company_departments[2].dept_email,
              dept_icon: 'cash',
              dept_icon_color: '#bc8420',
              dept_id: companies[0].company_departments[2].dept_id,
              dept_name: companies[0].company_departments[2].dept_name,
              dept_phone: companies[0].company_departments[2].dept_phone,
              shifts: companies[0].company_departments[2].shifts
            },
            {
              dept_email: companies[0].company_departments[3].dept_email,
              dept_icon: 'bandage',
              dept_icon_color: '#235789',
              dept_id: companies[0].company_departments[3].dept_id,
              dept_name: companies[0].company_departments[3].dept_name,
              dept_phone: companies[0].company_departments[3].dept_phone,
              shifts: companies[0].company_departments[3].shifts
            },
            {
              dept_email: companies[0].company_departments[4].dept_email,
              dept_icon: 'help-circle',
              dept_icon_color: '#E8222D',
              dept_id: companies[0].company_departments[4].dept_id,
              dept_name: companies[0].company_departments[4].dept_name,
              dept_phone: companies[0].company_departments[4].dept_phone,
              shifts: companies[0].company_departments[4].shifts
            },
            {
              dept_email: companies[0].company_departments[5].dept_email,
              dept_icon: 'business',
              dept_icon_color: '#F0CEA0',
              dept_id: companies[0].company_departments[5].dept_id,
              dept_name: companies[0].company_departments[5].dept_name,
              dept_phone: companies[0].company_departments[5].dept_phone,
              shifts: companies[0].company_departments[5].shifts
            },
            {
              dept_email: companies[0].company_departments[6].dept_email,
              dept_icon: 'library',
              dept_icon_color: '#5bc0be',
              dept_id: companies[0].company_departments[6].dept_id,
              dept_name: companies[0].company_departments[6].dept_name,
              dept_phone: companies[0].company_departments[6].dept_phone,
              shifts: companies[0].company_departments[6].shifts
            },
            {
              dept_email: companies[0].company_departments[7].dept_email,
              dept_icon: 'laptop',
              dept_icon_color: '#0b132b',
              dept_id: companies[0].company_departments[7].dept_id,
              dept_name: companies[0].company_departments[7].dept_name,
              dept_phone: companies[0].company_departments[7].dept_phone,
              shifts: companies[0].company_departments[7].shifts
            },
            /*{
              dept_email: companies[0].company_departments[8].dept_email,
              dept_icon: 'print-outline',
              dept_icon_color: '#c1cd32',
              img: 'assets/img/print.jpg',
              dept_id: companies[0].company_departments[8].dept_id,
              dept_name: companies[0].company_departments[8].dept_name,
              dept_phone: companies[0].company_departments[8].dept_phone,
              shifts: companies[0].company_departments[8].shifts
            }*/
          ],
          company_id: companies[0].company_id,
          company_name: companies[0].company_name,
          customer_type: companies[0].customer_type,
          lastModified: companies[0].lastModified
        },
        {
          company_departments: [
            {
              dept_email: companies[1].company_departments[0].dept_email,
              dept_icon: 'library',
              dept_icon_color: '#5bc0be',
              dept_id: companies[1].company_departments[0].dept_id,
              dept_name: companies[1].company_departments[0].dept_name,
              dept_phone: companies[1].company_departments[0].dept_phone,
              shifts: companies[1].company_departments[0].shifts
            },
            {
              dept_email: companies[1].company_departments[1].dept_email,
              dept_icon: 'cash',
              dept_icon_color: '#bc8420',
              dept_id: companies[1].company_departments[1].dept_id,
              dept_name: companies[1].company_departments[1].dept_name,
              dept_phone: companies[1].company_departments[1].dept_phone,
              shifts: companies[1].company_departments[1].shifts
            },
            {
              dept_email: companies[1].company_departments[2].dept_email,
              dept_icon: 'laptop',
              dept_icon_color: '#0b132b',
              dept_id: companies[1].company_departments[2].dept_id,
              dept_name: companies[1].company_departments[2].dept_name,
              dept_phone: companies[1].company_departments[2].dept_phone,
              shifts: companies[1].company_departments[2].shifts
            }
          ],
          company_id: companies[1].company_id,
          company_name: companies[1].company_name,
          customer_type: companies[1].customer_type
        }
      ];
    }));
  }

  login() {
    this.userDidLogin = true;
    this.loginProcessLoading = true;
    if (!this.apkey || !this.password) {
      this.loginProcessLoading = false;
      this.userDidLogin = false;
      this.component.toastMessage('Please fill up username and password', 'danger');
    } else {
      if (this.platform.is('capacitor') && !this.configuration.connectionStatus) {
        return this.component.toastMessage('You are now offline.', 'danger');
      }
      this.cas.getTGT(this.apkey, this.password).pipe(
        catchError(err => {
          // the error format may changed anytime, should be checked as string
          const errMsg = JSON.stringify(err);

          if (errMsg.includes('AccountPasswordMustChangeException')) {
            this.showConfirmationMessage();
            this.component.toastMessage('Your password has expired!', 'danger');
            return throwError(new Error('Your password has expired!'));
          } else {
            this.component.toastMessage('Invalid username or password', 'danger');
            return throwError(new Error('Invalid Username or Password'));
          }
        }),
        switchMap(tgt => this.cas.getST(this.cas.casUrl, tgt).pipe(
          catchError(() => (this.component.toastMessage('Fail to get service ticket.', 'danger'), throwError(new Error('Fail to get service ticket'))))
        )),
        switchMap(st => this.cas.validate(st).pipe(
          catchError(() => (this.component.toastMessage('You are not authorized to use APSpace', 'danger'), throwError(new Error('unauthorized'))))
        )),
        tap(() => this.settings.initialSync()),
        tap(role => this.cacheApi(role)),
        timeout(15000),
      ).subscribe(
        _ => {
          // TODO default dashboard settings
        },
        _ => {
          this.loginProcessLoading = false;
          this.userUnauthenticated = true;
          setTimeout(() => {
            // Hide the error message after 2 seconds
            this.userUnauthenticated = false;
            this.userDidLogin = false;
          }, 2000);
        },
        async () => {
          if (this.platform.is('capacitor')) {
            try {
              await this.dc.login()
            } catch (error) {
              return error.message;
            }
          }
          this.loginProcessLoading = false;
          this.userAuthenticated = true;

          setTimeout(() => {
            // Show the success message for 300 ms after completing the request
            const url = this.route.snapshot.queryParams.redirect || '/';
            this.router.navigateByUrl(url, {replaceUrl: true});
          }, 300);
        }
      );
    }
  }

  showConfirmationMessage() {
    this.alertCtrl.create({
      header: 'Your password has expired..',
      cssClass: 'danger-alert',
      message: 'You are required to change your password to be able to login to the APSpace' +
        'and other applications. The following documentation provides the steps to do that.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => { }
        },
        {
          text: 'Open The documentation',
          handler: () => {
            this.openLink('troubleshooting');
          }
        }
      ]
    }).then(confirm => confirm.present());
  }

  cacheApi(role: Role) {
    // tslint:disable-next-line:no-bitwise
    const caches = role & Role.Student
      ? ['/student/profile', '/student/courses', '/staff/listing']
      : ['/staff/profile', '/staff/listing'];
    caches.forEach(endpoint => this.ws.get(endpoint).subscribe());
  }

  async openLink(
    linkName: 'timetable' | 'holiday' | 'moodle' | 'apkey' | 'apkeyPassword' | 'troubleshooting' | 'apu' | 'aplc' | 'apiit' | 'corporateTraining' | 'facebook' | 'twitter' | 'linkedin' | 'playStore' | 'appStore' | 'privacyPolicy' | 'termsOfUse') {
    let url = '';
    switch (linkName) {
      case 'timetable':
        url = '/student-timetable';
        break;
      case 'holiday':
        url = 'https://dif7uuh3zqcps.cloudfront.net/wp-content/uploads/sites/67/2022/01/07143327/2022-APU-student-holidays.pdf';
        break;
      case 'moodle':
        url = 'https://lms2.apiit.edu.my/login/index.php?authCAS=CAS';
        break;
      case 'apkey':
        url = 'https://apiit.atlassian.net/servicedesk/customer/portal/4/article/219086900';
        break;
      case 'apkeyPassword':
        url = 'https://apiit.atlassian.net/servicedesk/customer/kb/view/218759221';
        break;
      case 'troubleshooting':
        url = 'https://apiit.atlassian.net/servicedesk/customer/kb/view/218726429';
        break;
      case 'apu':
        url = 'https://www.apu.edu.my/';
        break;
      case 'apiit':
        url = 'https://www.apu.edu.my/';
        break;
      case 'corporateTraining':
        url = 'https://www.apu.edu.my/our-courses/corporate-training';
        break;
      case 'aplc':
        url = 'https://www.apu.edu.my/our-courses/english-language-study';
        break;
      case 'facebook':
        url = 'https://www.facebook.com/apuniversity/';
        break;
      case 'twitter':
        url = 'https://twitter.com/AsiaPacificU';
        break;
      case 'linkedin':
        url = 'https://www.linkedin.com/edu/school?id=15321&trk=edu-cp-title';
        break;
      case 'playStore':
        url = 'https://play.google.com/store/apps/details?id=my.edu.apiit.apspace';
        break;
      case 'appStore':
        url = 'https://itunes.apple.com/us/app/apspace/id1413678891';
        break;
      case 'privacyPolicy':
        url = 'https://www.apu.edu.my/privacy-policy-0';
        break;
      case 'termsOfUse':
        url = 'https://www.apu.edu.my/terms-use';
        break;
      default:
        break;
    }
    await Browser.open({ url: url });
  }

  // NEWS MODAL
  async openNewsModal(newsItem: ShortNews) {
    const modal = await this.modalCtrl.create({
      component: NewsModalPage,
      componentProps: { newsItem },
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
