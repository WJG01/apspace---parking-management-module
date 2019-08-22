import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { QuixCustomer } from 'src/app/interfaces/quix';
import { WsApiService } from 'src/app/services';


@Component({
  selector: 'app-operation-hours',
  templateUrl: './operation-hours.page.html',
  styleUrls: ['./operation-hours.page.scss'],

})
export class OperationHoursPage implements OnInit {
  quixCustomers$: Observable<QuixCustomer[]>;


  constructor(
    private ws: WsApiService,
  ) { }

  ngOnInit() {
    this.getCompany();
  }
  getCompany() {
    const header = new HttpHeaders({ 'X-Filename': 'quix-customers' });
    return this.quixCustomers$ = this.ws.get<QuixCustomer[]>('/quix/get/file', true, {
      headers: header,
      auth: false
    });
  }
}

