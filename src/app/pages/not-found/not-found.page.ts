import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
})
export class NotFoundPage {

  constructor(private router: Router) { }

  openPage(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
