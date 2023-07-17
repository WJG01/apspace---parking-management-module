import { TestBed } from '@angular/core/testing';

import { ParkingIncidentService } from './parking-incident.service';

describe('ParkingIncidentService', () => {
  let service: ParkingIncidentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParkingIncidentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
