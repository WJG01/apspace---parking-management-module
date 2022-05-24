import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PpFilterOptions } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class FilterOptionsService {
  options = new BehaviorSubject<PpFilterOptions>(null);
  sharedOptions$ = this.options.asObservable();

  constructor() {
    let options = JSON.parse(localStorage.getItem('filter-options'));
    if (options === null) {
      options = {
        sortBy: 'Date',
        isSortedAsc: false,
        categories: [
          { name: 'Praise', selected: true },
          { name: 'Achievement', selected: true },
          { name: 'Welfare', selected: true },
          { name: 'Issue Escalation', selected: true },
          { name: 'Announcement', selected: true },
          { name: 'Help Request', selected: false },
        ],
        funcAreas: [
          { name: 'Centre of Technology and Innovation', selected: true },
          { name: 'CEO Office', selected: true },
          { name: 'Student Services and Marketing', selected: true },
          { name: 'School of Computing', selected: true },
          { name: 'Finance', selected: true },
          { name: 'Library', selected: true },
          { name: 'School of Media, Arts and Design', selected: true },
        ],
      };
    }
    this.options.next(options);
    localStorage.setItem('filter-options', JSON.stringify(options));
  }

  setOptions(newOptions: PpFilterOptions) {
    this.options.next(newOptions);
    localStorage.setItem('filter-options', JSON.stringify(newOptions));
  }
}
