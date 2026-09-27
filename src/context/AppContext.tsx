import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  LungSoundRecording,
  AlertItem,
  DeviceItem,
  DoctorProfile,
  LungSoundType,
  PatientVisit,
  VisitRecording,
} from '../types/respi';
import {
  initialDoctorProfile,
  initialPatients,
  initialRecordings,
  initialAlerts,
  initialDevices,
} from '../data/mockData';
import { stethoscopeAudio } from '../utils/audioPlayer';

export type AppRoute =
  | 'dashboard'
  | 'patients'
  | 'patient-detail'
  | 'recordings'
  | 'recording-analysis'
  | 'visit-workspace'
  | 'visit-detail'
  | 'alerts'
  | 'devices'
  | 'settings'
  | 'login';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeRecordingId: string | null;
  volume: number;
}

interface AppContextType {
  currentRoute: AppRoute;
  selectedPatientId: string;
  selectedRecordingId: string;
  selectedVisitId: string | null;
  activeVisit: PatientVisit | null;
  isStartVisitModalOpen: boolean;
  patients: Patient[];
  recordings: LungSoundRecording[];
  alerts: AlertItem[];
  devices: DeviceItem[];
  doctorProfile: DoctorProfile;
  playbackState: PlaybackState;
  setIsStartVisitModalOpen: (open: boolean) => void;
  navigate: (route: AppRoute, opts?: { patientId?: string; recordingId?: string; visitId?: string }) => void;
  startNewVisit: (patientId: string) => void;
  createPatientAndStartVisit: (
    data: {
      name: string;
      age: number;
      gender: 'Nam' | 'Nữ';
      phone?: string;
      birthDate?: string;
      backgroundDiagnosis: string;
      initialNote?: string;
    },
    startVisitImmediately: boolean
  ) => string;
  addVisitRecording: (recording: VisitRecording) => void;
  updateVisitRecordingReview: (recordingId: string, confirmedClassification: LungSoundType, doctorNote?: string) => void;
  updateVisitNotes: (notes: string) => void;
  updateVisitSpo2: (spo2: number) => void;
  completeVisit: () => void;
  cancelVisit: () => void;
  viewVisitDetail: (patientId: string, visitId: string) => void;
  updatePatientDiagnosis: (patientId: string, newDiagnosis: string) => void;
  addDoctorNote: (patientId: string, noteContent: string) => void;
  confirmRecordingReview: (recordingId: string, confirmedClassification?: LungSoundType, doctorNote?: string) => void;
  updateCycleClassification: (recordingId: string, cycleId: string, newClassification: LungSoundType) => void;
  markAlertRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  updateDoctorProfile: (profile: Partial<DoctorProfile>) => void;
  playRecording: (recording: LungSoundRecording | VisitRecording) => void;
  pausePlayback: () => void;
  seekPlayback: (time: number) => void;
  setVolume: (vol: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-001');
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>('REC-001');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [activeVisit, setActiveVisit] = useState<PatientVisit | null>(null);
  const [isStartVisitModalOpen, setIsStartVisitModalOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('respicare_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [recordings, setRecordings] = useState<LungSoundRecording[]>(() => {
    const saved = localStorage.getItem('respicare_recordings');
    return saved ? JSON.parse(saved) : initialRecordings;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('respicare_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [devices] = useState<DeviceItem[]>(initialDevices);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(initialDoctorProfile);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 24.6,
    activeRecordingId: null,
    volume: 0.8,
  });

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('respicare_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('respicare_recordings', JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem('respicare_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const navigate = (
    route: AppRoute,
    opts?: { patientId?: string; recordingId?: string; visitId?: string }
  ) => {
    if (opts?.patientId) setSelectedPatientId(opts.patientId);
    if (opts?.recordingId) setSelectedRecordingId(opts.recordingId);
    if (opts?.visitId) setSelectedVisitId(opts.visitId);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- START VISIT FLOW ---
  const startNewVisit = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newVisit: PatientVisit = {
      id: `VISIT-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientCode: patient.code,
      doctorName: doctorProfile.name,
      startedAt: formattedDate,
      status: 'in_progress',
      currentSpo2: patient.currentSpo2 || 94,
      spo2Status: patient.spo2Status || 'normal',
      spo2Trend: [patient.currentSpo2 || 94],
      spo2DeviceId: 'SPO2-001',
      stethoDeviceId: 'STETHO-001',
      recordings: [],
      notes: '',
    };

    setActiveVisit(newVisit);
    setSelectedPatientId(patient.id);
    setIsStartVisitModalOpen(false);
    navigate('visit-workspace', { patientId: patient.id });
  };

  const createPatientAndStartVisit = (
    data: {
      name: string;
      age: number;
      gender: 'Nam' | 'Nữ';
      phone?: string;
      birthDate?: string;
      backgroundDiagnosis: string;
      initialNote?: string;
    },
    startVisitImmediately: boolean
  ): string => {
    const nextNum = patients.length + 1;
    const newId = `PAT-${nextNum.toString().padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newPatient: Patient = {
      id: newId,
      code: newId,
      name: data.name.trim(),
      age: Number(data.age) || 45,
      gender: data.gender,
      birthDate: data.birthDate,
      phone: data.phone,
      backgroundDiagnosis: data.backgroundDiagnosis.trim() || 'Chưa ghi nhận',
      diagnosisNote: 'Do bác sĩ ghi nhận',
      currentSpo2: 95,
      spo2Status: 'normal',
      latestSoundResult: 'Normal',
      soundConfidence: 90,
      needsAttention: false,
      latestRecordingId: '',
      assignedDoctor: doctorProfile.name,
      spo2Stats: {
        current: 95,
        average: 95,
        highest: 96,
        lowest: 94,
      },
      spo2History24h: [
        { time: `${now.getHours()}:00`, value: 95, status: 'normal' },
      ],
      doctorNotes: data.initialNote
        ? [
            {
              id: `dn-${Date.now()}`,
              date: formattedDate,
              doctorName: doctorProfile.name,
              content: data.initialNote.trim(),
            },
          ]
        : [],
      visits: [],
    };

    setPatients((prev) => [newPatient, ...prev]);
    setIsStartVisitModalOpen(false);

    if (startVisitImmediately) {
      startNewVisit(newPatient.id);
    } else {
      navigate('patient-detail', { patientId: newPatient.id });
    }

    return newPatient.id;
  };

  const addVisitRecording = (recording: VisitRecording) => {
    if (!activeVisit) return;

    setActiveVisit((prev) => {
      if (!prev) return prev;
      const updatedRecordings = [recording, ...prev.recordings];
      return {
        ...prev,
        recordings: updatedRecordings,
        status: updatedRecordings.some((r) => r.status === 'pending_review')
          ? 'pending_ai_review'
          : prev.status,
      };
    });

    // Also catalog in global recordings list
    const newGlobalRec: LungSoundRecording = {
      id: recording.id,
      patientId: activeVisit.patientId,
      patientName: activeVisit.patientName,
      patientCode: activeVisit.patientCode,
      recordedAt: recording.recordedAt,
      timestamp: new Date().toISOString(),
      position: recording.position,
      durationSeconds: recording.durationSeconds,
      totalCycles: recording.totalCycles,
      aiClassification: recording.aiClassification,
      confidence: recording.confidence,
      cycleBreakdown: {
        normal: recording.aiClassification === 'Normal' ? recording.totalCycles : 1,
        crackles: recording.aiClassification === 'Crackles' ? recording.totalCycles - 1 : 0,
        wheezes: recording.aiClassification === 'Wheezes' ? recording.totalCycles - 1 : 0,
        both: recording.aiClassification === 'Crackles + Wheezes' ? recording.totalCycles - 1 : 0,
      },
      cycles: recording.cycles || [],
      status: recording.status,
      deviceId: recording.deviceId || 'STETHO-001',
    };

    setRecordings((prev) => [newGlobalRec, ...prev]);
  };

  const updateVisitRecordingReview = (
    recordingId: string,
    confirmedClassification: LungSoundType,
    doctorNote?: string
  ) => {
    if (!activeVisit) return;

    setActiveVisit((prev) => {
      if (!prev) return prev;
      const updated = prev.recordings.map((r) =>
        r.id === recordingId
          ? {
              ...r,
              status: 'confirmed' as const,
              doctorClassification: confirmedClassification,
              doctorNote: doctorNote || r.doctorNote,
            }
          : r
      );
      return {
        ...prev,
        recordings: updated,
        status: updated.every((r) => r.status === 'confirmed' || r.status === 'overridden')
          ? 'in_progress'
          : 'pending_ai_review',
      };
    });

    // Also sync in recordings list
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === recordingId
          ? {
              ...r,
              status: 'confirmed',
              reviewedBy: doctorProfile.name,
              reviewedAt: new Date().toLocaleTimeString('vi-VN'),
              doctorNote: doctorNote || r.doctorNote,
            }
          : r
      )
    );
  };

  const updateVisitNotes = (notes: string) => {
    setActiveVisit((prev) => (prev ? { ...prev, notes } : prev));
  };

  const updateVisitSpo2 = (spo2: number) => {
    setActiveVisit((prev) => {
      if (!prev) return prev;
      const spo2Status: 'normal' | 'low' | 'critical' =
        spo2 < 88 ? 'critical' : spo2 < 90 ? 'low' : 'normal';
      return {
        ...prev,
        currentSpo2: spo2,
        spo2Status,
        spo2Trend: [...prev.spo2Trend, spo2].slice(-10),
      };
    });
  };

  const completeVisit = () => {
    if (!activeVisit) return;

    const now = new Date();
    const formattedCompletedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Determine overall AI summary from recordings
    let overallSummary: LungSoundType = 'Normal';
    if (activeVisit.recordings.some((r) => (r.doctorClassification || r.aiClassification) === 'Crackles + Wheezes')) {
      overallSummary = 'Crackles + Wheezes';
    } else if (activeVisit.recordings.some((r) => (r.doctorClassification || r.aiClassification) === 'Crackles')) {
      overallSummary = 'Crackles';
    } else if (activeVisit.recordings.some((r) => (r.doctorClassification || r.aiClassification) === 'Wheezes')) {
      overallSummary = 'Wheezes';
    }

    const completedVisitObj: PatientVisit = {
      ...activeVisit,
      status: 'completed',
      completedAt: `${activeVisit.startedAt.split(' · ')[0]} · ${formattedCompletedTime}`,
      overallAiSummary: overallSummary,
    };

    // Update patient's visits history and latest health indicators
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== completedVisitObj.patientId) return p;

        const updatedVisits = [completedVisitObj, ...(p.visits || [])];
        const newNotes = activeVisit.notes.trim()
          ? [
              {
                id: `dn-${Date.now()}`,
                date: completedVisitObj.completedAt || activeVisit.startedAt,
                doctorName: doctorProfile.name,
                content: activeVisit.notes.trim(),
              },
              ...p.doctorNotes,
            ]
          : p.doctorNotes;

        return {
          ...p,
          currentSpo2: completedVisitObj.currentSpo2,
          spo2Status: completedVisitObj.spo2Status,
          latestSoundResult: overallSummary,
          needsAttention: completedVisitObj.spo2Status === 'low' || overallSummary !== 'Normal',
          visits: updatedVisits,
          doctorNotes: newNotes,
        };
      })
    );

    const targetPatientId = activeVisit.patientId;
    setActiveVisit(null);
    navigate('patient-detail', { patientId: targetPatientId });
  };

  const cancelVisit = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lần khám này? Dữ liệu chưa hoàn tất sẽ không được lưu.')) {
      const patientId = activeVisit?.patientId || selectedPatientId;
      setActiveVisit(null);
      navigate('patient-detail', { patientId });
    }
  };

  const viewVisitDetail = (patientId: string, visitId: string) => {
    setSelectedPatientId(patientId);
    setSelectedVisitId(visitId);
    navigate('visit-detail', { patientId, visitId });
  };

  // --- PATIENT & RECORDINGS CRUD ---
  const updatePatientDiagnosis = (patientId: string, newDiagnosis: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, backgroundDiagnosis: newDiagnosis } : p
      )
    );
  };

  const addDoctorNote = (patientId: string, content: string) => {
    if (!content.trim()) return;
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newNote = {
      id: `dn-${Date.now()}`,
      date: formatted,
      doctorName: doctorProfile.name,
      content,
    };
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, doctorNotes: [newNote, ...p.doctorNotes] } : p
      )
    );
  };

  const confirmRecordingReview = (
    recordingId: string,
    confirmedClassification?: LungSoundType,
    doctorNote?: string
  ) => {
    setRecordings((prev) =>
      prev.map((r) => {
        if (r.id !== recordingId) return r;
        const isOverridden =
          confirmedClassification && confirmedClassification !== r.aiClassification;
        return {
          ...r,
          status: isOverridden ? 'overridden' : 'confirmed',
          aiClassification: confirmedClassification || r.aiClassification,
          doctorNote: doctorNote !== undefined ? doctorNote : r.doctorNote,
          reviewedBy: doctorProfile.name,
          reviewedAt: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      })
    );
  };

  const updateCycleClassification = (
    recordingId: string,
    cycleId: string,
    newClassification: LungSoundType
  ) => {
    setRecordings((prev) =>
      prev.map((r) => {
        if (r.id !== recordingId) return r;
        const updatedCycles = r.cycles.map((c) =>
          c.id === cycleId
            ? {
                ...c,
                classification: newClassification,
                doctorClassification: newClassification,
                doctorConfirmed: true,
              }
            : c
        );
        return {
          ...r,
          cycles: updatedCycles,
        };
      })
    );
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isUnread: false } : a))
    );
  };

  const clearAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isUnread: false })));
  };

  const updateDoctorProfile = (profile: Partial<DoctorProfile>) => {
    setDoctorProfile((prev) => ({ ...prev, ...profile }));
  };

  // --- AUDIO SIMULATOR CONTROLS ---
  const playRecording = (recording: LungSoundRecording | VisitRecording) => {
    const classification = recording.aiClassification;
    stethoscopeAudio.play(
      classification,
      recording.durationSeconds,
      (time) => {
        setPlaybackState((prev) => ({ ...prev, currentTime: time }));
      },
      () => {
        setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      }
    );

    setPlaybackState({
      isPlaying: true,
      currentTime: 0,
      duration: recording.durationSeconds,
      activeRecordingId: recording.id,
      volume: playbackState.volume,
    });
  };

  const pausePlayback = () => {
    stethoscopeAudio.pause();
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  };

  const seekPlayback = (time: number) => {
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
  };

  const setVolume = (vol: number) => {
    stethoscopeAudio.setVolume(vol);
    setPlaybackState((prev) => ({ ...prev, volume: vol }));
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        selectedPatientId,
        selectedRecordingId,
        selectedVisitId,
        activeVisit,
        isStartVisitModalOpen,
        patients,
        recordings,
        alerts,
        devices,
        doctorProfile,
        playbackState,
        setIsStartVisitModalOpen,
        navigate,
        startNewVisit,
        createPatientAndStartVisit,
        addVisitRecording,
        updateVisitRecordingReview,
        updateVisitNotes,
        updateVisitSpo2,
        completeVisit,
        cancelVisit,
        viewVisitDetail,
        updatePatientDiagnosis,
        addDoctorNote,
        confirmRecordingReview,
        updateCycleClassification,
        markAlertRead,
        clearAllAlerts,
        updateDoctorProfile,
        playRecording,
        pausePlayback,
        seekPlayback,
        setVolume,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
