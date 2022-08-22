import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map, Observable, tap, finalize } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { add } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';

import { ConsultationHour, ConsultationSlot, MappedSlots } from '../../../../interfaces';
import { WsApiService } from '../../../../services';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';
import { SlotDetailsModalPage } from '../../slot-details-modal/slot-details-modal.page';

@Component({
  selector: 'app-consultations',
  templateUrl: './consultations.page.html',
  styleUrls: ['./consultations.page.scss'],
})
export class ConsultationsPage implements OnInit {

  slots$: Observable<MappedSlots[]>;
  summary: { availableSlots: number, bookedSlots: number };
  daysConfigurations: DayConfig[] = []; // ion-calendar plugin
  options: CalendarComponentOptions = {
    from: new Date(),
    to: null, // null to disable all calendar button. Days configurations will enable only dates with slots
    daysConfig: this.daysConfigurations
  };
  selectedDate = this.dateWithTimezonePipe.transform(new Date(), 'yyyy-MM-dd'); // Default to todays date
  skeleton = new Array(3);
  // for select multiple slots to cancel
  dateRange: { from: string; to: string; };
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: add(new Date(this.selectedDate), { days: 1 }),
    to: add(new Date(this.selectedDate), { days: 1, months: 12 }),
    disableWeeks: [0] // Disable Sundays
  };
  deleteMode: boolean; // Allow staffs to delete slots
  rangeMode: boolean; // Determine if the ion-calendar is normal or range mode
  slotsToBeCancelled: ConsultationSlot[] = [];

  constructor(
    private ws: WsApiService,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.reload) {
      // Reload page when new slots are created
      this.daysConfigurations = [];
      this.doRefresh();
    }
    this.doRefresh();
  }

  doRefresh(ev?) {
    // Used here to calculate the number again after refresh
    this.summary = { availableSlots: 0, bookedSlots: 0 };

    this.options = {
      from: new Date(),
      to: null, // null to disable all calendar button. Days configurations will enable only dates with slots
      daysConfig: this.daysConfigurations
    };

    this.slots$ = forkJoin([this.ws.get<ConsultationSlot[]>('/iconsult/slots'), this.ws.get<ConsultationHour[]>('/iconsult/bookings')])
      .pipe(
        map(([slots, bookings]) => {
          const slotsPerDate = slots.reduce((r, a) => {
            // Grouping the slots daily and get the summary data
            if (a.status !== 'Cancelled' && a.status !== 'Cancelled by lecturer') {
              if (a.status === 'Booked') {
                this.summary.bookedSlots++;
              }

              if (a.status === 'Available' || a.status === 'Cancelled by student') {
                this.summary.availableSlots++;
              }

              const getBooking = bookings.filter(data => data.status === 'Booked' && a.slot_id === data.slot_id);
              if (getBooking.length > 0) {
                a.booking_detail = getBooking[0];
              }

              const consultationsDate = this.dateWithTimezonePipe.transform(a.start_time, 'yyyy-MM-dd');
              r[consultationsDate] = r[consultationsDate] || {};
              r[consultationsDate].items = r[consultationsDate].items || [];
              r[consultationsDate].items.push(a);
            }
            return r;
          }, {});

          return Object.keys(slotsPerDate).map(date => ({ date, slots: slotsPerDate[date].items as ConsultationSlot[] }));
        }),
        tap(slots => {
          // Add css classes for slot type
          slots.forEach(slot => {
            const items = slot.slots;
            const numberOfAvailableAndBookedSlots = items.filter(item => item.status === 'Available' || item.status === 'Booked').length;
            const numberOfBookedSlots = items.filter(item => item.status === 'Booked').length;
            const cssClass = numberOfAvailableAndBookedSlots === numberOfBookedSlots && numberOfBookedSlots > 0 ? 'booked' : numberOfBookedSlots > 0 ? 'partially-booked' : numberOfBookedSlots === 0 && numberOfAvailableAndBookedSlots !== 0 ? 'available' : null;

            this.daysConfigurations.push({
              date: new Date(slot.date),
              subTitle: '',
              cssClass: cssClass,
              disable: false
            });
          });
        }),
        finalize(() => {
          if (ev) {
            ev.target.complete();
          }
        })
      );
  }

  async slotDetails(staffBooking: ConsultationSlot) {
    if (staffBooking.status === 'Available') return; // Ignore if slot is not booked

    const modal = await this.modalCtrl.create({
      component: SlotDetailsModalPage,
      componentProps: {
        staffBooking
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.completed) {
      this.doRefresh(true);
    }
  }

  toggleCancelSlot() {
    this.deleteMode = !this.deleteMode;

    if (this.rangeMode === true) {
      this.rangeMode = false;
    }
  }

  getSelectedRangeSlot(dates: MappedSlots[]) {
    if (!this.rangeMode) return; // Ignore if range mode is false

    this.slotsToBeCancelled = []; // Ensure array is empty before pushing new items
    const startDate = new Date(this.dateRange.from);
    const endDate = new Date(this.dateRange.to);

    for (const date of dates) {
      if (startDate <= new Date(date.date) && new Date(date.date) <= endDate) {
        for (const slot of date.slots) {
          // only push the slots that is not passed or within 24 hours slots.
          if (!(new Date(this.dateWithTimezonePipe.transform(slot.start_time, 'medium'))
            <= add(new Date(), { hours: 24 }))) {
            this.slotsToBeCancelled.push(slot);
          }
        }
      }
    }
  }

  getSelectedSlot(slot: ConsultationSlot) {
    if (!(this.slotsToBeCancelled.find(slotTBC => slotTBC.slot_id === slot.slot_id))) {
      this.slotsToBeCancelled.push(slot);
    } else {
      this.slotsToBeCancelled.forEach((slotTBC, index, slotsToBeCancelled) => {
        if (slotTBC.slot_id === slot.slot_id) {
          slotsToBeCancelled.splice(index, 1);
        }
      });
    }
  }

  removeRangeSelectedSlot(i: number) {
    this.slotsToBeCancelled.splice(i, 1);
  }

  resetSelectedSlots(dates: MappedSlots[]) {
    if (!this.rangeMode) {
      dates.forEach(datesKey => datesKey.slots.forEach(item => delete item.isChecked));
    }
    this.slotsToBeCancelled = [];
  }

  cancelAvailableSlot() {
    if (this.slotsToBeCancelled.length < 1) return;

    if (this.slotsToBeCancelled.length > 1) {
      console.log('Show Modal');
    } else {
      console.log('Show Alert');
    }
  }

  addSlots() {
    this.router.navigateByUrl('/iconsult/add-free-slot');
  }
}
