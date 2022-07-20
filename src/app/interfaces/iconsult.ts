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
}

export interface Venue {
  id: number;
  room_code: string;
  venue: string;
}
