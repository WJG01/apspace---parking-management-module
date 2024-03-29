import { StaffDirectory } from './staff';

export interface Venue {
  id: number;
  room_code: string;
  venue: string;
}

export interface ConsultationHour {
  id: number;
  additional_note: string;
  booking_datetime: string;
  consultation_with: string;
  reason: string;
  remark: string;
  status: string;
  student_name: string;
  student_sam_account_name: string;
  slot_id: number;
  slot_start_time: string;
  slot_end_time: string;
  slot_lecturer_sam_account_name: string;
  slot_room_code: string;
  slot_venue: string;
  synced_to_gims: string;
  staff_detail?: StaffDirectory; // Used to get student appointments
}

export interface MappedSlots {
  date: string;
  slots: ConsultationSlot[];
}

export interface ConsultationSlot {
  end_time: string;
  id: number;
  room_code: string;
  booking_detail?: ConsultationHour;
  slot_id: number;
  start_time: string;
  status: string;
  venue: string;
  isChecked?: boolean;
}

export interface MappedSlots {
  date: string;
  slots: ConsultationSlot[];
}

export interface AddFreeSlotBody {
  location_id: number;
  datetime: string;
}

export interface AddFreeSlotReview {
  type: string;
  startDate: string;
  endDate: string;
  repeatWeeks: number;
  repeat: string[];
  times: string[];
  venue: string;
  venueId: string;
  location: string;
}
