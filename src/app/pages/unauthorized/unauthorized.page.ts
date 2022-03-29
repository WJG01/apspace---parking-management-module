import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.page.html',
  styleUrls: ['./unauthorized.page.scss'],
})
export class UnauthorizedPage {

  constructor(private router: Router) { }

  openPage(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
