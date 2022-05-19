import { Pipe, PipeTransform } from '@angular/core';

import { QuixCustomer } from '../../../interfaces';

@Pipe({
  name: 'filterByCompany'
})
export class FilterByCompanyPipe implements PipeTransform {
  /** Filter Company by ID */
  transform(companies: QuixCustomer[], companyId: string): QuixCustomer[] {
    console.log(companies.filter(company => company.company_id === companyId))
    return companies.filter(company => company.company_id === companyId);
  }
}
