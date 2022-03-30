import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'not-found-card',
  templateUrl: './not-found-card.component.html',
  styleUrls: ['./not-found-card.component.scss'],
})
export class NotFoundCardComponent {

  @Input() imageUrl: string;
  @Input() headerText: string;
  @Input() descriptionText: string;

  constructor(private router: Router) { }

  openPage(url: string) {
    this.router.navigateByUrl(url, { replaceUrl: true });
  }
}
