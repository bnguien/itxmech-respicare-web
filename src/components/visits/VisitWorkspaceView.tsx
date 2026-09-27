import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  ArrowLeft,
  ChevronDown,
  Check,
  Edit2,
  RefreshCw,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AuscultationPosition,
  LungSoundType,
  VisitRecording,
} from '../../types/respi';

export const VisitWorkspaceView: React.FC = () => {
  const {
    activeVisit,
    patients,
    completeVisit,
    cancelVisit,
    addVisitRecording,
    updateVisitRecordingReview,
    updateVisitNotes,
    updateVisitSpo2,
    playRecording,
    pausePlayback,
    playbackState,
    navigate,
  } = useApp();

  const patient =
    patients.find((p) => p.id === activeVisit?.patientId) || patients[0];

  const positionsSequence: AuscultationPosition[] = [
    'Phổi phải dưới',
    'Phổi trái dưới',
    'Phổi phải giữa',
    'Phổi phải trên',
    'Phổi trái trên',
  ];
  const autoPosition = activeVisit
    ? positionsSequence[activeVisit.recordings.length % positionsSequence.length]
    : 'Phổi phải dưới';

  // Automatic Digital Stethoscope Simulation State Machine
  // 1: 'waiting' -> 2: 'receiving' -> 3: 'received' -> 4: 'processing' -> 5: 'ready' -> 6: 'error'
  const [stethoState, setStethoState] = useState<
    'waiting' | 'receiving' | 'received' | 'processing' | 'ready' | 'error'
  >('waiting');
  const [receivingProgress, setReceivingProgress] = useState(0);
  const [latestTempRec, setLatestTempRec] = useState<VisitRecording | null>(null);

  // Editing recording classification modal/dropdown
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [overrideClass, setOverrideClass] = useState<LungSoundType>('Normal');
  const [overrideNote, setOverrideNote] = useState('');

  // Complete visit modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Real-time SpO2 simulation during visit
  useEffect(() => {
    if (!activeVisit) return;
    const interval = setInterval(() => {
      // Gentle realistic oscillation around patient's baseline
      const base = patient.currentSpo2 || 92;
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      const newSpo2 = Math.max(82, Math.min(100, base + variation));
      updateVisitSpo2(newSpo2);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeVisit, patient.currentSpo2]);

  if (!activeVisit) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-[#5A7799]">
          Hiện tại không có lần khám nào đang diễn ra.
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="px-4 py-2 bg-[#2F78C8] text-white text-xs font-semibold rounded-xl"
        >
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  // IoT Hardware Simulation: Digital Stethoscope placed on patient chest
  const simulateStethoscopeTouch = () => {
    if (stethoState !== 'waiting') return;

    // Transition: Receiving recording from hardware
    setStethoState('receiving');
    setReceivingProgress(0);

    const stepInterval = setInterval(() => {
      setReceivingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(stepInterval);
          // Transition: Received
          setStethoState('received');

          setTimeout(() => {
            // Transition: AI Processing
            setStethoState('processing');

            setTimeout(() => {
              // Determine simulated classification based on position and background
              let simClass: LungSoundType = 'Normal';
              let simConfidence = 91;
              const duration = 18.7;
              const totalCycles = 8;

              if (autoPosition === 'Phổi phải dưới' || autoPosition === 'Phổi trái dưới') {
                if (patient.backgroundDiagnosis.toLowerCase().includes('copd')) {
                  simClass = 'Crackles + Wheezes';
                  simConfidence = 93;
                } else if (patient.backgroundDiagnosis.toLowerCase().includes('hen')) {
                  simClass = 'Wheezes';
                  simConfidence = 90;
                } else {
                  simClass = 'Crackles';
                  simConfidence = 89;
                }
              } else if (autoPosition === 'Phổi phải giữa') {
                simClass = 'Wheezes';
                simConfidence = 87;
              }

              const newRec: VisitRecording = {
                id: `vrec-${Date.now()}`,
                position: autoPosition,
                durationSeconds: duration,
                totalCycles,
                aiClassification: simClass,
                confidence: simConfidence,
                status: 'pending_review',
                recordedAt: new Date().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                deviceId: activeVisit.stethoDeviceId,
              };

              setLatestTempRec(newRec);
              addVisitRecording(newRec);
              setStethoState('ready');
            }, 1800);
          }, 1200);

          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleResetForNextPosition = () => {
    setStethoState('waiting');
    setReceivingProgress(0);
    setLatestTempRec(null);
  };

  const unreviewedCount = activeVisit.recordings.filter(
    (r) => r.status === 'pending_review'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* ========================================================= */}
      {/* 1. VISIT HEADER                                           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7F1FB]">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={cancelVisit}
            className="p-2 text-[#5A7799] hover:text-[#173A5E] hover:bg-[#F4F8FD] rounded-xl transition-colors shrink-0"
            title="Hủy lần khám"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#2F78C8] uppercase tracking-wider">
                Lần khám mới
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold">
                {activeVisit.status === 'in_progress' ? 'Đang khám' : 'Chờ xác nhận AI'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#173A5E] tracking-tight">
                {activeVisit.patientName}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F4F8FD] text-[#5A7799] border border-[#E7F1FB]">
                {activeVisit.patientCode}
              </span>
              <span className="text-xs text-[#5A7799]">
                {patient.age} tuổi · {patient.gender}
              </span>
              <span className="text-[#9EC9F3]">·</span>
              <span className="text-xs text-[#173A5E] font-medium">
                Chẩn đoán nền: <strong>{patient.backgroundDiagnosis}</strong>
              </span>
              <span className="text-[10px] text-[#5A7799] italic">
                (Do bác sĩ ghi nhận)
              </span>
            </div>
          </div>
        </div>

        {/* Doctor & Date metadata */}
        <div className="text-left sm:text-right text-xs text-[#5A7799] pl-10 sm:pl-0">
          <p className="font-semibold text-[#173A5E]">{activeVisit.doctorName}</p>
          <div className="flex items-center sm:justify-end gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-[#9EC9F3]" />
            <span>{activeVisit.startedAt}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOCUSED 3-PART WORKSPACE LAYOUT                        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ------------------------------------------------------- */}
          {/* SECTION A: SpO2 DURING VISIT                            */}
          {/* ------------------------------------------------------- */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A5E]">SpO₂</h3>
                  <p className="text-xs text-[#5A7799]">
                    Dữ liệu thời gian thực từ cảm biến kẹp ngón
                  </p>
                </div>
              </div>

              {/* Connected Device badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F8FD] border border-[#E7F1FB] text-[11px] text-[#5A7799]">
                <Radio className="w-3 h-3 text-[#2F78C8] animate-pulse" />
                <span>{activeVisit.spo2DeviceId} · Đã kết nối</span>
              </div>
            </div>

            {/* Live SpO2 display card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#F4F8FD] to-white border border-[#9EC9F3]/30 gap-4">
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-4xl font-extrabold tabular-nums tracking-tight ${
                    activeVisit.currentSpo2 < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                  }`}
                >
                  {activeVisit.currentSpo2}%
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeVisit.currentSpo2 < 90
                      ? 'bg-[#FFF1F2] text-[#EF4444]'
                      : 'bg-[#E7F1FB] text-[#2F78C8]'
                  }`}
                >
                  {activeVisit.currentSpo2 < 90 ? 'Cần theo dõi' : 'Bình thường'}
                </span>
                <span className="text-[11px] text-[#5A7799]">
                  Cập nhật vài giây trước
                </span>
              </div>

              {/* Short-term micro trend bars */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#9EC9F3] uppercase tracking-wider mr-1">
                  Xu hướng:
                </span>
                {activeVisit.spo2Trend.slice(-6).map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] tabular-nums font-mono text-[#5A7799]">
                      {val}
                    </span>
                    <div
                      className={`w-2.5 rounded-full transition-all ${
                        val < 90 ? 'bg-[#EF4444]' : 'bg-[#2F78C8]'
                      }`}
                      style={{ height: `${Math.max(12, (val - 80) * 2.2)}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* SECTION B: LUNG SOUND RECORDING (AUTOMATIC AIoT)        */}
          {/* ------------------------------------------------------- */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A5E]">Âm phổi</h3>
                  <p className="text-xs text-[#5A7799]">
                    Ống nghe số đồng bộ tự động khi áp vào cơ thể
                  </p>
                </div>
              </div>

              {/* Stethoscope Device Status */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F8FD] border border-[#E7F1FB] text-[11px] text-[#5A7799]">
                  <span className="w-2 h-2 rounded-full bg-[#2F78C8] animate-pulse" />
                  <span>{activeVisit.stethoDeviceId} · Đã kết nối</span>
                </div>
              </div>
            </div>

            {/* PASSIVE AUTOMATIC RECORDING MONITOR (NO WEB RECORD BUTTON) */}
            <div className="p-5 rounded-2xl border border-[#9EC9F3]/40 bg-gradient-to-b from-[#F4F8FD]/50 to-white text-center space-y-3 relative overflow-hidden">
              {/* STATE 1: WAITING */}
              {stethoState === 'waiting' && (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center mx-auto border border-[#9EC9F3]/50">
                    <Stethoscope className="w-6 h-6 stroke-[1.8] animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-[#173A5E]">
                    Đang chờ bản ghi từ ống nghe...
                  </h4>
                  <p className="text-xs text-[#5A7799] max-w-sm mx-auto">
                    Áp ống nghe vào vị trí cần nghe. Bản ghi sẽ được đồng bộ tự động.
                  </p>

                  {/* Hardware sensor simulation trigger for demo testing */}
                  <div className="pt-2">
                    <button
                      onClick={simulateStethoscopeTouch}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2F78C8] text-[#2F78C8] text-xs font-semibold hover:bg-[#E7F1FB] transition-colors shadow-2xs"
                    >
                      <Wifi className="w-3.5 h-3.5 animate-pulse" />
                      <span>Mô phỏng áp ống nghe lên ngực</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 2: RECEIVING */}
              {stethoState === 'receiving' && (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center mx-auto">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-[#173A5E]">
                    Đang nhận bản ghi...
                  </h4>
                  <p className="text-xs text-[#5A7799]">
                    Đang truyền tín hiệu âm thanh từ {activeVisit.stethoDeviceId}
                  </p>
                  <div className="w-48 h-1.5 bg-[#E7F1FB] rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-[#2F78C8] transition-all duration-300 rounded-full"
                      style={{ width: `${receivingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STATE 3: RECEIVED */}
              {stethoState === 'received' && (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-[#2F78C8]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#173A5E]">
                    Đã nhận bản ghi thành công
                  </h4>
                  <div className="flex items-center justify-center gap-3 text-xs text-[#5A7799]">
                    <span>Thời lượng: 18.7 giây</span>
                    <span>·</span>
                    <span>Vị trí: {autoPosition}</span>
                  </div>
                </div>
              )}

              {/* STATE 4: AI PROCESSING */}
              {stethoState === 'processing' && (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center mx-auto">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2F78C8]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#173A5E]">
                    Đang phân tích âm phổi bằng AI...
                  </h4>
                  <p className="text-xs text-[#5A7799]">
                    RespiSense Core đang quét tiếng ran nổ (Crackles) và ran rít (Wheezes)
                  </p>
                </div>
              )}

              {/* STATE 5: RESULT READY */}
              {stethoState === 'ready' && latestTempRec && (
                <div className="space-y-3 py-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7F1FB] text-[#2F78C8] text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kết quả AI đã sẵn sàng</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-1">
                    <div className="text-center">
                      <span className="text-[10px] text-[#9EC9F3] uppercase block font-semibold">
                        Phân loại AI
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          latestTempRec.aiClassification === 'Normal'
                            ? 'text-[#2F78C8]'
                            : latestTempRec.aiClassification === 'Crackles'
                            ? 'text-[#F59E0B]'
                            : latestTempRec.aiClassification === 'Wheezes'
                            ? 'text-[#6366F1]'
                            : 'text-[#EF4444]'
                        }`}
                      >
                        {latestTempRec.aiClassification}
                      </span>
                    </div>

                    <div className="w-px h-8 bg-[#E7F1FB]" />

                    <div className="text-center">
                      <span className="text-[10px] text-[#9EC9F3] uppercase block font-semibold">
                        Độ tin cậy
                      </span>
                      <span className="text-lg font-bold text-[#173A5E] tabular-nums">
                        {latestTempRec.confidence}%
                      </span>
                    </div>

                    <div className="w-px h-8 bg-[#E7F1FB]" />

                    <div className="text-center">
                      <span className="text-[10px] text-[#9EC9F3] uppercase block font-semibold">
                        Chu kỳ hô hấp
                      </span>
                      <span className="text-lg font-bold text-[#173A5E] tabular-nums">
                        {latestTempRec.totalCycles} chu kỳ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => playRecording(latestTempRec)}
                      className="px-3 py-1.5 bg-white border border-[#E7F1FB] hover:border-[#9EC9F3] text-xs font-semibold text-[#173A5E] rounded-xl flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-[#2F78C8]" />
                      <span>Nghe lại</span>
                    </button>

                    <button
                      onClick={handleResetForNextPosition}
                      className="px-3.5 py-1.5 bg-[#2F78C8] text-white text-xs font-semibold rounded-xl hover:bg-[#2563A6] transition-colors"
                    >
                      Đo vị trí tiếp theo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------- */}
            {/* MULTIPLE RECORDINGS IN THIS VISIT                       */}
            {/* ------------------------------------------------------- */}
            <div className="space-y-3 pt-3 border-t border-[#E7F1FB]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#173A5E]">
                  Âm phổi trong lần khám ({activeVisit.recordings.length} bản ghi)
                </h4>
                {unreviewedCount > 0 && (
                  <span className="text-[11px] text-[#EF4444] font-semibold bg-[#FFF1F2] px-2 py-0.5 rounded-full">
                    {unreviewedCount} bản ghi chờ xác nhận
                  </span>
                )}
              </div>

              {activeVisit.recordings.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#F4F8FD] text-center text-xs text-[#5A7799]">
                  Chưa có bản ghi âm phổi nào trong lần khám này. Vui lòng áp ống nghe để thu nhận tín hiệu.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeVisit.recordings.map((rec, index) => {
                    const isRecPlaying =
                      playbackState.isPlaying &&
                      playbackState.activeRecordingId === rec.id;

                    const displayClassification =
                      rec.doctorClassification || rec.aiClassification;

                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl border border-[#E7F1FB] hover:border-[#9EC9F3] bg-white transition-all shadow-2xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#E7F1FB] text-[#2F78C8] font-bold text-xs flex items-center justify-center">
                              {activeVisit.recordings.length - index}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-[#173A5E]">
                                  {rec.position}
                                </h5>
                                <span className="text-[11px] text-[#5A7799]">
                                  · {rec.durationSeconds}s ({rec.totalCycles} chu kỳ)
                                </span>
                              </div>
                              <span className="text-[10px] text-[#9EC9F3]">
                                Ghi nhận lúc {rec.recordedAt}
                              </span>
                            </div>
                          </div>

                          {/* AI Result & Confirmation Status */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#9EC9F3]">AI:</span>
                                <span
                                  className={`text-xs font-bold ${
                                    rec.aiClassification === 'Normal'
                                      ? 'text-[#2F78C8]'
                                      : rec.aiClassification === 'Crackles'
                                      ? 'text-[#F59E0B]'
                                      : rec.aiClassification === 'Wheezes'
                                      ? 'text-[#6366F1]'
                                      : 'text-[#EF4444]'
                                  }`}
                                >
                                  {rec.aiClassification} ({rec.confidence}%)
                                </span>
                              </div>

                              {rec.doctorClassification && (
                                <div className="text-[11px] text-[#173A5E] font-medium">
                                  Bác sĩ xác nhận: <strong>{rec.doctorClassification}</strong>
                                </div>
                              )}
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                rec.status === 'confirmed' || rec.status === 'overridden'
                                  ? 'bg-[#E7F1FB] text-[#2F78C8]'
                                  : 'bg-[#FFF1F2] text-[#EF4444]'
                              }`}
                            >
                              {rec.status === 'confirmed' || rec.status === 'overridden'
                                ? 'Đã duyệt'
                                : 'Chờ xác nhận'}
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="pt-2 border-t border-[#E7F1FB] flex items-center justify-between text-xs">
                          {/* Play sound button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isRecPlaying) {
                                pausePlayback();
                              } else {
                                playRecording(rec);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[#2F78C8] hover:underline font-semibold"
                          >
                            {isRecPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            <span>{isRecPlaying ? 'Tạm dừng' : 'Nghe lại'}</span>
                          </button>

                          {/* Review Actions */}
                          <div className="flex items-center gap-2">
                            {rec.status === 'pending_review' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateVisitRecordingReview(
                                      rec.id,
                                      rec.aiClassification
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#E7F1FB] text-[#2F78C8] font-semibold hover:bg-[#9EC9F3]/30 transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Xác nhận AI</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRecId(rec.id);
                                    setOverrideClass(rec.aiClassification);
                                    setOverrideNote(rec.doctorNote || '');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#F4F8FD] text-[#5A7799] hover:text-[#173A5E] font-medium border border-[#E7F1FB] transition-colors flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Chỉnh sửa</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRecId(rec.id);
                                  setOverrideClass(displayClassification);
                                  setOverrideNote(rec.doctorNote || '');
                                }}
                                className="text-[11px] text-[#5A7799] hover:text-[#2F78C8] hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Chỉnh sửa lại</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Edit Form if selected */}
                        {editingRecId === rec.id && (
                          <div className="p-3 rounded-xl bg-[#F4F8FD] border border-[#9EC9F3]/40 space-y-2.5 mt-2 animate-in fade-in duration-100">
                            <span className="text-[11px] font-semibold text-[#173A5E] block">
                              Chỉnh sửa phân loại âm phổi của bác sĩ:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                              {(
                                [
                                  'Normal',
                                  'Crackles',
                                  'Wheezes',
                                  'Crackles + Wheezes',
                                ] as LungSoundType[]
                              ).map((cls) => (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => setOverrideClass(cls)}
                                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
                                    overrideClass === cls
                                      ? 'bg-[#2F78C8] text-white font-bold shadow-2xs'
                                      : 'bg-white text-[#173A5E] border border-[#E7F1FB]'
                                  }`}
                                >
                                  {cls}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="Ghi chú lâm sàng cho vị trí này..."
                              value={overrideNote}
                              onChange={(e) => setOverrideNote(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E7F1FB] rounded-lg focus:outline-none focus:border-[#2F78C8] text-[#173A5E]"
                            />

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingRecId(null)}
                                className="px-3 py-1 text-xs text-[#5A7799] hover:bg-white rounded-lg"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateVisitRecordingReview(
                                    rec.id,
                                    overrideClass,
                                    overrideNote
                                  );
                                  setEditingRecId(null);
                                }}
                                className="px-3 py-1 text-xs font-semibold bg-[#2F78C8] text-white rounded-lg hover:bg-[#2563A6]"
                              >
                                Lưu xác nhận
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CONTEXT PANEL: VISIT NOTES & STATUS (4 cols)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#173A5E]">
              Ghi chú lần khám
            </h3>
            <p className="text-xs text-[#5A7799]">
              Nhập nhận xét về SpO₂, âm phổi hoặc hướng theo dõi tiếp theo
            </p>

            <textarea
              rows={6}
              placeholder="Nhập nhận xét hoặc hướng theo dõi cho lần khám này..."
              value={activeVisit.notes}
              onChange={(e) => updateVisitNotes(e.target.value)}
              className="w-full p-3 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E] resize-none leading-relaxed"
            />

            {/* Visit Status Display */}
            <div className="pt-3 border-t border-[#E7F1FB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A7799]">Trạng thái lần khám:</span>
                <span className="font-semibold text-[#2F78C8]">
                  {unreviewedCount > 0 ? 'Chờ xác nhận AI' : 'Đang khám'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A7799]">Tổng bản ghi âm:</span>
                <span className="font-bold tabular-nums text-[#173A5E]">
                  {activeVisit.recordings.length}
                </span>
              </div>
            </div>

            {/* PRIMARY COMPLETION ACTION */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCompleteModal(true)}
                className="w-full py-3 bg-[#2F78C8] hover:bg-[#2563A6] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn tất lần khám</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. COMPLETE VISIT CONFIRMATION MODAL                      */}
      {/* ========================================================= */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-[#173A5E]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E7F1FB] shadow-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#173A5E]">
                Hoàn tất lần khám?
              </h3>
              <p className="text-xs text-[#5A7799] mt-0.5">
                {activeVisit.patientName} · {activeVisit.startedAt}
              </p>
            </div>

            {/* Summary details */}
            <div className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E7F1FB] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5A7799]">SpO₂ gần nhất:</span>
                <span
                  className={`font-bold tabular-nums ${
                    activeVisit.currentSpo2 < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                  }`}
                >
                  {activeVisit.currentSpo2}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5A7799]">Số bản ghi âm phổi:</span>
                <span className="font-bold tabular-nums text-[#173A5E]">
                  {activeVisit.recordings.length} bản ghi
                </span>
              </div>

              {/* AI breakdown */}
              {activeVisit.recordings.length > 0 && (
                <div className="pt-2 border-t border-[#E7F1FB]/60 space-y-1">
                  <span className="text-[11px] font-semibold text-[#173A5E] block">
                    Phân bố âm phổi:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-[#5A7799]">
                    <span>
                      Normal:{' '}
                      <strong>
                        {
                          activeVisit.recordings.filter(
                            (r) => (r.doctorClassification || r.aiClassification) === 'Normal'
                          ).length
                        }
                      </strong>
                    </span>
                    <span>
                      Crackles:{' '}
                      <strong>
                        {
                          activeVisit.recordings.filter(
                            (r) => (r.doctorClassification || r.aiClassification) === 'Crackles'
                          ).length
                        }
                      </strong>
                    </span>
                    <span>
                      Wheezes:{' '}
                      <strong>
                        {
                          activeVisit.recordings.filter(
                            (r) => (r.doctorClassification || r.aiClassification) === 'Wheezes'
                          ).length
                        }
                      </strong>
                    </span>
                    <span>
                      C + W:{' '}
                      <strong>
                        {
                          activeVisit.recordings.filter(
                            (r) =>
                              (r.doctorClassification || r.aiClassification) ===
                              'Crackles + Wheezes'
                          ).length
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Warning if unreviewed recordings */}
              {unreviewedCount > 0 && (
                <div className="p-2.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#EF4444] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-snug">
                    Vẫn còn {unreviewedCount} bản ghi chưa được bác sĩ xác nhận. Bạn vẫn có thể hoàn tất hoặc kiểm tra lại.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#5A7799] hover:bg-[#F4F8FD] rounded-xl transition-colors"
              >
                Quay lại
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCompleteModal(false);
                  completeVisit();
                }}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold bg-[#2F78C8] text-white hover:bg-[#2563A6] rounded-xl transition-colors shadow-xs"
              >
                {unreviewedCount > 0 ? 'Vẫn hoàn tất' : 'Xác nhận hoàn tất'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
