import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FusePipe } from './fuse/fuse.pipe';
import { SafePipe } from './safe/safe.pipe';

@NgModule({
    declarations: [
      FusePipe,
      SafePipe
    ],
    imports: [CommonModule],
    exports: [
      FusePipe,
      SafePipe
    ]
})
export class SharedPipesModule { }
