import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AttendanceStatusPipe } from './attendance-status/attendance-status.pipe';
import { DateWithTimezonePipe } from './date-with-timezone/date-with-timezone.pipe';
import { FusePipe } from './fuse/fuse.pipe';
import { SafePipe } from './safe/safe.pipe';
import { StrToColorPipe } from './str-to-color/str-to-color.pipe';

@NgModule({
    declarations: [
      AttendanceStatusPipe,
      DateWithTimezonePipe,
      FusePipe,
      SafePipe,
      StrToColorPipe
    ],
    imports: [CommonModule],
    exports: [
      AttendanceStatusPipe,
      DateWithTimezonePipe,
      FusePipe,
      SafePipe,
      StrToColorPipe
    ]
})
export class SharedPipesModule { }
