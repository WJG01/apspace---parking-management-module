import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { ModalController } from '@ionic/angular';

import Fuse from 'fuse.js';
import { Storage } from '@ionic/storage-angular';

import { NotificationBody, Role } from '../../interfaces';
import { ConfigurationsService, NotificationService } from '../../services';
import { NotificationDetailsModalPage } from './notification-details-modal/notification-details-modal.page';
import { DingdongPreferencesModalPage } from './dingdong-preferences-modal/dingdong-preferences-modal.page';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  messages$: Observable<NotificationBody[]>;
  categories$: Observable<any>;
  skeleton = new Array(3);
  categories = [];
  allCategories = {};
  openedMessages = [];
  filteredObject = {
    term: '',
    categories: [],
    unread: true,
    currentWeek: false
  }
  options: Fuse.IFuseOptions<NotificationBody> = {
    keys: [
      { name: 'title', weight: 0.2 },
      { name: 'category', weight: 0.1 },
    ]
  };
  isStudent = false;

  constructor(
    private notification: NotificationService,
    private config: ConfigurationsService,
    private modalCtrl: ModalController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      this.isStudent = role & Role.Student << 0 ? false : true;
    });

    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.messages$ = this.notification.getMessages().pipe(
      map(notifications => notifications.history),
      tap(notifications => {
        for (let history of notifications) {
          if (this.categories.indexOf(history.category) <= -1) {
            this.categories.push(history.category);
            this.filteredObject.categories.push(history.category);
          }
        }
      }),
      map(r => {
        let filteredMessage = r;

        if (this.filteredObject.unread) {
          filteredMessage = filteredMessage.filter(n => !n.read);
        }

        if (this.categories.length !== this.filteredObject.categories.length) {
          filteredMessage = filteredMessage.filter(n => {
            if (this.filteredObject.categories.includes(n.category)) {
              return true;
            }
            return false;
          });
        }

        if (this.filteredObject.currentWeek) {
          filteredMessage = filteredMessage.filter(n => {
            const sentDate = new Date(n.sent_on).getTime();

            return sentDate > this.config.currentWeek.startWeek.getTime() && sentDate < this.config.currentWeek.endWeek.getTime();
          });
        }

        return filteredMessage;
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );

    this.categories$ = this.notification.getCategories().pipe(
      tap(c => this.allCategories = c)
    );
  }

  getCategoryColor(category: string): string {
    let color = 'var(--ion-color-primary)'; // Fallback color

    Object.keys(this.allCategories).forEach(key => {
      if (key === category) {
        // Needed to check as backend will return null if colors are not specified which will cause the fallback color to not work
        if (this.allCategories[key].first_colour && this.allCategories[key].second_colour) {
          color = `linear-gradient(90deg, ${this.allCategories[key].first_colour} 0%, ${this.allCategories[key].second_colour} 100%)`;
        }
      }
    });
    return color;
  }

  resetFilter() {
    this.filteredObject = {
      term: '',
      categories: [],
      unread: true,
      currentWeek: true
    }
    this.doRefresh();
  }

  async openDetails(message: NotificationBody) {
    const modal = await this.modalCtrl.create({
      component: NotificationDetailsModalPage,
      componentProps: {
        message
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    this.openedMessages.push(message.message_id);
    this.notification.sendRead(message.message_id).subscribe();
    await modal.present();
    this.doRefresh();
  }

  async openPreference() {
    const modal = await this.modalCtrl.create({
      component: DingdongPreferencesModalPage,
      breakpoints: [0, 0.8],
      initialBreakpoint: 0.8
    });
    await modal.present();
  }
}
