/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ParkingIncidentService } from 'src/app/services/parking-incident.service';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';
import { ComponentService } from 'src/app/services';
import { AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-parking-incident',
  templateUrl: './parking-incident.page.html',
  styleUrls: ['./parking-incident.page.scss'],
})
export class ParkingIncidentPage implements OnInit {

  loading: HTMLIonLoadingElement;
  imageValid: boolean = true;
  incidentForm: UntypedFormGroup;
  images: { name: string; file: File; data: any; }[] = [];
  currentLoginUserID = '';

  constructor(
    private fb: UntypedFormBuilder,
    private pIS: ParkingIncidentService,
    private storage: Storage,
    private component: ComponentService,
    private loadingCtrl: LoadingController,


  ) { }

  ngOnInit() {
    this.incidentForm = this.fb.group({
      message: ['', [Validators.required]],
    });
    this.getUserData();
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
      console.log('Current User is ', this.currentLoginUserID);
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        // Invalid file type
        this.imageValid = false;
        return;
      }
      this.imageValid = true;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = {
          name: file.name,
          file: file,
          data: e.target.result
        };
        this.images.push(imageData);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(image: { name: string; file: File; data: any; }) {
    const index = this.images.indexOf(image);
    if (index > -1) {
      this.images.splice(index, 1);
    }
  }

  submit() {

    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');

    const formattedDateTime = datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss');


    const timestamp = new Date().getTime();
    const headers = { 'Content-Type': 'application/json' };

    const imageList = this.images.length > 0 ? this.images.map((image, index) => {
      const base64Data = image.data.split(',')[1]; // Extract the base64 data from the data URL
      const fileName = image.name + '_' + timestamp; // Use the real name of the image
      return {
        name: fileName,
        data: base64Data
      };
    }) : [];

    const body = JSON.stringify({
      description: this.incidentForm.value.message,
      reporteddatetime: formattedDateTime,
      userreported: this.currentLoginUserID,
      images: imageList
    });

    if (body) {
      this.presentLoading();
      this.pIS.createIncidentReport(body, headers).subscribe(async (response) => {

        console.log(response);

        if (response.statusCode === 200) {
          this.dismissLoading();
          this.component.toastMessage('Successfully submitted your incident report!', 'success');

          // Clear the message form and image list
          this.incidentForm.get('message').reset();
          this.images = [];
        } else {
          this.dismissLoading();
          this.component.toastMessage('Failed to submit your incident report !', 'danger');
          console.log('Error creating incident report:', response.body);
        }
      });
    }


  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 20000,
      message: 'Loading ...',
      translucent: true,
      animated: true
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      return await this.loading.dismiss();
    }
  }

}
