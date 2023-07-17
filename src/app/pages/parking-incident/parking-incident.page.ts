/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ParkingIncidentService } from 'src/app/services/parking-incident.service';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-parking-incident',
  templateUrl: './parking-incident.page.html',
  styleUrls: ['./parking-incident.page.scss'],
})
export class ParkingIncidentPage implements OnInit {

  imageValid: boolean = true;
  incidentForm: UntypedFormGroup;
  images: { name: string; file: File; data: any; }[] = [];
  currentLoginUserID = '';

  constructor(
    private fb: UntypedFormBuilder,
    private pIS: ParkingIncidentService,
    private storage: Storage,

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

    if (this.images.length > 0) {
      const timestamp = new Date().getTime();
      const headers = { 'Content-Type': 'application/json' };

      const imageList = this.images.map((image, index) => {
        const base64Data = image.data.split(',')[1]; // Extract the base64 data from the data URL
        const fileName = image.name + '_' + timestamp; // Use the real name of the image
        return {
          name: fileName,
          data: base64Data
        };
      });

      const body = JSON.stringify({
        description: this.incidentForm.value.message,
        reporteddatetime: formattedDateTime,
        userreported: this.currentLoginUserID,
        images: imageList
      });

      if (body) {
        this.pIS.createIncidentReport(body, headers).subscribe(r =>
          console.log(r)
        );
      }
    } else {
      console.log('No Images found');
    }
  }



}
