import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {

  constructor(private router: Router) { }

  get logoType(): string {
    // TODO: Check this when app settings is completed
    const autoDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (autoDark) return 'assets/icon/apspace-white.svg';

    return 'assets/icon/apspace-black.svg';
  }

  get comingFromTabs(): boolean {
    if (this.router.url.split('/')[1].split('/')[0] === 'tabs') {
      return true;
    }
    return false;
  }
}
