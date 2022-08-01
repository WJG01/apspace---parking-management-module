import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { WsApiService } from "./ws-api.service";
import { VersionService } from "./version.service";

@Injectable({
  providedIn: 'root'
})
export class DataCollectorService {

  constructor(
    private ws: WsApiService,
    private version: VersionService
  ) { }

  /**
   * POST: Send device info for login.
   */
  async login() {
    const device = await Device.getInfo();
    return this.ws.post<any>('/dc/login', {
      body: {
        is_virtual: device.isVirtual,
        model: device.model,
        os: device.operatingSystem,
        uuid: Device.getId(),
        app_version: this.version.name,
        wifi: 't',
      },
    });
  }

  /**
   * POST: Send device uuid on logout.
   */
  async logout() {
    return this.ws.post<any>('/dc/logout', {
      body: {
        uuid: await Device.getId(),
      },
    });
  }
}
