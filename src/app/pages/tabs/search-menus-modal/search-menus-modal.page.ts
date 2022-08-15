import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';
import Fuse from 'fuse.js';

import { Role } from '../../../interfaces';
import { menu, menusTitle } from '../../more/menu';
import { MenuItem } from '../../more/menu.interface';

@Component({
  selector: 'app-search-menus-modal',
  templateUrl: './search-menus-modal.page.html',
  styleUrls: ['./search-menus-modal.page.scss'],
})
export class SearchMenusModalPage implements OnInit {

  searchTerm = '';
  options: Fuse.IFuseOptions<MenuItem> = {
    keys: ['title', 'tags']
  };
  menus: MenuItem[];
  menusTitle: { [id: string]: string } = menusTitle;
  @ViewChild(IonSearchbar, { static: true }) searchbar: IonSearchbar;

  constructor(
    private storage: Storage,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    Promise.all([
      this.storage.get('role'),
      this.storage.get('canAccessResults')
    ]).then(([role, canAccessResults = false]: [Role, boolean]) => {
      if (role & Role.Student) {
        this.menus = menu.filter(menu => menu.role & role);
      } else {
        this.menus = menu.filter(menu => {
          return (menu.role & role) && ((menu.canAccess && menu.canAccess === canAccessResults) || !menu.canAccess);
        });
      }
    });
  }

  ionViewDidEnter() {
    this.searchbar.setFocus();
  }

  selectMenu(path: string) {
    this.modalCtrl.dismiss({ path });
  }
}
