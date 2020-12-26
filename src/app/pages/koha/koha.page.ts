import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Checkouts, Fine, History, LatestAdditions } from 'src/app/interfaces/koha';
import { CasTicketService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-koha',
  templateUrl: './koha.page.html',
  styleUrls: ['./koha.page.scss'],
})
export class KohaPage implements OnInit {

  checkouts$: Observable<Checkouts>;
  historyList$: Observable<History>;
  recentAdditions$: Observable<LatestAdditions>;
  fine$: Observable<Fine>;
  worldCatSearch: string;
  worldCatSearchCategory = '';
  worldCatSearchCategories = {
    all: '',
    ebooks: '&subformat=Book::book_digital&subformat=Book::book_continuing&subformat=Book::book_braille&subformat=Book::book_thsis&subformat=Book::book_mic&subformat=Book::book_largeprint',
    journals: '', // search query is equal between journal and all
    articles: '&subformat=Artchap::artchap_artcl',
    printBooks: '&subformat=Book::book_printbook'
  };
  searchTerm = 'All';
  isCordova: boolean;

  selectedSegment: 'checkouts' | 'history' | 'latest-additions' = 'checkouts';


  constructor(
    private ws: WsApiService,
    private network: Network,
    private platform: Platform,
    private toastCtrl: ToastController,
    private iab: InAppBrowser,
    private cas: CasTicketService
  ) { }

  ngOnInit() {
    this.isCordova = this.platform.is('cordova');
    this.getKohaData();
  }

  getKohaData() {
    this.checkouts$ = this.ws.get<Checkouts>('/koha/checkouts');
    this.historyList$ = this.ws.get<History>('/koha/history');
    this.recentAdditions$ = this.ws.get<LatestAdditions>('/koha/latestadditions');
    this.fine$ = this.ws.get<Fine>('/koha/fine');
  }

  openWorldCatSearch() {
    const url = `https://asiapacificuniversity.on.worldcat.org/external-search?queryString=${this.worldCatSearch}&databaseList=&clusterResults=on&stickyFacetsChecked=on&baseScope=${this.worldCatSearchCategory}`;

    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.iab.create(url, '_system', 'location=yes');
      } else {
        this.iab.create(url, '_blank', 'location=yes');
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }

    this.worldCatSearch = '';
  }

  openLibrary() {
    const url = 'https://library.apiit.edu.my/';

    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.iab.create(url, '_system', 'location=yes');
      } else {
        this.iab.create(url, '_blank', 'location=yes');
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }
  }

  openAdvancedSearch() {
    const url = 'https://asiapacificuniversity.on.worldcat.org/advancedsearch';

    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.iab.create(url, '_system', 'location=yes');
      } else {
        this.iab.create(url, '_blank', 'location=yes');
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }
  }

  openKoha() {
    const url = 'http://opac.apiit.edu.my/cgi-bin/koha/opac-user.pl';

    if (this.network.type !== 'none') {
      if (this.isCordova) {
        this.cas.getST(url).subscribe(st => {
          this.iab.create(`${url}?ticket=${st}`, '_system', 'location=yes');
        });
      } else {
        this.cas.getST(url).subscribe(st => {
          this.iab.create(`${url}?ticket=${st}`, '_blank', 'location=yes');
        });
      }
    } else {
      this.presentToast('External links cannot be opened in offline mode. Please ensure you have a network connection and try again');
    }
  }

  changeCategory(category: string, searchTerm: string) {
    this.worldCatSearchCategory = category;
    this.searchTerm = searchTerm;
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: 'danger',
      duration: 6000,
      position: 'top',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ],
    });
    toast.present();
  }
}
