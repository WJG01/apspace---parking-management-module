import { TestBed } from '@angular/core/testing';

import { ParkingWsApiService } from './parking_module-ws-api.service';

describe('ParkingWsApiService', () => {
  let service: ParkingWsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParkingWsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
