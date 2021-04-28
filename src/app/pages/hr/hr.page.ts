import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { OnLeaveOnMyCluster, PendingApproval, StaffDirectory } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
@Component({
  selector: 'app-hr',
  templateUrl: './hr.page.html',
  styleUrls: ['./hr.page.scss'],
})
export class HrPage implements OnInit {

  // leaves$: Observable<LeaveBalance[]>;
  history$: Observable<any[]>;
  leaveInCluster$: Observable<any[]>;
  pendingApproval$: Observable<PendingApproval[]>;
  skeletons = new Array(4);
  staffsOnLeave = []; // IDs of all staff on leave
  canAccessPayslipFileSearch;

  constructor(
    public modalCtrl: ModalController,
    private ws: WsApiService,
    private iab: InAppBrowser,
    private router: Router,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.history$ = this.getHistory();
    this.leaveInCluster$ = this.getOnLeaveInMyCluster();
    this.pendingApproval$ = this.getPendingMyApproval();
    this.storage.get('canAccessPayslipFileSearch').then(
      canAccessPayslipFileSearch => this.canAccessPayslipFileSearch = canAccessPayslipFileSearch
    );
  }

  getHistory() {
    return this.ws.get('/staff/leave_status').pipe(
      map((res: []) => {
        const results = this.sortArrayOfDateKey(res, 'LEAVE_DATE', 'desc').reduce((previous: any, current: any) => {
          if (!previous[format(new Date(current.LEAVE_DATE), 'MMMM yyyy')]) {
            previous[format(new Date(current.LEAVE_DATE), 'MMMM yyyy')] = [current];
          } else {
            previous[format(new Date(current.LEAVE_DATE), 'MMMM yyyy')].push(current);
          }
          return previous;
        }, {});
        return Object.keys(results).map(date => ({ date, value: results[date] }));
      })
    );
  }

  getPendingMyApproval() {
    return this.ws.get<PendingApproval[]>('/staff/pending_approval').pipe(
      map((res: []) => this.sortArrayOfDateKey(res, 'LEAVEDATE', 'asc'))
    );
  }

  getOnLeaveInMyCluster() {
    return this.ws.get<OnLeaveOnMyCluster[]>('/staff/leave_in_cluster').pipe(
      tap(res => {
        if (res.length > 0) {
          res.forEach(staffOnLeave => {
            this.staffsOnLeave.push(staffOnLeave);
          });
        }
      }),
      map(_ => {
        this.ws.get<StaffDirectory[]>(`/staff/listing`, { caching: 'cache-only' }).subscribe(
          {
            next: (staffDirResponse: StaffDirectory[]) => {
              this.staffsOnLeave.forEach(staffOnLeave => {
                const searchResult = staffDirResponse.filter(staff => staff.ID === staffOnLeave.ID)[0];
                staffOnLeave.PHOTO = searchResult.PHOTO;
                staffOnLeave.EMAIL = searchResult.EMAIL;
              });
            }
          }
        );
        return this.sortArrayOfDateKey(this.staffsOnLeave, 'LEAVEDATE', 'asc');
      },
      ),
      map(res => {
        const results = res
          .reduce((previous: any, current: any) => {
            if (!previous[current.LEAVEDATE]) {
              previous[current.LEAVEDATE] = [current];
            } else {
              previous[current.LEAVEDATE].push(current);
            }
            return previous;
          }, {});
        return Object.keys(results).map(date => ({ date, value: results[date] }));
      }),
      tap(console.log)
    );
  }

  sortArrayOfDateKey(array: any[], key: string, sortType: 'asc' | 'desc') {
    return array.sort((a: any, b: any) => {
      if (new Date(a[key]) > new Date(b[key])) {
        return sortType === 'asc' ? 1 : -1;
      }
      if (new Date(a[key]) < new Date(b[key])) {
        return sortType === 'asc' ? -1 : 1;
      }
      return 0;
    }
    );
  }

  openHrSystem() {
    this.iab.create('https://hr.apiit.edu.my', '_system', 'location=true');
  }

  openHrDownload() {
    this.router.navigate(['/hr/hr-download']);
  }

}
