import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parking-map',
  templateUrl: './parking-map.page.html',
  styleUrls: ['./parking-map.page.scss'],
})
export class ParkingMapPage implements OnInit {

  chosenParkingZone = '';

  locations = [
    { key: 'APU-A', value: 'Zone A - APU' },
    { key: 'APU-B', value: 'Zone B - APU' },
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  pinpointTop: number;
  pinpointLeft: number;

  constructor() { }

  ngOnInit() {
    this.pinpointTop = 35;
    this.pinpointLeft = 638;
  }

  changeMap() {

  }

  getImageByLocation(location: string): string {
    // Find the location object based on the chosenParkingZone
    const selectedLocation = this.locations.find(l => l.value === location);

    // Construct the image source based on the value of the selected location
    return selectedLocation ? `assets/img/${selectedLocation.value}.jpg` : '';
  }

}
