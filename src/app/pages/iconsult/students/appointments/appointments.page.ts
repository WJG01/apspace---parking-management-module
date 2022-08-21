import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { utcToZonedTime } from 'date-fns-tz';

import { ConsultationHour, StaffDirectory } from '../../../../interfaces';
import { SettingsService, WsApiService } from '../../../../services';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
})
export class AppointmentsPage implements OnInit {

  bookings$: Observable<ConsultationHour[]>;
  enableMalaysiaTimezone: boolean;
  skeleton = new Array(3);

  constructor(
    private ws: WsApiService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.settings.get$('enableMalaysiaTimezone').subscribe(data =>
      this.enableMalaysiaTimezone = data
    );
    this.doRefresh();
  }

  doRefresh() {
    const bookings$: Observable<ConsultationHour[]> = this.ws.get<ConsultationHour[]>('/iconsult/bookings').pipe(
      map(bookingList => {
        // Check if slot is passed and modify its status to passed
        return bookingList.map(bookings => {
          if (this.enableMalaysiaTimezone) {
            if (bookings.status === 'Booked' && utcToZonedTime(new Date(bookings.slot_start_time), 'Asia/Kuala_Lumpur')
              < utcToZonedTime(new Date(), 'Asia/Kuala_Lumpur')) {
              bookings.status = 'Passed';
            }
          } else {
            if (bookings.status === 'Booked' && new Date(bookings.slot_start_time)
              < new Date()) {
              bookings.status = 'Passed';
            }
          }

          return bookings;
        });
      }));
    const staffs$: Observable<StaffDirectory[]> = this.ws.get<StaffDirectory[]>('/staff/listing');

    // Combine staff details with booking
    this.bookings$ = forkJoin([bookings$, staffs$])
      .pipe(
        map(([bookings, staffList]) => {
          const staffUsernames = new Set(bookings.map(booking => booking.slot_lecturer_sam_account_name.toLowerCase()));
          const staffKeyMap = staffList
            .filter(staff => staffUsernames.has(staff.ID.toLowerCase()))
            .reduce((previous, current) => {
              previous[current.ID] = current;

              return previous;
            }, {});
          const listOfBookingWithStaffDetail = bookings.map(
            booking => ({
              ...booking,
              ...{
                staff_detail: staffKeyMap[booking.slot_lecturer_sam_account_name]
              }
            })
          );
          return listOfBookingWithStaffDetail;
        }));
  }
}
