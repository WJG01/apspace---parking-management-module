import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertButton, AlertController, IonContent, ModalController, NavController, ViewWillEnter, IonicModule } from '@ionic/angular';
import { map, Observable } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { menu, menusWithoutParent } from './menu';
import { Role } from '../../interfaces';
import { CasTicketService, ConfigurationsService, SettingsService } from '../../services';
import { MenuID, MenuItem } from './menu.interface';
import { ComponentService } from '../../services';
import { Router } from '@angular/router';
import importedUserData from '../parking-book/APQParkingUserDummy.json';
import { SwitchAccountModalPage } from './switch-account-modal/switch-account-modal.page';

const ICONS_PATH = 'assets/img/more-icons'; // Main Icons Path

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})

export class MorePage implements OnInit, ViewWillEnter {

  @ViewChild(IonContent) content: IonContent;

  //switch user modal changes
  @ViewChild('switchAccountModal') switchAccountModal: any;

  userData: any[] = [];
  currentLoginUserRole: any;
  currentLoginUserDisplay = '';


  keyIcon: { [key: string]: string; } = {
    ['Finance']: `${ICONS_PATH}/finance.png`,
    ['Collaboration & Information Resources']: `${ICONS_PATH}/collab-info.png`,
    ['Campus Life']: `${ICONS_PATH}/campus-life.png`,
    ['Corporate']: `${ICONS_PATH}/corporate.png`,
    ['Academic Operation']: `${ICONS_PATH}/academic-op.png`,
    ['Academic & Enrollment']: `${ICONS_PATH}/academic-enroll.png`,
    ['Career Centre & Corporate Training']: `${ICONS_PATH}/career-training.png`,
    ['Others']: `${ICONS_PATH}/others.png`
  };

  view$: Observable<'list' | 'cards'>;
  fav$: Observable<MenuItem[]>; // favourite items
  editMode = false;
  filteredMenu: MenuItem[] = [];

  constructor(
    private cas: CasTicketService,
    public alertCtrl: AlertController,
    private storage: Storage,
    public navCtrl: NavController,
    private settings: SettingsService,
    public component: ComponentService,
    private config: ConfigurationsService,
    private router: Router,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    // assert no duplicate id (probably not able to be done during compile time)
    menu.forEach((menu, _i, arr) => {
      if (arr.find(item => item.id === menu.id) !== menu) {
        console.warn(`duplicate '${menu.id}' in menuFull`);
      }
    });

    // Get more page view ui
    this.view$ = this.settings.get$('menuUI');

    // Resolves both promises at once
    Promise.all([
      this.storage.get('role'),
      this.storage.get('canAccessResults')
    ]).then(([role, canAccessResults = false]: [Role, boolean]) => {
      // For students
      if (role & Role.Student) {
        this.filteredMenu = menusWithoutParent.filter(menu => menu.role & role);
      } else {
        // For other roles
        this.filteredMenu = menusWithoutParent.filter(menu =>
          ((menu.role & role) && ((menu.canAccess && menu.canAccess === canAccessResults) || !menu.canAccess))
        );
      }

      this.fav$ = this.settings.get$('favoriteItems').pipe(
        // tslint:disable-next-line:no-bitwise
        map(favs => favs.map(fav => menu.find(menu => menu.id === fav && menu.role & role))
          .filter(menu => menu !== undefined)),
      );
    });

    // importedUserData.forEach(user => {
    //   this.userData.push(user);
    // });
    if (importedUserData) {
      this.userData = importedUserData;
    }
    console.log(this.userData);
    this.getUserData();
  }

  ionViewWillEnter() {
    this.config.goToTopEvent.subscribe({
      next: (tabPath) => {
        if (tabPath === 'more') {
          this.content.scrollToTop(500);
        }
      }
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
    this.component.alertMessage('Warning', 'Are you sure you want to log out?', 'danger', 'Cancel', btn);
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  /** No sorting for KeyValuePipe. */
  noop(): number {
    return 0;
  }

  async openPage(url: string, attachTicket = false, menuId: MenuID) {
    // If Edit Mode is enabled then add the item to Favourites
    if (this.editMode) {
      this.addToFav(menuId);
      return;
    };

    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Manually exclude sites that do not need services ticket
      if (!attachTicket) {
        this.component.openLink(url);
      } else {
        this.cas.getST(url).subscribe(st => {
          this.component.openLink(`${url}?ticket=${st}`);
        });
      }
    } else {
      url !== 'logout' ? this.navCtrl.navigateForward([url]) : this.logout();
    }
  }

  addToFav(id: MenuID) {
    const fav = this.settings.get('favoriteItems');
    const i = fav.indexOf(id);
    if (i !== -1) {
      this.settings.set('favoriteItems', [...fav.slice(0, i), ...fav.slice(i + 1)]);
    } else {
      this.settings.set('favoriteItems', [...fav, id]);
    }
  }

  goToParkingHistory() {
    this.router.navigateByUrl('/parking-history');
  }

  goToParkingIncident() {
    this.router.navigateByUrl('/parking-incident');
  }

  goToParkingMap() {
    this.router.navigateByUrl('/parking-map');
  }

  //switch user modal changes

  async openSwitchAccountModal() {
    const modal = await this.modalController.create({
      component: SwitchAccountModalPage,
      componentProps: {
        userData: this.userData
      },
      animated: true,
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result) {
        this.getUserData();
      }
    });
    await modal.present();
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserRole = userData.parkingRole;
      this.currentLoginUserDisplay = '\n' + '\'' + userData.parkinguserid + '\' AS \'' + userData.parkingRole + '\' ROLE';
    }
  }
}
