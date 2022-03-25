import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, IonTabs } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';

import { TabItems } from '../../constants';
import { Role } from '../../interfaces';
import { ConfigurationsService } from '../../services';
import { TabItem } from './tab-item';

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
  // Other Variables
  shownSearchBar: boolean;
  smallScreen: boolean;
  logo: string;
  // Search Variables
  @ViewChild(IonSearchbar, { static: false }) searchbar: IonSearchbar;
  term = '';
  searching = false; // user focusing on searchbar

  constructor(
    private storage: Storage,
    private config: ConfigurationsService
  ) { }

  ngOnInit() {
    this.logo = this.config.logoType;

    this.storage.get('role').then((role: Role) => {
      if (!role) {
        console.error('Invalid role');
        return;
      }
      // Filter array based on User Role
      this.tabItems = TabItems.filter(t => t.role & role);

      this.onResize();
    });
  }

  onChange() {
    this.activeTab = this.tabs.getSelected();
  }

  toggleSearchBar() {
    this.shownSearchBar = !this.shownSearchBar;
    if (this.shownSearchBar) {
      setTimeout(() => this.searchbar.setFocus(), 400);
    }
  }

  openHelpCentre() {
    console.log('https://apiit.atlassian.net/servicedesk/customer/portals');
  }

  /** Stop searching after some time, for link clicking time. */
  stopSearching() {
    setTimeout(() => this.searching = false, 500);
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

  // Listens to window resize
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.smallScreen = window.innerWidth <= 720;
  }
}
