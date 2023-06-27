import { Injectable } from '@angular/core';
import { ParkingWsApiService } from './parking_module-ws-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingEmergencyService {

  constructor(
    private pws: ParkingWsApiService,
  ) { }

  createNewEmergencyReport(body, headers): Observable<any> {
    return this.pws.post<any>('/parking-emergency', { body, headers });
  }
}
