import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonTabs, ModalController, Platform } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';

import { TabItems } from '../../constants';
import { Role } from '../../interfaces';
import { ComponentService, ConfigurationsService, SettingsService } from '../../services';
import { SearchMenusModalPage } from './search-menus-modal/search-menus-modal.page';
import { TabItem } from './tab-item';
import { Observable, Subscription, tap } from 'rxjs';
import { SwitchUserRoleService } from 'src/app/services/switch-user-role.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  // Tabs Variables
  tabItems: TabItem[];
  activeTab: string;
  @ViewChild(IonTabs) tabs: IonTabs;
  smallScreen: boolean;
  logo: string;
  theme$: Observable<string>;
  currentLoginUserRole: any;
  currentUserRoleSubscription: Subscription;

  constructor(
    private storage: Storage,
    private config: ConfigurationsService,
    private modalCtrl: ModalController,
    private plt: Platform,
    private component: ComponentService,
    private settings: SettingsService,
    private router: Router,
    private switchUserRole: SwitchUserRoleService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.checkLogoType();

    // Get the role from localStorage
    this.currentLoginUserRole = localStorage.getItem('currentLoginUserRole');


    this.currentUserRoleSubscription = this.switchUserRole
      .getCurrentUserRole$()
      .subscribe((role) => {

        console.log('Load within scope but no checking', this.currentLoginUserRole);
        if (role) {
          console.log('Load within scope', this.currentLoginUserRole);
          localStorage.setItem('currentLoginUserRole', role);
          this.currentLoginUserRole = role;
          this.filterOwnRole(role);
        }
      });

    console.log('Load outside scope', this.currentLoginUserRole);
    this.filterOwnRole(this.currentLoginUserRole);

    if (!this.currentLoginUserRole) {
      this.currentLoginUserRole = localStorage.getItem('currentLoginUserRole');
      this.filterOwnRole(this.currentLoginUserRole);
      console.log('Load in storage scope', this.currentLoginUserRole);
    }
  }

  ngOnDestroy() {
    // Don't forget to unsubscribe to avoid memory leaks
    this.currentUserRoleSubscription.unsubscribe();
  }

  onChange() {
    this.activeTab = this.tabs.getSelected();
  }

  filterOwnRole(role: any) {
    this.tabItems = [];
    console.log('Hi I ran in filterOwnRole', role);
    if (role === 'SECURITY_GUARD') {
      this.tabItems = TabItems.filter(t => t.name !== 'Parking' && t.name !== 'Checkin' && t.name !== 'Emergency');
      console.log('what inside security tab', this.tabItems);
    } else {
      this.tabItems = TabItems.filter(t => t.name !== 'Assistance');
      console.log('what inside driver tab', this.tabItems);

    }
    console.log('what inside everyone  tab', this.tabItems);
    // Manually trigger change detection
    this.changeDetectorRef.detectChanges();
  }

  // async getUserData() {
  //   const userData = await this.storage.get('userData');
  //   if (userData) {
  //     this.currentLoginUserRole = userData.parkingRole;
  //     this.filterOwnRole();
  //   }
  // }



  navigateToTop(tabPath: string) {
    this.config.goToTop(tabPath);
  }

  // Key Combination (Ctrl + S)
  @HostListener('document:keydown.control.s')
  async openSearch() {
    if (!this.router.url.includes('tabs')) {
      // Ignore Key Combination to prevent issues with other pages
      return;
    }

    if (this.plt.is('capacitor')) {
      await Keyboard.hide();
    }

    const modal = await this.modalCtrl.create({
      component: SearchMenusModalPage
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.path) {
      this.openPage(data?.path);
    }
  }

  openPage(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return this.component.openLink(path);
    }
    this.router.navigateByUrl(path);
  }

  // Key Combination (Shift + ?)
  @HostListener('document:keydown.shift.?')
  openHelpCentre() {
    if (!this.router.url.includes('tabs')) {
      // Ignore Key Combination to prevent issues with other pages
      return;
    }

    this.component.openLink('https://apiit.atlassian.net/servicedesk/customer/portals');
  }

  // Listens to window resize
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.smallScreen = window.innerWidth <= 720;
  }

  checkLogoType() {
    this.theme$ = this.settings.get$('theme').pipe(
      tap(theme => {
        const autoDark = theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (autoDark || theme.includes('dark')) {
          // Change to white text logo
          this.logo = 'assets/icon/apspace-white.svg';
        } else {
          //Change to black text logo
          this.logo = 'assets/icon/apspace-black.svg';
        }
      }),
    );
  }
}
