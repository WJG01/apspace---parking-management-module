import { Component, Input, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { format, formatISO } from 'date-fns';

import { MappedLecturerTimetable } from '../../interfaces';
import { ApiService, ComponentService, ConfigurationsService } from '../../services';

@Component({
  selector: 'lecturer-timetable',
  templateUrl: './lecturer-timetable.component.html',
  styleUrls: ['./lecturer-timetable.component.scss'],
})
export class LecturerTimetableComponent implements OnInit {

  printUrl = 'https://api.apiit.edu.my/timetable-print/index.php';

  @Input() id: string;
  @Input() code: string;

  timetables$: Observable<MappedLecturerTimetable[]>;
  skeleton = new Array(3);
  currentWeek: Date;
  // GPS counts weeks with January 1, 1980 as first Sunday (Epoch)
  // new Date('1980-01-06').getTime() - new Date().getTimezoneOffset() * 60 * 1000
  lastDateOfWeekZero = 315993600000;
  secondsPerWeek = 604800000;  // 7 * 24 * 60 * 60 * 1000
  secondsPerDay = 86400000;  // 24 * 60 * 60 * 1000

  constructor(
    private config: ConfigurationsService,
    private api: ApiService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.currentWeek = this.config.currentWeek.startWeek;

    this.timetables$ = this.api.getLecturerTimetable(this.id, this.lastDateOfWeekZero, this.secondsPerWeek, this.secondsPerDay).pipe(
      tap(tt => console.log('Timetable: ', tt))
    );
  }

  openStudentTimetable(intake: string) {
    // TODO: Route to Student Timetable and pass the intake
    console.log(intake);
  }

  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  printSelectedWeek(date: Date) {
    const selectedWeek = new Date(date);
    selectedWeek.setDate(selectedWeek.getDate() + 1);

    const formattedWeek = formatISO(selectedWeek, { representation: 'date' });
    const fullUrl = `${this.printUrl}?LectID=${this.code}&Submit=Submit&Week=${formattedWeek}&print_request=print`;

    this.component.openLink(fullUrl);
  }
}
