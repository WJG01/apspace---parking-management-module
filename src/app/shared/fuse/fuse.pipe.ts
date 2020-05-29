/** Implementation based on ng-fuse. */
import { Pipe, PipeTransform } from '@angular/core';
import Fuse from 'fuse.js';

/**
 * Fuzzy search powered by fuse.js.
 */
@Pipe({
  name: 'fuse'
})
export class FusePipe implements PipeTransform {

  /**
   * Fuzzy search, return all items if search term empty.
   *
   * @param items - array of menu item
   * @param term - search term
   * @param options - fuse options
   * @returns searched - searched items
   */
  transform<T>(items: T[], term: string, options: Fuse.IFuseOptions<T>): any {
    if (term !== '') {
      const fuse = new Fuse(items, options);
      return fuse.search(term).map(result => result.item);
    } else {
      return items;
    }
  }

}
