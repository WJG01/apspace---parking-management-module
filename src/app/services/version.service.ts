import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor(
    private plt: Platform
  ) { }

  readonly version = '4.0.0';

  /** Application version name. */
  get name(): string {
    return this.version;
  }

  /** Platform name */
  get platform(): string {
    // each keyword for find needs to be tested
    if (this.plt.platforms().find(ele => ele === 'desktop')) {
      return 'browser';
    } else if (this.plt.platforms().find(ele => ele === 'android')) {
      return 'Android';
    } else if (this.plt.platforms().find(ele => ele === 'ios')) {
      return 'iOS';
    } else {
      return this.plt.platforms().toString();
    }
  }
}
