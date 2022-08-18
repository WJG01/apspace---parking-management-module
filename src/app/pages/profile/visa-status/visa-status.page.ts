import { Component, OnInit } from '@angular/core';
import { CountryData, Role, StudentProfile, VisaDetails } from '../../../interfaces';
import { finalize, map, Observable, tap } from 'rxjs';
import { ComponentService, WsApiService } from '../../../services';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-visa-status',
  templateUrl: './visa-status.page.html',
  styleUrls: ['./visa-status.page.scss'],
})
export class VisaStatusPage implements OnInit {
  // observables
  visa$: Observable<VisaDetails>;

  // handle errors for locals
  local = false;
  countryName: string;
  passportNumber: string;
  alpha3Code = '';
  listOfCountries: CountryData[];
  sendRequest = false;
  // skeleton
  skeletons = new Array(5);


  constructor(
    public component: ComponentService,
    private ws: WsApiService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line: no-bitwise
      if (role & Role.Student) {
        this.sendRequest = true;
        this.getProfile();
      }
    });
    this.getListOfCountries(); // get the list of countries when the page loads and add the data to ion-select
  }

  getListOfCountries() {
    this.ws.get<CountryData[]>(`/all/?fields=name,cca3`, {
      url: 'https://restcountries.com/v3.1',
      auth: false,
      caching: 'cache-only',
    }).pipe(
      map(res => {
        return res.sort((first, next) => {
          if (first.name.common < next.name.common) { return -1; }
          if (first.name.common > next.name.common) { return 1; }
          return 0;
        });
      }),
      tap(res => {
        this.listOfCountries = res;
      }),
    ).subscribe();
  }

  getProfile() {
    this.ws.get<StudentProfile>('/student/profile', { caching: 'cache-only' }).pipe(
      tap(p => {
        this.countryName = p.COUNTRY;

        this.passportNumber = p.IC_PASSPORT_NO;
        if (p.COUNTRY === 'Malaysia') {
          this.local = true;
        } else {
          this.local = false;
        }
        this.getAlpha3Code();
      }),
    ).subscribe();
  }

  getAlpha3Code() {
    // alpha 3 code example: Libya => LBY
    this.ws.get<CountryData[]>(`/name/${this.countryName}?fields=name,cca3`, {
      url: 'https://restcountries.com/v3.1',
      auth: false,
      caching: 'cache-only',
    }).pipe(
      tap(res => {
        this.alpha3Code = res[0].cca3;
      }),
      tap(_ => this.getVisa()),
    ).subscribe();
  }

  getVisa(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    if (!(this.alpha3Code && this.passportNumber)) {
      this.component.toastMessage('You cannot search or refresh while having a blank field.', 'danger');
      if (refresher) {
        refresher.target.complete();
      }
      return;
    }

    this.sendRequest = true;
    this.visa$ = this.ws.get<VisaDetails>(`/student/visa_renewal_status/${this.alpha3Code}/${this.passportNumber}`, {
      auth: false,
      caching,
    }).pipe(
      finalize(() => refresher && refresher.target.complete())
    );
  }

  trackAnotherApplication() {
    this.local = false;
  }

}
