export interface TransixScheduleSet {
  active: boolean;
  applicable_from: Date;
  applicable_to: Date;
  default: boolean;
  id: number;
  name: string;
  trips: TransixScheduleTrip[];
}

export interface TransixScheduleTrip {
  bus_assigned: null; // TODO: Change to correct type once Bus Tracking is available
  day: string;
  id: number;
  schedule_set_id: number;
  time: string;
  trip_from: TransixLocation;
  trip_to: TransixLocation;
}

export interface TransixLocation {
  address: string;
  color: string;
  contact_number: string;
  id: number;
  latitude: string;
  longitude: string;
  name: string;
  pickup_latitude: string;
  pickup_longitude: string;
  type: string;
}

export interface TransixDashboardTiming {
  times: string[];
  trip_from: string;
  trip_from_color: string;
  trip_to: string;
  trip_to_color: string;
}

enum PeopleAffected {
  All = 'all',
  Students = 'students',
  Staffs = 'staffs'
}

export interface TransixHolidaySet {
  active: boolean;
  colors: TransixHolidayColor[];
  holidays: TransixHoliday[];
  remarks: string;
  year: number;
}

export interface TransixHolidayColor {
  month: string;
  value: string;
}

export interface TransixHoliday {
  holiday_description: string;
  holiday_end_date: Date;
  holiday_name: string;
  holiday_people_affected: PeopleAffected;
  holiday_start_date: Date;
}
