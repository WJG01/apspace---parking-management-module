import { Component, OnInit } from '@angular/core';
import { MenuID, MenuItem } from './menu.interface';
import { Storage } from '@ionic/storage-angular';
import { menu } from './menu';
import { Network } from '@capacitor/network';
import { Observable } from 'rxjs';
import { Role } from '../../interfaces';
import { CasTicketService, SettingsService } from '../../services';
import { AlertButton, AlertController, NavController, Platform} from '@ionic/angular';
import { ComponentService } from '../../services';
import { map } from 'rxjs/operators';

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

  view$: Observable<'list' | 'cards'>;
  fav$: Observable<MenuItem[]>; // favourite items
  term: '';
  editMode = false;

  menuItems: MenuItem[] = menu;
  filteredMenu = [] as MenuItem[];

  isMobile = this.platform.is('capacitor');

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
    this.menuItems.forEach((menu, _i, arr) => {
      if (arr.find(item => item.id === menu.id) !== menu) {
        console.warn(`duplicate '${menu.id}' in menuFull`);
      }
    });
    this.view$ = this.settings.get$('menuUI');

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
        // tslint:disable-next-line:no-bitwise
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

  async openInAppBrowser(url: string) {
    await this.component.openLink(url);
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
            await this.component.toastMessage('External links cannot be opened in offline mode. Please ensure you have a network connection and try again', 'danger');
          }
        }
      } else {
        url !== 'logout' ? this.navCtrl.navigateForward([url]) : this.logout();
      }
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
}
