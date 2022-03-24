import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { QuixCustomer } from 'src/app/interfaces/quix';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-operation-hours',
  templateUrl: './operation-hours.page.html',
  styleUrls: ['./operation-hours.page.scss'],

})
export class OperationHoursPage {
  @ViewChild('content', { static: true }) content: IonContent;
  skeletons = new Array(4);
  quixCompanies$: Observable<QuixCustomer[]>;
  selectedSegment: 'APU' | 'APIIT' = 'APU';

  constructor(
    private ws: WsApiService,
  ) { }

  ionViewDidEnter() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    const headers = { 'X-Filename': 'quix-customers' };
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.quixCompanies$ = this.ws.get<QuixCustomer[]>('/quix/get/file', {
      auth: false,
      caching,
      headers
    }
    ).pipe(
      map(res => {
        // fitler out printshop data, might be returned later
        return res.map(company => {
          if (company.company_id === 'APU') {
            company.company_departments = company.company_departments.filter(department => department.dept_name !== 'Printshop @APU');
          }
          return company;
        });
      }),
      finalize(() => refresher && refresher.target.complete()),
    );
  }

  segmentValueChanged() {
    this.content.scrollToTop();
  }
}


