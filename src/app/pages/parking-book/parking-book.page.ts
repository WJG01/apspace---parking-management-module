import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatePickerComponent } from 'src/app/components/date-picker/date-picker.component';

@Component({
  selector: 'app-parking-book',
  templateUrl: './parking-book.page.html',
  styleUrls: ['./parking-book.page.scss'],
})

export class BookParkingPage implements OnInit {

  locations = [
    { key: 'APU-A', value: 'Zone A - APU' },
    { key: 'APU-B', value: 'Zone B - APU' },
    { key: 'APIIT-A', value: 'Zone A - APIIT' },
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  filterObject = {
    location: '',
    date: '',
    from: '',
    to: '',
  };

  selectedDate: string;
  showDatePickerFlag = false;


  constructor(
    private modalCtrl: ModalController,

  ) { }

  ngOnInit() {
  }


  showDatePicker() {
    this.showDatePickerFlag = true;
  }

  hideDatePicker() {
    this.showDatePickerFlag = false;
  }

  async openDatePicker(type: string) {
    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'date',
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    // Handle the returned data from the date picker modal
    if (data?.date) {
      // Update the selected date based on the returned data
      this.filterObject.date = data.date;
    }
  }

  async openPicker(type: string) {
    const hourValues = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'time',
        selected: type,
        hourValues,
        hourCycle: 'h23' // TODO: Probably show hour format based on user settings
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
      this.filterObject.to = data?.time;
    }
  }

  confirmBooking() {

  }

}
