import { Pipe, PipeTransform } from '@angular/core';

import { NotificationBody } from 'src/app/interfaces';

@Pipe({
  name: 'notificationCategory'
})
export class NotificationCategoryPipe implements PipeTransform {

  /**
   * Filter notification page by category.
   *
   * @param notifications Array of notifications
   * @param categories array of categories
   */
  transform(notifications: NotificationBody[], categories: string[]): any {
    let results: NotificationBody[] = [];

    results = notifications.filter(notification => {
      if (categories.includes(notification.category)) {
        return true;
      } else {
        return false;
      }
    });

    return results;
  }
}
