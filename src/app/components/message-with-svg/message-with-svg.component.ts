import { Component, Input } from '@angular/core';

@Component({
  selector: 'message-with-svg',
  templateUrl: './message-with-svg.component.html',
  styleUrls: ['./message-with-svg.component.scss'],
})
export class MessageWithSvgComponent {
  @Input() messageTitle: string;
  @Input() messageContent?: string;
  @Input() imageUrl?: string;
  @Input() advancedMode?= false;
  @Input() wrapperMarginTop = '0px';
  @Input() wrapperOffset: string;
  @Input() wrapperSize: string;
}
