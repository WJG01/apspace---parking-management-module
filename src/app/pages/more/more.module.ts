import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MorePageRoutingModule } from './more-routing.module';
import { MorePage } from './more.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { ByGroupPipe } from './by-group/by-group.pipe';
import { ItemInFavPipe } from './item-in-fav/item-in-fav.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MorePageRoutingModule,
    SharedPipesModule,
    ComponentsModule
  ],
  declarations: [
    MorePage,
    ByGroupPipe,
    ItemInFavPipe
  ]
})
export class MorePageModule { }
