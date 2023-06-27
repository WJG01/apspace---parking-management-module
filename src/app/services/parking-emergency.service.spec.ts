import { TestBed } from '@angular/core/testing';

import { ParkingEmergencyService } from './parking-emergency.service';

describe('ParkingEmergencyService', () => {
  let service: ParkingEmergencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParkingEmergencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
