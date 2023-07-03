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

  getAllEmergencyReport(): Observable<any> {
    return this.pws.get<any>('//parking-emergency');
  }

  createNewEmergencyReport(body, headers): Observable<any> {
    return this.pws.post<any>('/parking-emergency', { body, headers });
  }
}
