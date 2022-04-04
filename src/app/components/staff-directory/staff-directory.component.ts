import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';

import Fuse from 'fuse.js';

import { StaffDirectory } from '../../interfaces';
import { WsApiService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'staff-directory',
  templateUrl: './staff-directory.component.html',
  styleUrls: ['./staff-directory.component.scss'],
})
export class StaffDirectoryComponent implements OnInit {

  @Output() staffID = new EventEmitter<string>();
  @Input() payslip = false;

  staffs$: Observable<StaffDirectory[]>;
  skeleton = new Array(5);
  departments = [];
  // For Filtering
  filterObject = {
    term: '',
    department: 'all'
  };
  options: Fuse.IFuseOptions<StaffDirectory> = {
    keys: [
      { name: 'FULLNAME', weight: 0.2 },
      { name: 'CODE', weight: 0.1 },
      { name: 'ID', weight: 0.1 },
      { name: 'EMAIL', weight: 0.1 },
      { name: 'EXTENSION', weight: 0.1 },
      { name: 'TITLE', weight: 0.1 }
    ]
  };

  constructor(
    private ws: WsApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    const endpoint = this.payslip ? '/staff/listing_v2' : '/staff/listing';

    this.staffs$ = this.ws.get<StaffDirectory[]>(endpoint, { caching }).pipe(
      map(staffs => {
        for (let staff of staffs) {
          staff.IMAGEURL = `https://d37plr7tnxt7lb.cloudfront.net/${staff.RefNo}_64x64.jpg`;
        }

        return staffs;
      }),
      tap(staffs => {
        console.log(staffs)
        for (const staff of staffs) {
          // Filter empty string
          if (staff.DEPARTMENT) {
            if (this.departments.indexOf(staff.DEPARTMENT) <= -1) {
              this.departments.push(staff.DEPARTMENT);
            }
          }
        }
        this.departments.sort();
      }),
      map(staffs => {
        let filteredStaffs = staffs;

        if (this.filterObject.department !== 'all') {
          filteredStaffs = filteredStaffs.filter(d => [d.DEPARTMENT, d.DEPARTMENT2, d.DEPARTMENT3].includes(this.filterObject.department));
        }

        return filteredStaffs;
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
  }

  openFeedback() {
    this.router.navigateByUrl('/feedback');
  }

  trackById(value: StaffDirectory): string {
    return value.CODE;
  }

  outputStaffId(staffID: string) {
    this.staffID.emit(staffID);
  }
}
