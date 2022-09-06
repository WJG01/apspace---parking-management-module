import { Component, Input } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() size?= '2px';
  @Input() textSize?: string;
  @Input() color ?= '#666666';
}
