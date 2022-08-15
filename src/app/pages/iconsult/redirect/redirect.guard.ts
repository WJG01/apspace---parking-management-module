import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Storage } from '@ionic/storage-angular';

import { Role } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {

  constructor(
    private storage: Storage,
    private router: Router
  ) { }

  async canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<UrlTree> {
    const role = await this.storage.get('role');
    // tslint:disable-next-line:no-bitwise
    const path = role & Role.Student ? 'my-appointments' : 'my-consultations';

    return this.router.createUrlTree([state.url, path]);
  }
}
