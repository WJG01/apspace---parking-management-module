import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-searched-files-display',
  templateUrl: './searched-files-display.component.html',
  styleUrls: ['./searched-files-display.component.scss'],
})
export class SearchedFilesDisplayComponent implements OnInit {
  @Input() staffFiles: any;

  dateToFilter;
  fileToFilter;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.staffFiles);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
