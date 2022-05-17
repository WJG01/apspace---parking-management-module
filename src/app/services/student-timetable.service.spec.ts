import { TestBed } from '@angular/core/testing';

import { StudentTimetableService } from './student-timetable.service';

describe('StudentTimetableService', () => {
  let service: StudentTimetableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentTimetableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
