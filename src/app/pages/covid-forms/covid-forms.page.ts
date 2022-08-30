import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { UserVaccineInfo } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-covid-forms',
  templateUrl: './covid-forms.page.html',
  styleUrls: ['./covid-forms.page.scss'],
})
export class CovidFormsPage implements OnInit {

  // User Vaccination Information
  userVaccinationInfo$: Observable<UserVaccineInfo>;

  constructor(private ws: WsApiService) { }

  ngOnInit() {
    this.getUserVaccinationInfo();
  }

  getUserVaccinationInfo() {
    this.userVaccinationInfo$ = this.ws.get<UserVaccineInfo>('/covid19/user');
  }
}
