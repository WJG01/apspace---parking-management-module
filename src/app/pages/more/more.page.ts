import { Component, OnInit } from '@angular/core';
import { MenuItem } from "./menu.interface";
import { Storage } from '@ionic/storage';
import { Network } from '@capacitor/network';
import { Browser } from '@capacitor/browser';
import { menu } from "./menu";
import { Observable } from "rxjs";
import { Role } from "../../interfaces";
import Fuse from "fuse.js";
import { CasTicketService } from "../../services";
import { AlertController, NavController, Platform, ToastController } from "@ionic/angular";

interface KeyIconMap { [key: string]: string; }

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {
  keyList = [];
  keyIcon: KeyIconMap = {
    ['Finance']: 'assets/img/more-icons/finance.png',
    ['Collaboration & Information Resources']: 'assets/img/more-icons/collab-info.png',
    ['Campus Life']: 'assets/img/more-icons/campus-life.png',
    ['Corporate']: 'assets/img/more-icons/corporate.png',
    ['Academic Operation']: 'assets/img/more-icons/academic-op.png',
    ['Academic & Enrollment']: 'assets/img/more-icons/academic-enroll.png',
    ['Career Centre & Corporate Training']: 'assets/img/more-icons/career-training.png',
    ['Others']: 'assets/img/more-icons/others.png'
  };
  menuItems: MenuItem[] = menu;
  filteredMenu = [] as MenuItem[];

  view$: Observable<'list' | 'cards'>;

  options: Fuse.IFuseOptions<MenuItem> = {
    keys: ['title', 'tags']
  };

  isMobile = this.platform.is('cordova');
  isExpand = false;
  term: '';
  editMode = false;

  constructor(
    private cas: CasTicketService,
    public alertCtrl: AlertController,
    private storage: Storage,
    public navCtrl: NavController,
    private platform: Platform,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // assert no duplicate id (probably not able to be done during compile time)
    this.filteredMenu.forEach((menu, _i, arr) => {
      if (arr.find(item => item.id === menu.id) !== menu) {
        console.warn(`duplicate '${menu.id}' in menuFull`);
      }
    });
    // this.view$ = this.settings.get$('menuUI');

    Promise.all([
      this.storage.get('role'),
      this.storage.get('canAccessResults')
    ]).then(([role, canAccessResults = false]: [Role, boolean]) => {
      if (role & Role.Student) {
        this.filteredMenu = this.menuItems.filter(
          menu => {
            return (menu.role & role) && menu.parents.length === 0;
          }
        );
      } else {
        this.filteredMenu = this.menuItems.filter(
          menu => {
            return menu.parents.length === 0
              && ((menu.role & role) && ((menu.canAccess && menu.canAccess === canAccessResults) || !menu.canAccess));
          }
        );
      }
    })

  }

  showMore(groupKey) {
    if (this.keyList.includes(groupKey)) {
      const index = this.keyList.indexOf(groupKey, 0);
      if (index > -1) {
        this.keyList.splice(index, 1);
      }

      if (this.keyList.length === 0) {
        this.isExpand = false;
      }
      return;
    }

    this.keyList.push(groupKey);

    const keyIconLength = Object.keys(this.keyIcon).length;
    if (keyIconLength === this.keyList.length) {
      this.isExpand = true;
    }
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

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  /** No sorting for KeyValuePipe. */
  noop(): number {
    return 0;
  }
  //
  async openInAppBrowser(url: string) {
    if (this.isMobile) {
      await Browser.open({url: url});
    } else {
      await Browser.open({url: url});
    }
  }

  /** Open page, manually check for third party pages. */
  async openPage(url: string, attachTicket = false) {
    if (!this.editMode) {
      // external pages does not use relative or absolute link
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Manually exclude sites that do not need services ticket
        if (!attachTicket) {
          await this.openInAppBrowser(url);
        } else {
          const networkStatus = await Network.getStatus();
          if (networkStatus.connected) {
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
}
