export interface ChatMessageItem {
  role: string;
  content: string;
  time?: string;
}

export interface PatientAssignment {
  assignment_id: number;
  appointment_id: number;
  doctor_id: number;
  assigned_at: string;
  status: string;
  patient_id?: number;
  patient_name?: string;
  patient_email?: string;
  patient_department?: string;
  patient_level?: string;
  patient_reg_number?: string;
  patient_phone?: string;
  patient_blood_group?: string;
  patient_genotype?: string;
  patient_allergies?: string;
  patient_hostel?: string;
  patient_emergency_contact?: string;
  appointment_date?: string;
  appointment_status?: string;
  triage_urgency?: string;
  triage_summary?: string;
  red_flags?: string[];
  fever_duration?: string;
  recent_chat_messages?: ChatMessageItem[];
  symptom_check_id?: number;
  prescription?: string;
  clinical_notes?: string;
}

export interface DoctorShift {
  shift_id: number;
  doctor_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface DoctorOverview {
  doctor_id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  is_available: boolean;
  total_assigned: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  shifts: DoctorShift[];
}

export interface ColleagueDoctor {
  doctor_id: number;
  user_id: number;
  name?: string;
  specialization?: string;
  is_available: boolean;
}
