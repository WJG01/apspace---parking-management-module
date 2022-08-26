import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ComponentService } from '../../services';

@Component({
  selector: 'app-maintenance-and-update',
  templateUrl: './maintenance-and-update.page.html',
  styleUrls: ['./maintenance-and-update.page.scss'],
})
export class MaintenanceAndUpdatePage implements OnInit {

  forceUpdate: boolean;
  storeUrl: string;

  constructor(
    private router: Router,
    private component: ComponentService
  ) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state) {
      if (this.router.getCurrentNavigation().extras.state.storeUrl) {
        this.storeUrl = this.router.getCurrentNavigation().extras.state.storeUrl;
      }
      if (this.router.getCurrentNavigation().extras.state.forceUpdate) {
        this.forceUpdate = this.router.getCurrentNavigation().extras.state.forceUpdate;
      }
    }
  }

  openPage() {
    if (this.forceUpdate) {
      this.component.openLink(this.storeUrl);
      return;
    }

    this.router.navigateByUrl('/feedback');
  }
}
