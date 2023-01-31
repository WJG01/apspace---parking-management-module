import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifierService {
  examScheduleUpdated = new Subject();
  assessmentTypeUpdated = new Subject();
  timeFormatUpdated = new Subject();
  apCardUpdated = new Subject();
  staffDirectoryUpdated = new Subject();
  staffConsultationUpdated = new Subject();
}

