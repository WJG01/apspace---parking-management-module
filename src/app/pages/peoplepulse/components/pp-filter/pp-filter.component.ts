import { Component, OnInit } from '@angular/core';

// import { PeoplepulseService } from 'src/app/services/peoplepulse.service';
import { PpFilterOptions, PpFilterOptionsSelectable } from 'src/app/interfaces';
import { FilterOptionsService } from '../../services/filter-options.service';

@Component({
  selector: 'app-pp-filter',
  templateUrl: './pp-filter.component.html',
  styleUrls: ['./pp-filter.component.scss'],
})
export class PpFilterComponent implements OnInit {
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
    // private peoplepulseService: PeoplepulseService,
    public filterOptions: FilterOptionsService
  ) {}

  ngOnInit() {
    this.filterOptions.sharedOptions$.subscribe((opt) => {
      (this.options = opt), (this.selectedCats = opt.categories.filter((c) => c.selected));
      this.notSelectedCats = opt.categories.filter((c) => !c.selected);
      this.allChecked = opt.funcAreas.filter((f) => f.selected).length === opt.funcAreas.length;
    });
  }

  onSortByChange(e: any) {
    this.options.sortBy = e.detail.value;
    this.filterOptions.setOptions(this.options);
  }

  onIsSortedAscChange(e: any) {
    this.options.isSortedAsc = e.detail.value === 'Asc';
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
}
