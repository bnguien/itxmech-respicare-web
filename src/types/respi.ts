export type LungSoundType = 'Normal' | 'Crackles' | 'Wheezes' | 'Crackles + Wheezes';

export type AuscultationPosition =
  | 'Phổi phải trên'
  | 'Phổi phải giữa'
  | 'Phổi phải dưới'
  | 'Phổi trái trên'
  | 'Phổi trái dưới'
  | 'Phổi trái đáy'
  | 'Phổi phải đỉnh'
  | 'Phổi trái đỉnh'
  | 'Chưa xác định';

export interface RespiratoryCycle {
  id: string;
  cycleNumber: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  classification: LungSoundType;
  confidence: number; // 0-100
  doctorClassification?: LungSoundType;
  doctorConfirmed?: boolean;
}

export interface LungSoundRecording {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  recordedAt: string; // e.g. "27/09/2026 · 15:30"
  timestamp: string; // ISO or relative
  position: AuscultationPosition;
  durationSeconds: number;
  totalCycles: number;
  aiClassification: LungSoundType;
  confidence: number;
  cycleBreakdown: {
    normal: number;
    crackles: number;
    wheezes: number;
    both: number;
  };
  cycles: RespiratoryCycle[];
  status: 'pending_review' | 'confirmed' | 'overridden';
  doctorNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  deviceId: string;
}

export interface SpO2Reading {
  time: string; // e.g. "15:30"
  value: number; // e.g. 89
  status: 'normal' | 'low' | 'critical';
  note?: string;
}

export interface VisitRecording {
  id: string;
  position: AuscultationPosition;
  durationSeconds: number;
  totalCycles: number;
  aiClassification: LungSoundType;
  confidence: number;
  status: 'pending_review' | 'confirmed' | 'overridden';
  doctorClassification?: LungSoundType;
  doctorNote?: string;
  recordedAt: string;
  deviceId?: string;
  cycles?: RespiratoryCycle[];
}

export type VisitStatus = 'in_progress' | 'pending_ai_review' | 'completed';

export interface PatientVisit {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  startedAt: string; // e.g. "27/09/2026 · 16:20"
  completedAt?: string;
  status: VisitStatus;
  currentSpo2: number;
  spo2Status: 'normal' | 'low' | 'critical';
  spo2Trend: number[];
  spo2DeviceId: string;
  stethoDeviceId: string;
  recordings: VisitRecording[];
  notes: string;
  overallAiSummary?: string;
}

export interface Patient {
  id: string;
  code: string; // e.g. "PAT-001"
  name: string;
  age: number;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  phone?: string;
  backgroundDiagnosis: string; // e.g. "COPD" - entered by doctor
  diagnosisNote: string; // "Do bác sĩ ghi nhận"
  currentSpo2: number;
  spo2Status: 'normal' | 'low' | 'critical';
  latestSoundResult: LungSoundType;
  soundConfidence: number;
  needsAttention: boolean;
  attentionReason?: string;
  latestRecordingId: string;
  assignedDoctor: string;
  spo2History24h: SpO2Reading[];
  spo2Stats: {
    current: number;
    average: number;
    highest: number;
    lowest: number;
  };
  doctorNotes: Array<{
    id: string;
    date: string;
    doctorName: string;
    content: string;
  }>;
  visits?: PatientVisit[];
}

export interface AlertItem {
  id: string;
  patientId?: string;
  patientName?: string;
  patientCode?: string;
  type: 'spo2_low' | 'crackles' | 'wheezes' | 'both' | 'pending_review' | 'device_offline';
  message: string;
  timestamp: string; // e.g. "5 phút trước"
  isUnread: boolean;
  severity: 'critical' | 'warning' | 'info';
  targetRoute?: string;
  targetId?: string;
}

export interface DeviceItem {
  id: string;
  code: string; // e.g. "STETHO-001"
  type: 'stetho' | 'spo2';
  name: string;
  assignedPatientId: string;
  assignedPatientName: string;
  status: 'online' | 'offline';
  batteryPercent: number;
  lastActive: string;
  signalStrength: number; // 0-100
  firmwareVersion: string;
}

export interface DoctorProfile {
  name: string;
  title: string;
  department: string;
  email: string;
  hospital: string;
  activePatientsCount: number;
  pendingReviewsCount: number;
}
