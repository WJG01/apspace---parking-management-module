import { Component, OnInit } from '@angular/core';
import { MenuItem } from "./menu.interface";
import { Storage } from '@ionic/storage';
import { Browser } from '@capacitor/browser';
import { menu } from "./menu";
import { Observable } from "rxjs";
import { Role } from "../../interfaces";
import Fuse from "fuse.js";
import { CasTicketService, SettingsService } from "../../services";
import { AlertButton, AlertController, NavController, Platform } from "@ionic/angular";
import { ComponentService } from "../../services";
import {map} from "rxjs/operators";

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
  fav$: Observable<MenuItem[]>; // favourite items

  options: Fuse.IFuseOptions<MenuItem> = {
    keys: ['title', 'tags']
  };

  isMobile = this.platform.is('capacitor');
  term: '';
  editMode = false;

  constructor(
    private cas: CasTicketService,
    public alertCtrl: AlertController,
    private storage: Storage,
    public navCtrl: NavController,
    private platform: Platform,
    private settings: SettingsService,
    public component: ComponentService
  ) { }

  ngOnInit() {
    // assert no duplicate id (probably not able to be done during compile time)
    this.filteredMenu.forEach((menu, _i, arr) => {
      if (arr.find(item => item.id === menu.id) !== menu) {
        console.warn(`duplicate '${menu.id}' in menuFull`);
      }
    });
    this.view$ = this.settings.get$('menuUI');
    this.view$.subscribe(res => console.log(res));
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

      this.fav$ = this.settings.get$('favoriteItems').pipe(
        map(favs => favs.map(fav => this.menuItems.find(menu => menu.id === fav && menu.role & role))
          .filter(menu => menu !== undefined)),
      );
    });
  }

  logout() {
    const btn: AlertButton = {
      text: 'Logout',
      cssClass: 'danger',
      handler: () => {
        this.navCtrl.navigateForward('/logout');
      }
    }
    this.component.alertMessage('Warning', 'Are you sure you want to log out?', 'Cancel', btn);
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
      await this.openInAppBrowser(url);
    }
  }
}
