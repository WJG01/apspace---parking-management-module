export interface QuixCustomer {
  company_departments: CustomerDepartment[];
  company_id: string;
  company_name: string;
  customer_type: string;
  lastModified: string;
}

interface CustomerDepartment {
  dept_email: string;
  dept_icon: string;
  dept_icon_color: string;
  dept_id: string;
  dept_name: string;
  dept_phone: string[];
  shifts: Shifts;
}

interface Shifts {
  'Mon-Thu': Slot[];
  Fri: Slot[];
  Sat: Slot[];
}

interface Slot {
  start_time: string;
  end_time: string;
}
