import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { format } from 'date-fns';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {

  @Input() presentationMode: string;
  @Input() minDate: string = format(new Date(), 'yyyy-MM-dd');
  @Input() maxDate?: string;
  @Input() selected?: string;
  @Input() hourValues?: string[];

  constructor(private modalCtrl: ModalController) { }

  dateChanged(selectDate: string) {
    if (this.presentationMode === 'month-year') {
      this.modalCtrl.dismiss({ month: format(new Date(selectDate), 'MMMM yyyy') });
    } else if (this.presentationMode === 'date') {
      this.modalCtrl.dismiss({ date: format(new Date(selectDate), 'yyyy-MM-dd') });
    } else if (this.presentationMode === 'time') {
      this.modalCtrl.dismiss({ selected: this.selected, time: format(new Date(selectDate), 'HH:mm') });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
