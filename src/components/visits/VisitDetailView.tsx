import React from 'react';
import {
  ArrowLeft,
  Activity,
  Stethoscope,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VisitDetailView: React.FC = () => {
  const {
    selectedPatientId,
    selectedVisitId,
    patients,
    navigate,
    playRecording,
    pausePlayback,
    playbackState,
  } = useApp();

  const patient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const visit =
    patient?.visits?.find((v) => v.id === selectedVisitId) ||
    patient?.visits?.[0];

  if (!visit) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-[#5A7799]">Không tìm thấy thông tin lần khám này.</p>
        <button
          onClick={() => navigate('patient-detail', { patientId: patient.id })}
          className="px-4 py-2 bg-[#2F78C8] text-white text-xs font-semibold rounded-xl"
        >
          Quay lại Hồ sơ bệnh nhân
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('patient-detail', { patientId: patient.id })}
          className="flex items-center gap-1.5 text-xs text-[#5A7799] hover:text-[#2F78C8] mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hồ sơ bệnh nhân {patient.name}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7F1FB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#2F78C8] uppercase tracking-wider">
                Chi tiết lần khám
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold">
                {visit.status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#173A5E] tracking-tight">
              {patient.name}{' '}
              <span className="font-mono text-sm text-[#9EC9F3] font-normal">
                ({patient.code})
              </span>
            </h2>

            <div className="flex items-center gap-2 text-xs text-[#5A7799] mt-1">
              <span>Bác sĩ: <strong>{visit.doctorName}</strong></span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#9EC9F3]" />
                <span>{visit.completedAt || visit.startedAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('visit-workspace', { patientId: patient.id })}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-[#2F78C8] hover:bg-[#2563A6] rounded-xl shadow-xs"
          >
            + Tạo lần khám mới
          </button>
        </div>
      </div>

      {/* Grid: SpO2 + Lung Sounds + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): SpO2 & Lung Recordings */}
        <div className="lg:col-span-8 space-y-6">
          {/* SpO2 trong lần khám */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-bold text-[#173A5E]">
                  SpO₂ trong lần khám
                </h3>
              </div>
              <span className="text-xs text-[#5A7799]">{visit.spo2DeviceId}</span>
            </div>

            <div className="flex items-baseline gap-3 p-4 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB]">
              <span
                className={`text-3xl font-extrabold tabular-nums ${
                  visit.currentSpo2 < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                }`}
              >
                {visit.currentSpo2}%
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  visit.currentSpo2 < 90
                    ? 'bg-[#FFF1F2] text-[#EF4444]'
                    : 'bg-[#E7F1FB] text-[#2F78C8]'
                }`}
              >
                {visit.currentSpo2 < 90 ? 'Giảm oxy máu' : 'Bình thường'}
              </span>
            </div>
          </div>

          {/* Âm phổi trong lần khám */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A5E]">
                    Âm phổi trong lần khám
                  </h3>
                  <p className="text-xs text-[#5A7799]">
                    {visit.recordings.length} bản ghi âm từ ống nghe số
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {visit.recordings.map((rec, idx) => {
                const isRecPlaying =
                  playbackState.isPlaying &&
                  playbackState.activeRecordingId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-[#E7F1FB] bg-white shadow-2xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#E7F1FB] text-[#2F78C8] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
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

                      {/* AI Result vs Doctor Confirmation */}
                      <div className="text-right">
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <span className="text-[10px] text-[#9EC9F3]">Kết quả AI:</span>
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
                            Xác nhận của bác sĩ: <strong>{rec.doctorClassification}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {rec.doctorNote && (
                      <p className="text-xs text-[#5A7799] italic bg-[#F4F8FD] p-2 rounded-lg">
                        &ldquo;{rec.doctorNote}&rdquo;
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#E7F1FB] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (isRecPlaying) {
                            pausePlayback();
                          } else {
                            playRecording(rec);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-[#2F78C8] hover:underline font-semibold"
                      >
                        {isRecPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{isRecPlaying ? 'Tạm dừng' : 'Nghe lại bản ghi'}</span>
                      </button>

                      <span className="text-[11px] text-[#2F78C8] font-semibold bg-[#E7F1FB] px-2 py-0.5 rounded-full">
                        Đã xác nhận
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Visit Notes & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#173A5E]">
              Ghi chú lần khám
            </h3>
            {visit.notes ? (
              <p className="text-xs text-[#173A5E] bg-[#F4F8FD] p-3 rounded-xl leading-relaxed whitespace-pre-wrap border border-[#E7F1FB]">
                {visit.notes}
              </p>
            ) : (
              <p className="text-xs text-[#5A7799] italic">
                Không có ghi chú bổ sung nào trong lần khám này.
              </p>
            )}

            <div className="pt-3 border-t border-[#E7F1FB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5A7799]">Kết luận chung:</span>
                <span className="font-bold text-[#173A5E]">
                  {visit.overallAiSummary || 'Normal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5A7799]">Bác sĩ phụ trách:</span>
                <span className="font-semibold text-[#2F78C8]">
                  {visit.doctorName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
