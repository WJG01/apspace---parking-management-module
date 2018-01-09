import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController, ModalController,
  Content } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { catchError, finalize, tap } from 'rxjs/operators';

import { StaffDirectory } from '../../interfaces/staff-directory';
import { StaffDirectoryProvider } from '../../providers/staff-directory/staff-directory';
import { Timetable } from '../../interfaces/timetable';
import { TimetableProvider } from '../../providers/timetable/timetable';

@IonicPage()
@Component({
  selector: 'page-timetable',
  templateUrl: 'timetable.html',
})
export class TimetablePage {

  timetable$: Observable<Timetable[]>;
  staff$: Observable<StaffDirectory[]>;
  staff = [] as StaffDirectory[];
  colors: string[];
  selectedDay: string;

  wday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  @ViewChild(Content) content: Content;

  /* config */
  intake: string = 'UC1F1705CS(DA)';

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private sd: StaffDirectoryProvider,
    private tt: TimetableProvider,
  ) { }

  /** Set the data with TimetableConfPage */
  confPage(): void {
    let conf = this.modalCtrl.create('TimetableConfPage', { intake: this.intake });
    conf.onDidDismiss(data => {
      if (this.intake !== data['intake']) {
        this.intake = data['intake'];
        this.timetable$.subscribe(tt => this.updateDay(tt));
      }
    });
    conf.present();
  }

  /** TODO: Get staff from timetable */
  getStaff(t: Timetable): Observable<StaffDirectory> {
    return this.sd.getStaffDirectory().map(ss => ss.find(s => s.ID === t.LECTID));
    // console.log(this.staff.length);
    // return this.staff.find(s => s.ID === t.LECTID);
      // let s = this.staff$.map(ss => {
      //   console.log(ss.length);
      //   return ss.find(s => s.ID === t.LECTID)
      // });
    // return this.staff.length ? this.staff.find(s => s.ID === t.LECTID).FULLNAME : '';
  }

  /** Get all classes for student. */
  classes(tt: Timetable[]): Timetable[] {
    if (tt) {
      return this.intake ? tt.filter(t => this.intake === t.INTAKE) : tt;
    }
    return [] as Timetable[];
  }

  /** Select the classes of the day. */
  theday(tt: Timetable[]): Timetable[] {
    return this.classes(tt).filter(t => t.DAY === this.selectedDay);
  }

  /** Get days in week of the classes. */
  schoolDays(tt: Timetable[]): string[] {
    let days = this.classes(tt).map(t => t.DAY);
    return this.wday.filter(d => days.indexOf(d) !== -1);
  }

  /** Update selected day in segment and style when day change. */
  updateDay(tt: Timetable[]): void {
    let days = this.schoolDays(tt);
    if (!this.selectedDay || days.indexOf(this.selectedDay) === -1) {
      this.selectedDay = days.shift();
    }
    this.content.resize();
  }

  strToColor(s: string): string {
    let hash = 0;
    s.split('').forEach(c => hash = c.charCodeAt(0) + ((hash << 5) - hash));
    return '#' + [1,2,3].map(i => ('00' + (hash >> (i * 8) & 0xFF).toString(16))
                                  .substr(-2)).join('');
  }

  doRefresh(refresher) {
    let t = this.toastCtrl.create({ message: 'Request fail', duration: 3000 });
    this.timetable$ = this.tt.getTimetable(true).pipe(
      tap(tt => this.updateDay(tt)),
      catchError(err => t.present(err)),
      finalize(() => refresher.complete()),
    );
  }

  ionViewDidLoad() {
    this.staff$ = this.sd.getStaffDirectory();
    this.staff$.subscribe(staff => this.staff = staff);
    this.timetable$ = this.tt.getTimetable().pipe(tap(tt => this.updateDay(tt)));
  }

}
