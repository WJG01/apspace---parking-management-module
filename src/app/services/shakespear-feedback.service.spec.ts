import { TestBed } from '@angular/core/testing';

import { ShakespearFeedbackService } from './shakespear-feedback.service';

describe('ShakespearFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShakespearFeedbackService = TestBed.get(ShakespearFeedbackService);
    expect(service).toBeTruthy();
  });
});
