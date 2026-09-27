import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Edit3,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LungSoundType } from '../../types/respi';

export const RecordingAnalysisView: React.FC = () => {
  const {
    selectedRecordingId,
    recordings,
    navigate,
    playbackState,
    playRecording,
    pausePlayback,
    seekPlayback,
    setVolume,
    confirmRecordingReview,
    updateCycleClassification,
  } = useApp();

  const recording =
    recordings.find((r) => r.id === selectedRecordingId) || recordings[0];

  const [decisionMode, setDecisionMode] = useState<'confirm' | 'override'>(
    recording.status === 'overridden' ? 'override' : 'confirm'
  );
  const [selectedClassification, setSelectedClassification] = useState<LungSoundType>(
    recording.aiClassification
  );
  const [doctorNote, setDoctorNote] = useState<string>(recording.doctorNote || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);

  const isPlaying =
    playbackState.isPlaying && playbackState.activeRecordingId === recording.id;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const tenths = Math.floor((sec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playRecording(recording);
    }
  };

  const handleSaveReview = () => {
    const finalClassification =
      decisionMode === 'override' ? selectedClassification : recording.aiClassification;
    confirmRecordingReview(recording.id, finalClassification, doctorNote);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getCycleColor = (classification: LungSoundType) => {
    switch (classification) {
      case 'Normal':
        return '#2F78C8';
      case 'Crackles':
        return '#F59E0B';
      case 'Wheezes':
        return '#6366F1';
      case 'Crackles + Wheezes':
        return '#EF4444';
      default:
        return '#2F78C8';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('recordings')}
          className="flex items-center gap-1.5 text-xs text-[#5A7799] hover:text-[#2F78C8] mb-3 transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Danh sách bản ghi</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E7F1FB]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
                {recording.patientName}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F4F8FD] text-[#5A7799] border border-[#E7F1FB]">
                {recording.patientCode}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  recording.status === 'confirmed' || recording.status === 'overridden'
                    ? 'bg-[#E7F1FB] text-[#2F78C8]'
                    : 'bg-[#FFF1F2] text-[#EF4444]'
                }`}
              >
                {recording.status === 'confirmed' || recording.status === 'overridden'
                  ? 'Đã duyệt bởi bác sĩ'
                  : 'Chờ duyệt'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#5A7799] mt-1">
              <span>{recording.recordedAt}</span>
              <span>·</span>
              <span>{recording.position}</span>
              <span>·</span>
              <span className="tabular-nums font-mono">{recording.durationSeconds} giây</span>
            </div>
          </div>

          <button
            onClick={() => navigate('patient-detail', { patientId: recording.patientId })}
            className="text-xs font-semibold text-[#2F78C8] hover:underline"
          >
            Xem hồ sơ bệnh nhân →
          </button>
        </div>
      </div>

      {/* Main Grid: Waveform & Analysis (Left 8 cols) + Doctor Review (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Waveform + Cycles */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Result Horizontal Summary Bar (One clean section) */}
          <div className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#9EC9F3]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#9EC9F3] uppercase tracking-wider block font-semibold">
                Kết quả tổng hợp AI
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-base font-bold ${
                    recording.aiClassification === 'Normal'
                      ? 'text-[#2F78C8]'
                      : recording.aiClassification === 'Crackles'
                      ? 'text-[#F59E0B]'
                      : recording.aiClassification === 'Wheezes'
                      ? 'text-[#6366F1]'
                      : 'text-[#EF4444]'
                  }`}
                >
                  {recording.aiClassification}
                </span>
                <span className="text-xs tabular-nums text-[#5A7799]">
                  ({recording.confidence}%)
                </span>
              </div>
            </div>

            {/* Breakdown numbers */}
            <div className="flex items-center gap-5 divide-x divide-[#9EC9F3]/30 text-center text-xs">
              <div className="px-2">
                <span className="text-base font-bold tabular-nums text-[#173A5E] block">
                  {recording.totalCycles}
                </span>
                <span className="text-[10px] text-[#9EC9F3]">Chu kỳ</span>
              </div>
              <div className="pl-5">
                <span className="text-base font-bold tabular-nums text-[#2F78C8] block">
                  {recording.cycleBreakdown.normal}
                </span>
                <span className="text-[10px] text-[#5A7799]">Normal</span>
              </div>
              <div className="pl-5">
                <span className="text-base font-bold tabular-nums text-[#F59E0B] block">
                  {recording.cycleBreakdown.crackles}
                </span>
                <span className="text-[10px] text-[#5A7799]">Crackles</span>
              </div>
              <div className="pl-5">
                <span className="text-base font-bold tabular-nums text-[#6366F1] block">
                  {recording.cycleBreakdown.wheezes}
                </span>
                <span className="text-[10px] text-[#5A7799]">Wheezes</span>
              </div>
              <div className="pl-5">
                <span className="text-base font-bold tabular-nums text-[#EF4444] block">
                  {recording.cycleBreakdown.both}
                </span>
                <span className="text-[10px] text-[#5A7799]">Both</span>
              </div>
            </div>
          </div>

          {/* LARGE INTERACTIVE WAVEFORM */}
          <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#173A5E] tracking-wide">
                Dạng sóng âm phế trường & Phân đoạn chu kỳ hô hấp
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-[#2F78C8]">
                  <span className="w-2 h-2 rounded-full bg-[#2F78C8]" /> Normal
                </span>
                <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Crackles
                </span>
                <span className="inline-flex items-center gap-1 text-[#6366F1]">
                  <span className="w-2 h-2 rounded-full bg-[#6366F1]" /> Wheezes
                </span>
                <span className="inline-flex items-center gap-1 text-[#EF4444]">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Both
                </span>
              </div>
            </div>

            {/* Waveform Canvas Area */}
            <div className="relative h-44 bg-[#F4F8FD] rounded-2xl overflow-hidden p-3 border border-[#E7F1FB] select-none">
              {/* Cycle Bands Background */}
              <div className="absolute inset-0 flex">
                {recording.cycles.map((cycle) => {
                  const widthPercent =
                    ((cycle.endTime - cycle.startTime) / recording.durationSeconds) * 100;
                  const color = getCycleColor(cycle.doctorClassification || cycle.classification);

                  return (
                    <div
                      key={cycle.id}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: color,
                        opacity: 0.08,
                      }}
                      className="h-full border-r border-[#9EC9F3]/30 relative group"
                    />
                  );
                })}
              </div>

              {/* Realistic Acoustic Waveform Bars */}
              <div className="relative h-full flex items-center justify-between gap-1 z-10 px-2">
                {Array.from({ length: 72 }).map((_, i) => {
                  const timePos = (i / 72) * recording.durationSeconds;
                  const currentCycle =
                    recording.cycles.find(
                      (c) => timePos >= c.startTime && timePos <= c.endTime
                    ) || recording.cycles[0];

                  const color = getCycleColor(
                    currentCycle.doctorClassification || currentCycle.classification
                  );

                  // Amplitude envelope
                  const cycleRelTime =
                    (timePos - currentCycle.startTime) /
                    (currentCycle.endTime - currentCycle.startTime);
                  const isExp = cycleRelTime > 0.45;
                  let baseHeight = Math.sin(cycleRelTime * Math.PI) * 70 + 12;

                  if (currentCycle.classification.includes('Crackles') && !isExp) {
                    baseHeight += Math.sin(i * 1.8) * 35;
                  }
                  if (currentCycle.classification.includes('Wheezes') && isExp) {
                    baseHeight += Math.cos(i * 2.5) * 22;
                  }

                  const heightClamped = Math.max(8, Math.min(100, baseHeight));
                  const isPast =
                    playbackState.activeRecordingId === recording.id &&
                    timePos <= playbackState.currentTime;

                  return (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-75"
                      style={{
                        height: `${heightClamped}%`,
                        backgroundColor: color,
                        opacity: isPast ? 1 : 0.45,
                        transform: isPast ? 'scaleY(1.08)' : 'scaleY(1)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Playback Scrubber Line */}
              {playbackState.activeRecordingId === recording.id && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#EF4444] z-20 pointer-events-none"
                  style={{
                    left: `${(playbackState.currentTime / recording.durationSeconds) * 100}%`,
                  }}
                >
                  <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full -ml-1 -top-1 absolute" />
                </div>
              )}
            </div>

            {/* Audio Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleTogglePlay}
                  className="w-10 h-10 rounded-full bg-[#2F78C8] text-white flex items-center justify-center hover:bg-[#2563A6] transition-colors shadow-xs shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="font-mono text-xs tabular-nums text-[#173A5E] font-semibold">
                  {formatTime(
                    playbackState.activeRecordingId === recording.id
                      ? playbackState.currentTime
                      : 0
                  )}{' '}
                  / {formatTime(recording.durationSeconds)}
                </div>
              </div>

              {/* Scrubber slider */}
              <div className="flex-1 max-w-md w-full flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={recording.durationSeconds}
                  step="0.1"
                  value={
                    playbackState.activeRecordingId === recording.id
                      ? playbackState.currentTime
                      : 0
                  }
                  onChange={(e) => seekPlayback(parseFloat(e.target.value))}
                  className="w-full accent-[#2F78C8] cursor-pointer h-1.5 bg-[#E7F1FB] rounded-lg"
                />
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 text-[#5A7799]">
                {playbackState.volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={playbackState.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-[#2F78C8] cursor-pointer h-1.5 bg-[#E7F1FB] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* CYCLE LIST - Compact Rows */}
          <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#173A5E]">
                Chi tiết từng chu kỳ hô hấp
              </h3>
              <span className="text-xs text-[#9EC9F3]">
                Bác sĩ có thể chỉnh sửa phân loại cho từng chu kỳ
              </span>
            </div>

            <div className="divide-y divide-[#E7F1FB]">
              {recording.cycles.map((cycle) => {
                const currentCls = cycle.doctorClassification || cycle.classification;
                const isEditingThis = editingCycleId === cycle.id;

                return (
                  <div
                    key={cycle.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#173A5E] w-20">
                        Chu kỳ {cycle.cycleNumber.toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[#9EC9F3]">
                        {cycle.startTime.toFixed(1)}s — {cycle.endTime.toFixed(1)}s
                      </span>
                    </div>

                    {/* Classification or editing picker */}
                    <div className="flex items-center gap-3">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1.5">
                          {(['Normal', 'Crackles', 'Wheezes', 'Crackles + Wheezes'] as const).map(
                            (cls) => (
                              <button
                                key={cls}
                                onClick={() => {
                                  updateCycleClassification(recording.id, cycle.id, cls);
                                  setEditingCycleId(null);
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] border ${
                                  currentCls === cls
                                    ? 'bg-[#2F78C8] text-white border-[#2F78C8]'
                                    : 'border-[#E7F1FB] text-[#5A7799] hover:bg-[#F4F8FD]'
                                }`}
                              >
                                {cls}
                              </button>
                            )
                          )}
                          <button
                            onClick={() => setEditingCycleId(null)}
                            className="p-1 text-[#9EC9F3] hover:text-[#173A5E]"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              currentCls === 'Normal'
                                ? 'text-[#2F78C8]'
                                : currentCls === 'Crackles'
                                ? 'text-[#F59E0B]'
                                : currentCls === 'Wheezes'
                                ? 'text-[#6366F1]'
                                : 'text-[#EF4444]'
                            }`}
                          >
                            {currentCls}
                          </span>
                          <span className="text-[11px] text-[#9EC9F3]">
                            ({cycle.confidence}%)
                          </span>
                          {cycle.doctorConfirmed && (
                            <span className="text-[10px] text-[#2F78C8] font-bold">
                              (BS xác nhận)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => seekPlayback(cycle.startTime)}
                        className="text-[11px] text-[#5A7799] hover:text-[#2F78C8] font-semibold"
                      >
                        ▶ Nghe đoạn này
                      </button>

                      {!isEditingThis && (
                        <button
                          onClick={() => setEditingCycleId(cycle.id)}
                          className="text-[11px] text-[#2F78C8] hover:underline font-semibold"
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: DOCTOR REVIEW PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-5 sticky top-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7F1FB]">
              <h3 className="text-sm font-bold text-[#173A5E]">
                Xác nhận của bác sĩ
              </h3>
              <span className="text-[10px] font-semibold text-[#2F78C8] bg-[#E7F1FB] px-2 py-0.5 rounded">
                Lâm sàng
              </span>
            </div>

            {/* AI Proposal reminder */}
            <div className="p-3 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB] text-xs">
              <span className="text-[10px] text-[#9EC9F3] block uppercase font-semibold">Gợi ý từ AI:</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-bold text-[#173A5E]">
                  {recording.aiClassification}
                </span>
                <span className="text-[11px] text-[#5A7799]">
                  (Độ tin cậy: {recording.confidence}%)
                </span>
              </div>
            </div>

            {/* Doctor Decision Selector */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#173A5E] block">
                Đánh giá của bác sĩ:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDecisionMode('confirm')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    decisionMode === 'confirm'
                      ? 'bg-[#E7F1FB] border-[#2F78C8] text-[#2F78C8]'
                      : 'border-[#E7F1FB] text-[#5A7799] hover:bg-[#F4F8FD]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác nhận kết quả</span>
                </button>

                <button
                  onClick={() => setDecisionMode('override')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    decisionMode === 'override'
                      ? 'bg-[#E7F1FB] border-[#2F78C8] text-[#2F78C8]'
                      : 'border-[#E7F1FB] text-[#5A7799] hover:bg-[#F4F8FD]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              {/* If Override is active, select different classification */}
              {decisionMode === 'override' && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] text-[#5A7799] block font-medium">
                    Chọn kết luận lâm sàng mới:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Normal', 'Crackles', 'Wheezes', 'Crackles + Wheezes'] as const).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedClassification(type)}
                          className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            selectedClassification === type
                              ? 'bg-[#2F78C8] text-white border-[#2F78C8]'
                              : 'border-[#E7F1FB] text-[#5A7799] hover:bg-[#F4F8FD]'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#173A5E] block">
                Ghi chú lâm sàng của bác sĩ:
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Ran rít thì thở ra, kèm ran nổ thưa thớt đáy phổi phải..."
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E]"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveReview}
              className="w-full py-2.5 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <span>Lưu xác nhận</span>
              )}
            </button>

            {/* MANDATORY DISCLAIMER */}
            <div className="pt-3 border-t border-[#E7F1FB] flex items-start gap-2 text-[11px] text-[#9EC9F3] leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#9EC9F3] mt-0.5" />
              <span>
                Kết quả AI chỉ mang tính hỗ trợ và không thay thế đánh giá chuyên môn của bác sĩ.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
