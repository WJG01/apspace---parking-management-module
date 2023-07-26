/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { parkingPositions } from './parkingspot-pinpoint-position';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-parking-map',
  templateUrl: './parking-map.page.html',
  styleUrls: ['./parking-map.page.scss'],
})
export class ParkingMapPage implements OnInit {

  chosenParkingZone = '';
  chosenParkingSpot = '';

  locations = [
    { key: 'APU-A', value: 'Zone A - APU' },
    { key: 'APU-B', value: 'Zone B - APU' },
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  pinpointTop: number;
  pinpointLeft: number;
  isCapacitor: boolean;

  constructor(
    public plt: Platform,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.isCapacitor = this.plt.is('capacitor');

    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length !== 0) {
        const paramLocation = params['location'];
        const paramParkingSpotId = params['parkingspotid'];

        this.chosenParkingZone = this.locations.find((location) => location.key === paramLocation).value;;
        this.chosenParkingSpot = paramParkingSpotId;
        this.getImageByLocation(this.chosenParkingZone);
        this.showParkingSpot();
      }
    });
  }

  showParkingSpot() {
    //const viewType = this.isCapacitor ? 'Mobile' : 'Desktop';
    const viewType = 'Mobile';
    const parkinglocationType = this.locations.find((location) => location.value === this.chosenParkingZone).key;
    const parkingspot = this.chosenParkingSpot;

    console.log('what spot is chosen', parkingspot);
    const filteredSpots = parkingPositions
      .filter(position => position.viewType === viewType)
      .map(position => position.parkinglocationtype)
      .flat();

    console.log('Filtered spots after first .flat():', filteredSpots);

    const filteredLocations = filteredSpots
      .filter(location => location.parkinglocation === parkinglocationType)
      .map(location => location.spots)
      .flat();

    console.log('Filtered locations after second .flat():', filteredLocations);

    const filteredSpotsByID = filteredLocations
      .filter(spot => spot.parkingspotid === parkingspot);

    console.log('Filtered spots by ID:', filteredSpotsByID);

    if (filteredSpotsByID.length > 0) {
      const spot = filteredSpotsByID[0]; // Assuming we only need the first spot

      this.pinpointTop = spot.top;
      this.pinpointLeft = spot.left;
    } else {
      // Handle case when no matching spots found
    }
  }

  getImageByLocation(location: string): string {
    // Find the location object based on the chosenParkingZone
    const selectedLocation = this.locations.find(l => l.value === location);

    // Construct the image source based on the value of the selected location
    return selectedLocation ? `assets/img/${selectedLocation.value}.jpg` : '';
  }

  generateNumberOptions(): string[] {
    return Array.from({ length: 20 }, (_, index) => (index + 1).toString().padStart(2, '0'));
  }

}
