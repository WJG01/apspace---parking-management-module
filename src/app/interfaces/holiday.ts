export interface Holidays {
  holidays: Holiday[];
}

export interface Holiday {
  holiday_id: number;
  holiday_name: string;
  holiday_description: string | undefined;
  holiday_start_date: string;
  holiday_end_date: string;
  holiday_people_affected: string;
}

enum PeopleAffected {
  All = 'all',
  Students = 'students',
  Staffs = 'staffs'
}

export interface HolidaysV2 {
  active: boolean;
  colors: HolidayColor[];
  holidays: HolidayV2[];
  remarks: string;
  year: number;
}

export interface HolidayColor {
  month: string;
  value: string;
}

export interface HolidayV2 {
  holiday_description: string;
  holiday_end_date: Date;
  holiday_name: string;
  holiday_people_affected: PeopleAffected;
  holiday_start_date: Date;
}
