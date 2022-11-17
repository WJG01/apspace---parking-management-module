import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Checkouts, Fine, LatestAdditions } from 'src/app/interfaces';
import { WsApiService, CasTicketService, ComponentService } from 'src/app/services';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
})
export class LibraryPage implements OnInit {

  checkouts$: Observable<Checkouts>;
  historyList$: Observable<History>;
  recentAdditions$: Observable<LatestAdditions>;
  fine$: Observable<Fine>;
  worldCatSearch = '';
  worldCatSearchCategory = '';
  worldCatSearchCategories = {
    all: '',
    ebooks: '&subformat=Book::book_digital&subformat=Book::book_continuing&subformat=Book::book_braille&subformat=Book::book_thsis&subformat=Book::book_mic&subformat=Book::book_largeprint',
    journals: '', // search query is equal between journal and all
    articles: '&subformat=Artchap::artchap_artcl',
    printBooks: '&subformat=Book::book_printbook'
  };
  searchTerm = 'All';
  isCapacitor: boolean;

  selectedSegment: 'checkouts' | 'history' | 'latest-additions' = 'checkouts';

  constructor(
    private ws: WsApiService,
    private platform: Platform,
    private cas: CasTicketService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.isCapacitor = this.platform.is('capacitor');
    this.getKohaData();
  }

  getKohaData() {
    this.checkouts$ = this.ws.get<Checkouts>('/koha/checkouts');
    this.historyList$ = this.ws.get<History>('/koha/history');
    this.recentAdditions$ = this.ws.get<LatestAdditions>('/koha/latestadditions');
    this.fine$ = this.ws.get<Fine>('/koha/fine');
  }

  openWorldCatSearch() {
    if (this.worldCatSearch === '') {
      return this.component.toastMessage('Search field cannot be empty', 'warning');
    }

    const url = `https://asiapacificuniversity.on.worldcat.org/external-search?queryString=${this.worldCatSearch}&databaseList=&clusterResults=on&stickyFacetsChecked=on&baseScope=${this.worldCatSearchCategory}`;

    this.component.openLink(url);
  }

  openLibrary() {
    const url = 'https://library.apiit.edu.my/';

    this.component.openLink(url);
  }

  openAdvancedSearch() {
    const url = 'https://asiapacificuniversity.on.worldcat.org/advancedsearch';

    this.component.openLink(url);
  }

  openKoha() {
    const url = 'http://opac.apiit.edu.my/cgi-bin/koha/opac-user.pl';

    this.cas.getST(url).subscribe(st => {
      this.component.openLink(`${url}?ticket=${st}`);
    });
  }

  changeCategory(category: string, searchTerm: string) {
    this.worldCatSearchCategory = category;
    this.searchTerm = searchTerm;
  }
}
