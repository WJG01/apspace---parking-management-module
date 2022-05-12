import { Component, Input } from '@angular/core';
import { AlertButton, LoadingController, ModalController } from '@ionic/angular';

import { AttendanceIntegrityClasses } from '../../../../interfaces';
import { ComponentService } from '../../../../services';
import { ResetAttendanceGQL, ScheduleInput } from '../../../../../generated/graphql';

@Component({
  selector: 'app-attendance-integrity-modal',
  templateUrl: './attendance-integrity-modal.page.html',
  styleUrls: ['./attendance-integrity-modal.page.scss'],
})
export class AttendanceIntegrityModalPage {

  @Input() possibleClasses: AttendanceIntegrityClasses[];
  selectAll = false;

  recordsDeleted: AttendanceIntegrityClasses[] = [];
  recordsNotDeleted: string[] = [];

  constructor(
    private modalCtrl: ModalController,
    private component: ComponentService,
    private resetAttendance: ResetAttendanceGQL,
    private loadingCtrl: LoadingController
  ) { }

  select() {
    this.selectAll = !this.selectAll;

    if (this.selectAll) {
      this.possibleClasses.map(record => record.checked = true);
    } else {
      this.possibleClasses.map(record => record.checked = false);
    }
  }

  reset() {
    // Ensure array is empty before reset
    this.recordsDeleted = [];
    this.recordsNotDeleted = [];

    const recordsToDelete = this.possibleClasses.filter(record => record.checked);

    // Do not proceed if no records is selected
    if (recordsToDelete.length < 1) {
      this.component.toastMessage('No Records Selected!', 'warning');

      return;
    }

    const btn: AlertButton = {
      text: 'Delete',
      cssClass: 'danger',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();

        let results = recordsToDelete.reduce((promiseChain, record) => {
          return promiseChain.then(() => new Promise((resolve) => {
            this.deleteRecord(record, resolve);
          }));
        }, Promise.resolve());

        results.then(() => {
          if (recordsToDelete.length === this.recordsDeleted.length) {
            this.component.toastMessage(`${this.recordsDeleted.length} record(s) deleted successfully`, 'success');
            this.modalCtrl.dismiss({ completed: true });
          } else {
            this.component.toastMessage(`<h4>${this.recordsDeleted.length} record(s) deleted successfully and we could not delete ${this.recordsNotDeleted.length} record(s)</h4>
            <p>Records not deleted are: ${this.recordsNotDeleted.toString()}</p>`, 'danger');

            this.modalCtrl.dismiss({ completed: true });
          }
          loading.dismiss();
        });
      }
    }

    this.component.alertMessage('Delete Attendance Record(s)!', `Are you sure that you want to <span class="danger-text text-bold">Permanently Delete</span> all ${recordsToDelete.length} attendance record(s)?`, 'Cancel', btn);
  }

  deleteRecord(record: AttendanceIntegrityClasses, cb) {
    const schedule: ScheduleInput = {
      classcode: record.classCode,
      date: record.date,
      startTime: record.timeFrom,
      endTime: record.timeTo,
      classType: record.type
    };

    this.resetAttendance.mutate({ schedule }).subscribe({
      next: () => {
        this.recordsDeleted.push(record);
        this.possibleClasses = this.possibleClasses.filter(possibleRecord => !(record.classCode === possibleRecord.classCode
          && record.date === possibleRecord.date
          && record.timeFrom === possibleRecord.timeFrom
          && record.timeTo === possibleRecord.timeTo && record.type === possibleRecord.type)
        );
      },
      error: (err) => {
        this.recordsNotDeleted.push(record.classCode + ' on ' + record.date + ' (' + err + ').');
        console.error(err);
        cb();
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
