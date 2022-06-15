import { Pipe, PipeTransform } from '@angular/core';

import { MenuItem } from './menu.interface';

/**
 * Regroup menu items.
 */
@Pipe({
  name: 'byGroup'
})
export class ByGroupPipe implements PipeTransform {

  /**
   * Group menu items by `group`.
   *
   * @param menu - array of menu item
   * @return groupMenu - menu grouped by `group` in order
   */
  transform(menu: MenuItem[]): Map<string, MenuItem[]> {
    return menu.reduce((acc, menu) => {
      acc.set(menu.group, (acc.get(menu.group) || []).concat(menu));
      return acc;
    }, new Map());
  }

}
