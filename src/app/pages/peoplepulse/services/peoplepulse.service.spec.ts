import { TestBed } from '@angular/core/testing';

import { PeoplepulseService } from './peoplepulse.service';

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
