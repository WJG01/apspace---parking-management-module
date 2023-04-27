import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IonSearchbar, ModalController, PopoverController } from '@ionic/angular';
import { concat, distinctUntilChanged, map, Observable, of, startWith } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {

  @ViewChild(IonSearchbar, { static: true }) searchbar: IonSearchbar;
  /** Items to be searched or filtered. */
  @Input() items: string[] = [];
  /** Displayed items before searching. If present, pre-search disable. */
  @Input() defaultItems: string[] = [];
  /** Placeholder shown for search bar. */
  @Input() placeholder = 'Search';
  /** Message to display when no items. */
  @Input() notFound = 'Type to search';
  /** Default pre-search term, pre-search if defaultItems unspecified. */
  @Input() defaultTerm = '';
  /** Determine if the search component is opened under modal page or popover */
  @Input() isModal = true;

  searchControl = new UntypedFormControl();
  searchItems$: Observable<string[]>;

  /** Map each item by function, defaults to `item => item.toUpperCase()`. */
  @Input() itemMapper = (item: string) => item.toUpperCase();

  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router
  ) { }

  ngOnInit() {
    // convert all items to uppercase
    const searchItems = Array.from(new Set(this.items.map(this.itemMapper))).sort();
    const defaultItems = this.defaultItems.map(this.itemMapper);

    // observable to process inputs when value changes
    let searchChange$ = this.searchControl.valueChanges.pipe(
      distinctUntilChanged(),
    );

    // default items have higher priority as this is optional
    if (this.defaultTerm) {
      // only pre-search when default items is not specified
      if (this.defaultItems.length === 0) {
        searchChange$ = searchChange$.pipe(startWith(this.itemMapper(this.defaultTerm)));
      }
      // set default term in view, handle change event ourselves
      this.searchControl.setValue(this.itemMapper(this.defaultTerm), { emitEvent: false });
    }

    const searchResult$ = searchChange$.pipe(
      map(term => this.search(searchItems, term)),
    );

    // continue default observable with searched result
    this.searchItems$ = concat(of(defaultItems), searchResult$);
  }

  // Fix issue where searchbar are not focused properly
  ionViewDidEnter() {
    this.searchbar.setFocus();
  }

  select(item: string) {
    if (this.isModal) {
      this.modalCtrl.dismiss({ item });
    } else {
      this.popoverCtrl.dismiss({ item });
    }
  }

  search(items: string[], term: string): string[] {
    // start filter on input but accept EMPTY input too
    const filteredItems = term.length !== 0
      ? items.filter(item => item.indexOf(term) !== -1)
      : [];
    return filteredItems;
  }

  goToFeedback() {
    this.modalCtrl.dismiss().then(_ => this.router.navigateByUrl('/feedback'));
  }
}
