import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DateWithTimezonePipe } from './date-with-timezone/date-with-timezone.pipe';
import { FusePipe } from './fuse/fuse.pipe';
import { SafePipe } from './safe/safe.pipe';

@NgModule({
    declarations: [
      DateWithTimezonePipe,
      FusePipe,
      SafePipe
    ],
    imports: [CommonModule],
    exports: [
      DateWithTimezonePipe,
      FusePipe,
      SafePipe
    ]
})
export class SharedPipesModule { }
