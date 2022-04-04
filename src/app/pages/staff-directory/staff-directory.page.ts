import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-directory',
  templateUrl: './staff-directory.page.html',
  styleUrls: ['./staff-directory.page.scss'],
})
export class StaffDirectoryPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openStaffInfo(id: string) {
    const staffID = id;
    this.router.navigate([`/staffs/${staffID}`]);
  }
}
