import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize, map, Observable, tap } from 'rxjs';

import { StudentTimetable } from '../../interfaces';
import { DatePickerComponent } from '../../components/date-picker/date-picker.component';
import { ClassroomTypes, Days } from '../../constants';
import { StudentTimetableService } from '../../services';

@Component({
  selector: 'app-classroom-finder',
  templateUrl: './classroom-finder.page.html',
  styleUrls: ['./classroom-finder.page.scss'],
})
export class ClassroomFinderPage implements OnInit {

  timetables$: Observable<StudentTimetable[]>;
  days = Days;
  types = ClassroomTypes;
  locations = ['APU CAMPUS', 'APIIT CAMPUS'];
  filterObject = {
    location: 'APU CAMPUS',
    day: '',
    from: '',
    to: '',
    types: ClassroomTypes.map(t => t.key)
  }
  skeleton = new Array(8);

  constructor(
    private modalCtrl: ModalController,
    private tt: StudentTimetableService
  ) { }

  ngOnInit() {
    const date = new Date();

    this.filterObject.day = this.days[(date.getDay() + 6) % 7].value;
    this.filterObject.from = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
    this.filterObject.to = `${('0' + (date.getHours() + 1)).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

    // this.doRefresh();
  }

  doRefresh(refresher?) {
    const refresh = refresher ? true : false;
    const excludeRooms = ['ONL', 'Online'];

    this.timetables$ = this.tt.get(refresh).pipe(
      tap(res => console.log(res)),
      map(data => data.filter(res => excludeRooms.every(room => !res.ROOM.includes(room)))), // Exclude Online and ONL room data
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
  }

  async openPicker(type: string) {
    const hourValues = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'time',
        selected: type,
        hourValues
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.selected === 'start') {
      const since = +data?.time.replace(':', '');
      const until = +this.filterObject.to.replace(':', '');

      if (until < since) {
        const newUntil = since + 100; // Add 1 Hour
        const hh = ('0' + Math.trunc(newUntil / 100)).slice(-2);
        const mm = ('0' + newUntil % 100).slice(-2);
        this.filterObject.to = `${hh}:${mm}`;
      }
      this.filterObject.from = data?.time;
    }

    if (data?.selected === 'to') {
      const since = +this.filterObject.from.replace(':', '');
      const until = +data.time.replace(':', '');

      if (until < since) {
        const newSince = until - 100; // Minus 1 Hour
        const hh = ('0' + Math.trunc(newSince / 100)).slice(-2);
        const mm = ('0' + newSince % 100).slice(-2);
        this.filterObject.from = `${hh}:${mm}`;
      }
    }
  }

  trackByName(value: number) {
    return value;
  }
}
