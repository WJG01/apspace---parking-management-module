import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NotifierService } from 'src/app/shared/notifier/notifier.service';

@Component({
  selector: 'app-staff-directory',
  templateUrl: './staff-directory.page.html',
  styleUrls: ['./staff-directory.page.scss'],
})
export class StaffDirectoryPage {

  constructor(private router: Router, private notifierService: NotifierService) {}

  doRefresh(refresher?) {
    this.notifierService.staffDirectoryUpdated.next('REFRESH');
    return refresher.target.complete();
  }

  navigateToStaffDetails($event) {
    const staffID = $event;
    this.router.navigate([`/staffs/${staffID}`]);
  }
}
