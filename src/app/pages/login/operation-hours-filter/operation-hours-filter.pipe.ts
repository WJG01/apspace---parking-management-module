import { Pipe, PipeTransform } from '@angular/core';
import {QuixCustomer} from '../../../interfaces';

@Pipe({
  name: 'operationHoursFilter'
})
export class OperationHoursFilterPipe implements PipeTransform {

  transform(companies: QuixCustomer[], companyID: string): any {
    return companies.find(company => company.company_id === companyID);
  }
}
