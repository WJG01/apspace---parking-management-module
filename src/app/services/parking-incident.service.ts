import { Injectable } from '@angular/core';
import { ParkingWsApiService } from './parking_module-ws-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingIncidentService {

  constructor(
    private pws: ParkingWsApiService,
  ) { }


  createIncidentReport(body, headers): Observable<any> {
    return this.pws.post<any>('/parking-incident', { body, headers });
  }
}
