import { Injectable } from '@angular/core';
import { ParkingWsApiService } from './parking_module-ws-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookParkingService {

  constructor(
    private pws: ParkingWsApiService,
  ) { }

  getAllBookedParkings(): Observable<any> {
    return this.pws.get<any>('/parking-book');
  }

  createNewParkingBooking(body, headers): Observable<any> {
    return this.pws.post<any>('/parking-book', { body, headers });
  }
}
