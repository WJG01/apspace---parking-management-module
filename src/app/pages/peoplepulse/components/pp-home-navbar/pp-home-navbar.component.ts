import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { StaffProfile, StudentPhoto } from 'src/app/interfaces';
import { PpFilterComponent } from '../pp-filter/pp-filter.component';

@Component({
  selector: 'app-pp-home-navbar',
  templateUrl: './pp-home-navbar.component.html',
  styleUrls: ['./pp-home-navbar.component.scss'],
})
export class PpHomeNavbarComponent implements OnInit {
  @Input() photo$: Observable<StudentPhoto>;
  @Input() staffProfile$: Observable<StaffProfile[]>;
  @Input() postsChange: EventEmitter<any[]>;
  @ViewChild('searchbar', { static: false }) searchbar: IonSearchbar;
  isSearchOpen = false;
  isFilterOpen = false;

  constructor(public popoverController: PopoverController) {}

  ngOnInit() {}

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  setFocus() {}

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: PpFilterComponent,
      cssClass: 'filter-modal',
      translucent: true,
    });
    await popover.present();
  }
}
