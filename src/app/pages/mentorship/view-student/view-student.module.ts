import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewStudentPageRoutingModule } from './view-student-routing.module';

import { ViewStudentPage } from './view-student.page';
import { FilterPipe } from './pipes/filter.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';
import { ComponentsModule } from '../../../components/components.module';
import { EditRemarksModalPage } from './edit-remarks-modal/edit-remarks-modal.page';
import { AddRemarksModalPage } from './add-remarks-modal/add-remarks-modal.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ViewStudentPageRoutingModule,
        SharedPipesModule
    ],
  declarations: [ViewStudentPage, FilterPipe, SearchPipe, EditRemarksModalPage, AddRemarksModalPage]
})
export class ViewStudentPageModule {}
