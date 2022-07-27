import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PpFilterOptions, PpFilterOptionsSelectable } from 'src/app/interfaces';
import { PpFilterOptionsService } from 'src/app/services';

@Component({
  selector: 'app-pp-filter-modal',
  templateUrl: './pp-filter-modal.component.html',
  styleUrls: ['./pp-filter-modal.component.scss'],
})
export class PpFilterModalComponent implements OnInit {
  options: PpFilterOptions;
  allChecked = true;
  funcAreas: PpFilterOptionsSelectable[] = [];
  selectedCats: PpFilterOptionsSelectable[] = [];
  notSelectedCats: PpFilterOptionsSelectable[] = [];
  lookup = {
    Praise: 'primary',
    Welfare: 'secondary',
    'Issue Escalation': 'tertiary',
    Achievement: 'success',
    'Help Request': 'warning',
    Announcement: 'danger',
  };

  constructor(
    private modalController: ModalController,
    public filterOptions: PpFilterOptionsService
  ) {}

  ngOnInit() {
    this.filterOptions.sharedOptions$.subscribe((opt) => {
      (this.options = opt), (this.selectedCats = opt.categories.filter((c) => c.selected));
      this.notSelectedCats = opt.categories.filter((c) => !c.selected);
      this.allChecked = opt.funcAreas.filter((f) => f.selected).length === opt.funcAreas.length;
    });
  }

  onSortByChange() {
    this.filterOptions.setOptions(this.options);
  }

  toggleCheck() {
    this.options.funcAreas = this.options.funcAreas.map((f) => ({
      ...f,
      selected: !this.allChecked,
    }));
    this.onFuncAreasChange();
  }

  onFuncAreasChange() {
    this.filterOptions.setOptions(this.options);
  }

  addCategory(cat: string) {
    this.options.categories = this.options.categories.map((c) => {
      if (c.name === cat) {
        c.selected = false;
      }
      return c;
    });
    this.filterOptions.setOptions(this.options);
  }

  delCategory(cat: string) {
    this.options.categories = this.options.categories.map((c) => {
      if (c.name === cat) {
        c.selected = true;
      }
      return c;
    });
    this.filterOptions.setOptions(this.options);
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
