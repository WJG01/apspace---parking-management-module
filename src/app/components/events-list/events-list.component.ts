import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { EventComponentConfigurations } from 'src/app/interfaces';

@Component({
  selector: 'events-list',
  templateUrl: 'events-list.component.html',
  styleUrls: ['events-list.component.scss']
})
export class EventsListComponent {
  @Input() observable$: Observable<EventComponentConfigurations[]>;
  skeletonConfigurations = {
    eventsSkeleton: new Array(3),
  };

  splitTimeAndGetOnePart(part: 'third' | 'second' | 'first', time: string) {
    if (part === 'first') {
      return time.split(' ')[0];
    } else if (part === 'second') {
      return time.split(' ')[1];
    }
    return time.split(' ')[2];
  }

}
