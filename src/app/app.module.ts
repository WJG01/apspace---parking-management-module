import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';

import { IonicStorageModule } from '@ionic/storage-angular';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';
import { NgChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NewsModalPageModule } from './pages/news/news-modal.module';

registerLocaleData(localEn, 'en-US', localeEnExtra);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    NgChartsModule,
    NewsModalPageModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'en-US' },
    Badge
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
