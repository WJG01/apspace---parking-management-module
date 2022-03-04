import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { CasTicketService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class DeauthGuard implements CanActivate {

  constructor(
    private cas: CasTicketService,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean | UrlTree> {
    if (await this.cas.isAuthenticated()) {
      return this.router.createUrlTree(['/']);
    }
    return true;
  }
}
