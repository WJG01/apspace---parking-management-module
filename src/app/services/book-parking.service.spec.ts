import { TestBed } from '@angular/core/testing';

import { BookParkingService } from './book-parking.service';

describe('BookParkingService', () => {
  let service: BookParkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookParkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
