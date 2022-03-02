import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {

  constructor() { }

  get logoType(): string {
    // TODO: Check this when app settings is completed
    const autoDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (autoDark) return 'assets/icon/apspace-white.svg';

    return 'assets/icon/apspace-black.svg';
  }
}
