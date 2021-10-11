import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { AlertController, IonSearchbar, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import Fuse from 'fuse.js';

import { CasTicketService } from 'src/app/services';
import { Role } from '../../interfaces';
import { menus, menusTitle } from '../more/menu';
import { MenuItem } from '../more/menu.interface';
import { TabItem } from './tab-item.interface';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss']
})
export class TabsPage implements OnInit {
  selectedTab: string;
  tabs: TabItem[];
  smallScreen;
  shownSearchBar = false;

  @ViewChild(IonSearchbar, { static: false }) searchbar: IonSearchbar;

  term = '';
  searching = false; // user focusing on searchbar

  options: Fuse.IFuseOptions<MenuItem> = {
    keys: ['title', 'tags']
  };
  menuFull: MenuItem[] = menus;
  menuFiltered = [] as MenuItem[];
  menusTitle: { [id: string]: string } = menusTitle;
  isMobile = this.platform.is('cordova');


  // APTour Guide
  tourGuideStep = [
    'Are you feeling lost 🤷‍♀️? Search for any information within APSpace.',
    'Don\'t miss a class 💁🏾‍♂️! Refer to the Timetable Schedule Tab.',
    'Don\'t forget to mark your attendance as well 🤦🏽‍♀️! Refer to the Attendance Tab.',
    '📢 Stay up to date about your academic day from the Dashboard Tab.',
    'Keep track of your balance and transactions from the APCard Tab 💸',
    'Can\'t get enough of APSpace? Explore more information from the More Tab 💁🏻‍♂️',
    'Got a question but no answer 🙇🏿‍♂️? Please open a ticket and ask us!'
  ];
  role: Role;
  isAdmin: boolean;
  isLecturer: boolean;

  constructor(
    private router: Router,
    private storage: Storage,
    private iab: InAppBrowser,
    private platform: Platform,
    private network: Network,
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    private cas: CasTicketService,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.selectedTab = this.router.url.split('/').pop();
    if (this.selectedTab === 'tabs') { // TODO do this on routing level instead
      this.router.navigate(['tabs', 'dashboard'], { replaceUrl: true });
    }

    // assert no duplicate id (probably not able to be done during compile time)
    this.menuFull.forEach((menu, _i, arr) => {
      if (arr.find(m => m.id === menu.id) !== menu) {
        console.warn(`duplicate '${menu.id}' in menuFull`);
      }
    });

    this.onResize();

    this.storage.get('role').then((role: Role) => {
      // tslint:disable:no-bitwise
      if (role & Role.Student) {
        this.tabs = [
          {
            name: 'Timetable',
            path: 'student-timetable',
            icon: 'calendar'
          },
          {
            name: 'Attendance',
            path: 'attendance',
            icon: 'alarm'
          },
          {
            name: 'Dashboard',
            path: 'dashboard',
            icon: 'pulse'
          },
          {
            name: 'APCard',
            path: 'apcard',
            icon: 'card'
          },
          {
            name: 'More',
            path: 'more',
            icon: 'ellipsis-vertical'
          }
        ];
      } else if (role & Role.Lecturer) {
        this.tabs = [
          {
            name: 'Timetable',
            path: 'lecturer-timetable',
            icon: 'calendar'
          },
          {
            name: 'Profile',
            path: 'profile',
            icon: 'person'
          },
          {
            name: 'Dashboard',
            path: 'dashboard',
            icon: 'pulse'
          },
          {
            name: 'APCard',
            path: 'apcard',
            icon: 'card'
          },
          {
            name: 'More',
            path: 'more',
            icon: 'ellipsis-vertical'
          }
        ];
      } else if (role & Role.Admin) {
        this.tabs = [
          {
            name: 'Profile',
            path: 'profile',
            icon: 'person'
          },
          {
            name: 'Dashboard',
            path: 'dashboard',
            icon: 'pulse'
          },
          {
            name: 'APCard',
            path: 'apcard',
            icon: 'card'
          },
          {
            name: 'More',
            path: 'more',
            icon: 'ellipsis-vertical'
          }
        ];
      } else {
        console.error('Invalid role');
      }

      this.storage.get('canAccessResults').then((canAccessResults = false) => {
        // tslint:disable-next-line:no-bitwise
        if (role & Role.Student) {
          this.menuFiltered = this.menuFull.filter(
            menu => {
              // tslint:disable-next-line:no-bitwise
              return menu.role & role;
            }
          );
        } else {
          this.menuFiltered = this.menuFull.filter(
            menu => {
              // tslint:disable-next-line:no-bitwise
              return ((menu.role & role) && ((menu.canAccess && menu.canAccess === canAccessResults) || !menu.canAccess));
            }
          );
        }

      });
    });

    // Overwrite the tour guide message for staff
    this.storage.get('role').then((role: Role) => {
      this.role = role;
      // tslint:disable-next-line: no-bitwise
      this.isAdmin = Boolean(role & Role.Admin);
      // tslint:disable-next-line: no-bitwise
      this.isLecturer = Boolean(role & Role.Lecturer);

      // APTour Guide texts for lecturer or lecturer + admin
      if (this.isLecturer || this.isLecturer && this.isAdmin) {
        this.tourGuideStep[1] = 'Don\'t forget to take your class and attendance 💁🏾‍♂️! Refer to the Timetable Schedule Tab.';
        this.tourGuideStep[2] = 'You can refer to your Profile from the Profile Tab as well 👤';
      }
      // APTour Guide texts for admin
      else if (this.isAdmin) {
        this.tourGuideStep.splice(1, 2, 'You can refer to your Profile from the Profile Tab as well 👤');
        this.tourGuideStep[6] = 'Got a question but no answer 🙇🏿‍♂️? Please open a ticket and ask us!';
      }
    });
    // tslint:enable:no-bitwise
  }

  @HostListener('document:keydown.f1')
  @HostListener('document:keydown.?')
  @HostListener('document:keydown.shift.?')
  onKeydownHelp() {
    this.openHelpCentre();
  }

  @HostListener('document:keydown.s')
  onKeydownS() {
    // prevent key 's' propagated into search
    setTimeout(() => this.searchbar.setFocus(), 10);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.smallScreen = window.innerWidth <= 720;
  }

  toggleSearchBar() {
    this.shownSearchBar = !this.shownSearchBar;
    if (this.shownSearchBar) {
      setTimeout(() => this.searchbar.setFocus(), 400);
    }
  }

  openInAppBrowser(url: string) {
    if (this.isMobile) {
      this.iab.create(url, '_system', 'location=true');
    } else {
      this.iab.create(url, '_blank', 'location=true');
    }
  }

  /** Open page, manually check for third party pages. */
  openPage(url: string, attachTicket = false) {
    // external pages does not use relative or absolute link
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Manually exclude sites that do not need service ticket
      if (!attachTicket) {
        this.openInAppBrowser(url);
      } else {
        if (this.network.type !== 'none') {
          this.cas.getST(url).subscribe(st => {
            this.openInAppBrowser(`${url}?ticket=${st}`);
          });
        } else {
          this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
        }

      }
    } else {
      url !== 'logout' ? this.navCtrl.navigateForward([url]) : this.logout();
    }
  }

  openHelpCentre() {
    this.openPage('https://apiit.atlassian.net/servicedesk/customer/portals');
  }

  /** Stop searching after some time, for link clicking time. */
  stopSearching() {
    setTimeout(() => this.searching = false, 500);
  }

  noop(): number {
    return 0;
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
    await toast.present();
  }

  async finishTour() {
    const alert = await this.alertCtrl.create({
      header: 'That\'s it!',
      message: 'Enjoy your experience with APSpace!',
      buttons: ['Dismiss']
    });
    await alert.present();
  }
}
