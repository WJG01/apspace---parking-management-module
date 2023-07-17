/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ParkingIncidentService } from 'src/app/services/parking-incident.service';

@Component({
  selector: 'app-parking-incident',
  templateUrl: './parking-incident.page.html',
  styleUrls: ['./parking-incident.page.scss'],
})
export class ParkingIncidentPage implements OnInit {

  imageValid: boolean = true;
  incidentForm: UntypedFormGroup;
  images: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private pIS: ParkingIncidentService,

  ) { }

  ngOnInit() {
    this.incidentForm = this.fb.group({
      message: ['', [Validators.required]],
    });
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
        this.images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(image: string) {
    const index = this.images.indexOf(image);
    if (index > -1) {
      this.images.splice(index, 1);
    }
  }

  submit() {
    if (this.images.length > 0) {
      const headers = { 'Content-Type': 'application/json' };

      const imageList = this.images.map((image, index) => ({
        name: `image${index}.jpg`,
        data: image.split(',')[1] // Extract the base64 data from the data URL
      }));

      const body = JSON.stringify({ images: imageList });

      if (body) {
        this.pIS.uploadIncidentImages(body, headers).subscribe(r =>
          console.log(r)
        );
      }

      // Specify API endpoint that connects with the Lambda function to handle upload images to S3
      // const endpoint = "/prod/upload-images";
      // const url = "https://o2qzi0a049.execute-api.us-east-1.amazonaws.com";
      // const response$ = this.ws.post(endpoint, {
      //   "url": url,
      //   body: body,
      //   timeout: 30000,
      //   headers: headers
      // });
      // response$.subscribe(r => console.log(r));
    } else {
      console.log('No Images found');
    }
  }



}
