import { Component, Input } from '@angular/core';

import { FeesBankDraft } from '../../interfaces';

@Component({
  selector: 'fees-card',
  templateUrl: './fees-card.component.html',
  styleUrls: ['./fees-card.component.scss'],
})
export class FeesCardComponent {

  @Input() isBankdraft: boolean;
  @Input() title: string;
  @Input() dueDate: string;
  @Input() payableAmount?: number;
  @Input() totalCollected?: number;
  @Input() outstanding?: number;
  @Input() fine?: number;
  @Input() bankdraft?: FeesBankDraft;

}
