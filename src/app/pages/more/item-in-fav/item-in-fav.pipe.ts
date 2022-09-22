import { Pipe, PipeTransform } from '@angular/core';

import { MenuItem } from '../menu.interface';

@Pipe({
  name: 'itemInFav'
})
export class ItemInFavPipe implements PipeTransform {
  /**
   * Check if an Item is Favourites
   * @param favMenuItems - Favourite Items from Local Storage
   * @param menuItem - Selected Menu Item
   * @returns a boolean
   */
  transform(favMenuItems: MenuItem[], menuItem: MenuItem): boolean {
    return favMenuItems.some(item => item.title === menuItem.title)
  }
}
