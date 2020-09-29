import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';

import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-add-new-student',
  templateUrl: './add-new-student.component.html',
  styleUrls: ['./add-new-student.component.scss'],
})
export class AddNewStudentComponent implements OnInit {

  loading: HTMLIonLoadingElement;
  url = 'https://gv8ap4lfw5.execute-api.ap-southeast-1.amazonaws.com/dev';
  csvValue;
  results;
  displayResult = false;

  constructor(
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private ws: WsApiService
  ) { }

  ngOnInit() { }

  submit() {
    const splitedCsvValue = this.csvValue.split('\n');
    const newStudents = {
      orientation: []
    };

    splitedCsvValue.forEach(student => {
      if (student) {
        const splitedStudentStaffID = student.split(/[\t, ,]+/);

        newStudents.orientation.push(
          {
            staff_id: splitedStudentStaffID[0].trim(),
            student_id: splitedStudentStaffID[1].trim()
          }
        );
      }
    });

    this.presentLoading();
    this.ws.post('/orientation/upload_file', { url: this.url, body: newStudents }).subscribe({
      next: (value) => {
        this.results = value;
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        this.dismissLoading();
        Array.isArray(this.results) ? this.displayResult = false : this.displayResult = true;
      }
    });
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true,
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}

