import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, map, Observable, tap } from 'rxjs';

import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';

import { ConsultationSlot, MappedSlots, StaffDirectory } from '../../../../interfaces';
import { WsApiService } from '../../../../services';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';

@Component({
  selector: 'app-opened-slots',
  templateUrl: './opened-slots.page.html',
  styleUrls: ['./opened-slots.page.scss'],
})
export class OpenedSlotsPage implements OnInit {

  staffId: string;
  staff$: Observable<StaffDirectory>;
  slots$: Observable<MappedSlots[]>;
  slots: MappedSlots[] = [];
  selectedDateSlots: ConsultationSlot[] = [];
  skeleton = new Array(3);
  totalAvailableSlots = -1;
  totalOpenedSlots = -1;
  // ion-calendar variables
  daysConfigurations: DayConfig[] = [];
  options: CalendarComponentOptions = {
    from: new Date(),
    to: null, // null to disable all calendar button. Days configurations will enable only dates with slots
    daysConfig: this.daysConfigurations
  };
  selectedDate = this.dateWithTimezonePipe.transform(new Date(), 'yyyy-MM-dd'); // Default to todays date

  constructor(
    private route: ActivatedRoute,
    private ws: WsApiService,
    private dateWithTimezonePipe: DateWithTimezonePipe
  ) { }

  ngOnInit() {
    this.staffId = this.route.snapshot.params.id;

    this.staff$ = this.getStaffProfile();
    this.doRefresh();
  }

  doRefresh(ev?) {
    this.options = {
      from: new Date(),
      to: null, // null to disable all calendar button. Days configurations will enable only dates with slots
      daysConfig: this.daysConfigurations
    };
    let totalAvailableSlots = 0;
    let totalOpenedSlots = 0;
    this.slots$ = this.ws.get<ConsultationSlot[]>(`/iconsult/slots?lecturer_sam_account_name=${this.staffId}`).pipe(
      map(slots => {
        const slotsPerDate = slots.reduce((r, a) => {
          this.totalOpenedSlots = ++totalOpenedSlots; // get the total number of opened slots
          this.totalAvailableSlots = a.status === 'Available' ? ++totalAvailableSlots : totalAvailableSlots;

          const consultationsDate = this.dateWithTimezonePipe.transform(a.start_time, 'yyyy-MM-dd');
          r[consultationsDate] = r[consultationsDate] || {};
          r[consultationsDate].items = r[consultationsDate].items || [];
          r[consultationsDate].items.push(a);

          return r;
        }, {});

        return Object.keys(slotsPerDate).map(date => ({ date, slots: slotsPerDate[date].items }));
      }),
      tap(dates => {
        // Ensure array is empty before pushing
        this.slots = [];
        this.selectedDateSlots = [];
        // Add css classes for slot type
        dates.forEach(slot => {
          const items = slot.slots;
          const numberOfAvailableAndBookedSlots = items.filter(item => item.status === 'Available' || item.status === 'Booked').length;
          const numberOfBookedSlots = items.filter(item => item.status === 'Booked').length;
          const cssClass = numberOfAvailableAndBookedSlots === numberOfBookedSlots && numberOfBookedSlots > 0 ? 'booked' : numberOfBookedSlots > 0 ? 'partially-booked' : numberOfBookedSlots === 0 && numberOfAvailableAndBookedSlots !== 0 ? 'available' : null;

          this.slots.push(slot); // Used for Calendar
          this.daysConfigurations.push({
            date: new Date(slot.date),
            subTitle: '',
            cssClass: cssClass,
            disable: false
          });

          // Default to show todays slots
          if (slot.date === this.selectedDate) {
            for (const s of slot.slots) {
              this.selectedDateSlots.push(s);
            }
          }
        });
      }),
      finalize(() => {
        if (ev) {
          ev.target.complete();
        }
      })
    );
  }

  calendarOnChange(ev) {
    this.selectedDateSlots = [];

    for (const slot of this.slots) {
      if (slot.date === ev) {
        for (const s of slot.slots) {
          this.selectedDateSlots.push(s);
        }
      }
    }
  }

  getStaffProfile() {
    return this.ws.get<StaffDirectory[]>('/staff/listing').pipe(
      map(listOfStaff => listOfStaff.find(staff => staff.ID === this.staffId)),
      map(staff => {
        staff.IMAGEURL = `https://d37plr7tnxt7lb.cloudfront.net/${staff.RefNo}.jpg`;

        return staff;
      })
    );
  }
}
