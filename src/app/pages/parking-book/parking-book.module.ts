import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookParkingPageRoutingModule } from './parking-book-routing.module';

import { BookParkingPage } from './parking-book.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
    declarations: [BookParkingPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BookParkingPageRoutingModule,
        ComponentsModule
    ],
    schemas: [NO_ERRORS_SCHEMA] // Add the NO_ERRORS_SCHEMA here

})
export class BookParkingPageModule {}
