import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAssessmentTypesPageRoutingModule } from './manage-assessment-types-routing.module';

import { ManageAssessmentTypesPage } from './manage-assessment-types.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ManageAssessmentTypesPageRoutingModule,
        ComponentsModule
    ],
  declarations: [ManageAssessmentTypesPage]
})
export class ManageAssessmentTypesPageModule {}
