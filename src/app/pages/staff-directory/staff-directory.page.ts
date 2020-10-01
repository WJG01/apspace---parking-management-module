import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-directory',
  templateUrl: './staff-directory.page.html',
  styleUrls: ['./staff-directory.page.scss'],
})
export class StaffDirectoryPage {

  constructor(private router: Router) {}

  navigateToStaffDetails($event) {
    const staffID = $event;
    this.router.navigate([`/staffs/${staffID}`]);
  }
}
