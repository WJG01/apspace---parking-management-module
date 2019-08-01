import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Observable } from 'rxjs';

import { Graduater } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-graduate-verification-service',
  templateUrl: './graduate-verification-service.page.html',
  styleUrls: ['./graduate-verification-service.page.scss'],
})
export class GraduateVerificationServicePage implements OnInit {
  applieedYear = new Date().getFullYear() - 4;
  formsURL = 'http://forms.sites.apiit.edu.my/certificate-email-form/';
  graduater$: Observable<Graduater[]>;
  searchKeyword;
  userSearched = false;
  resultKeyWord;


  constructor(private iab: InAppBrowser, private ws: WsApiService) { }

  ngOnInit() {
  }

  openForms() {
    this.iab.create(`${this.formsURL}`, '_blank', 'location=true');
  }

  searchForGraduaters() {
    this.userSearched = true;
    this.resultKeyWord = this.searchKeyword || '';
    this.graduater$ = this.ws.get<Graduater[]>(`/alumni/validate?criterion=${this.searchKeyword}`, true, {auth: false});
  }

}