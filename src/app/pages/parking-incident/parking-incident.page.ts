/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

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

  }

}
