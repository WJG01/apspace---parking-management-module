import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Graduater } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { ComponentService } from '../../services';

@Component({
  selector: 'app-graduate-verification-service',
  templateUrl: './graduate-verification-service.page.html',
  styleUrls: ['./graduate-verification-service.page.scss'],
})
export class GraduateVerificationServicePage {
  appliedYear : string = '2015';
  formsURL : string= 'https://apiit.atlassian.net/servicedesk/customer/portal/6/group/10/create/10181';
  graduater$: Observable<Graduater[]>;
  searchKeyword: string;
  userSearched: boolean = false;
  resultKeyWord: string;

  constructor(
    private component: ComponentService,
    private ws: WsApiService
  ) { }

  openForms() {
    return this.component.openLink(this.formsURL);
  }

  searchForGraduaters() {
    this.userSearched = true;
    this.resultKeyWord = this.searchKeyword || '';
    this.graduater$ = this.ws.get<Graduater[]>(`/alumni/validate?criterion=${this.searchKeyword}`, { auth: false });
  }

}
