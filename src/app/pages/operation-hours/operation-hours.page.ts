import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';

import { QuixCustomer } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-operation-hours',
  templateUrl: './operation-hours.page.html',
  styleUrls: ['./operation-hours.page.scss'],
})
export class OperationHoursPage implements OnInit {

  quixCompanies$: Observable<QuixCustomer[]>;
  companies = ['APU', 'APIIT'];
  selectedSegment: 'APU' | 'APIIT' = 'APU';
  skeleton = new Array(3);

  constructor(private ws: WsApiService) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    const headers = { 'X-Filename': 'quix-customers' };
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    this.quixCompanies$ = this.ws.get<QuixCustomer[]>('/quix/get/file', { auth: false, caching, headers }).pipe(
      map(quix => {
        // Filter out printshop data, might be returned later
        return quix.map(company => {
          if (company.company_id === 'APU') {
            company.company_departments = company.company_departments.filter(department => department.dept_name !== 'Printshop @APU');
          }
          return company;
        });
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
  }
}
