import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import Fuse from 'fuse.js';
import { Observable, Subscription } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';

import { NotifierService } from 'src/app/shared/notifier/notifier.service';
import { StaffDirectory } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'staff-directory',
  templateUrl: './staff-directory.component.html',
  styleUrls: ['./staff-directory.component.scss'],
})
export class StaffDirectoryComponent implements OnInit, OnDestroy{
  @Output() staffID = new EventEmitter<string>();

  notification: Subscription;

  term = '';
  dept = '';
  staff$: Observable<StaffDirectory[]>;
  staffType$: Observable<string[]>;
  skeletons = new Array(6);
  options: Fuse.IFuseOptions<StaffDirectory> = {
    keys: [
      { name: 'FULLNAME', weight: 0.2 },
      { name: 'CODE', weight: 0.1 },
      { name: 'ID', weight: 0.1 },
      { name: 'EMAIL', weight: 0.1 },
      { name: 'EXTENSION', weight: 0.1 },
      { name: 'TITLE', weight: 0.1 },
    ]
  };

  constructor(
    private ws: WsApiService,
    private notifierService: NotifierService
  ) { }

  ngOnInit() {
    this.notification = this.notifierService.staffDirectoryUpdated.subscribe(data => {
      if (data && data === 'REFRESH') {
        this.doRefresh();
      }
    });

    this.doRefresh();
  }

  ngOnDestroy() {
    this.notification.unsubscribe();
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    this.staff$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching });
    this.staffType$ = this.staff$.pipe(
      filter(ss => ss instanceof Array),
      map(ss => Array.from(new Set(ss.map(s => s.DEPARTMENT))).sort()),
      finalize(() => refresher && refresher.target.complete()),
    );
  }

  trackById(value: StaffDirectory): string {
    return value.CODE;
  }

  outputStaffId(staffID) {
    this.staffID.emit(staffID);
  }
}
