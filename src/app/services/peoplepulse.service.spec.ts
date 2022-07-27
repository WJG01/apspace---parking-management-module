import { TestBed } from '@angular/core/testing';

import { PeoplepulseService, PpFilterOptionsService } from './peoplepulse.service';

describe('PeoplepulseService', () => {
  let service: PeoplepulseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeoplepulseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('PpFilterOptionsService', () => {
  let service: FilterOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpFilterOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
