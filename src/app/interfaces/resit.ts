export interface RegistrationDate {
  current_active_registration_date: ResitDate[];
  next_registration_date: ResitDate[];
}

export interface ResitDate {
  enable_date: string;
  id: number;
  referral_date: string;
  registration_end_date: string;
  registration_start_date: string;
}
