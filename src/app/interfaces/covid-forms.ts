export interface VaccinationStatus {
  id: number;
  status: number;
  vaccination_status: string;
}

export interface VaccinationType {
  id: number;
  number_of_dose: number;
  vaccine_name: string;
}

export interface UserVaccineInfo {
  dose1_date: string;
  dose2_date: string;
  full_name: string;
  pcr_date: string;
  pcr_expiry_date: string;
  pcr_result: string;
  pcr_update_date: string;
  status_color: string;
  user_type: string;
  vaccination_status: string;
  vaccination_status_id: number;
  vaccine_type: string;
  vaccination_type_id: number;
  ispcr: boolean;
}
