import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewsPageRoutingModule } from './news-routing.module';

import { NewsPage } from './news.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { LoginPageModule } from '../login/login.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewsPageRoutingModule,
    SharedPipesModule,
    ComponentsModule,
    LoginPageModule
  ],
  declarations: [NewsPage]
})
export class NewsPageModule {}
