import { TestBed } from '@angular/core/testing';

import { CasTicketService } from './cas-ticket.service';

describe('CasTicketService', () => {
  let service: CasTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CasTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
