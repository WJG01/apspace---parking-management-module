import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import Fuse from 'fuse.js';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { NotificationHistory, Role } from 'src/app/interfaces';
import { NotificationService } from 'src/app/services';
import { DingdongPreferencesModalPage } from './dingdong-preferences/dingdong-preferences-modal';
import { NotificationModalPage } from './notification-modal';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  isStudent = false; // By default, set false
  messages$: Observable<NotificationHistory>;
  categories = [];
  allCategories = {};
  skeletons = new Array(6);
  openedMessages = [];
  filterObject = {
    categories: [],
    upcoming: true
  };

  searchTerm = '';

  optionsNotifications: Fuse.IFuseOptions<NotificationHistory> = {
    keys: [
      { name: 'title', weight: 0.2 },
      { name: 'category', weight: 0.1 },
    ]
  };

  constructor(
    private notificationService: NotificationService,
    private modalCtrl: ModalController,
    private storage: Storage,
    private menu: MenuController,
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line: no-bitwise
      this.isStudent = role & Role.Student << 0 ? false : true;
    });
  }

  ionViewDidEnter() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.categories = [];
    this.filterObject.categories = [];
    this.messages$ = this.notificationService.getMessages().pipe(
      tap(res => res.history.forEach((history) => {
        if (this.categories.indexOf(history.category) <= -1) {
          this.categories.push(history.category);
          this.filterObject.categories.push(history.category);
        }
      })),
      finalize(() => refresher && refresher.target.complete()),
    );

    this.notificationService.getCategories().pipe(
      tap((categoriesRes: { categories: [] }) => this.allCategories = categoriesRes.categories)
    ).subscribe();
  }

  openMenu() {
    this.menu.enable(true, 'notifications-filter-menu');
    this.menu.open('notifications-filter-menu');
  }

  closeMenu() {
    this.menu.close('notifications-filter-menu');
  }

  getCategoryColor(categoryName: string) {
    let color = '';
    Object.keys(this.allCategories).forEach(key => {
      if (key === categoryName) {
        color = `linear-gradient(90deg, ${this.allCategories[key].first_colour} 0%, ${this.allCategories[key].second_colour} 100%)`;
      }
    });

    return color ? color : '#3880ff'; // default color
  }

  async openNotificationsModal(message: any) {
    const modal = await this.modalCtrl.create({
      component: NotificationModalPage,
      componentProps: { message, notFound: 'No Message Selected' },
    });
    this.openedMessages.push(message.message_id);
    this.notificationService.sendRead(message.message_id).subscribe();
    await modal.present();
    this.doRefresh();
    await modal.onDidDismiss();
  }

  async openDingDongModal() {
    const modal = await this.modalCtrl.create({
      component: DingdongPreferencesModalPage
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
