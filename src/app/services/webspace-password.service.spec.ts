import { TestBed } from '@angular/core/testing';

import { WebspacePasswordService } from './webspace-password.service';

describe('WebspacePasswordService', () => {
  let service: WebspacePasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebspacePasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
