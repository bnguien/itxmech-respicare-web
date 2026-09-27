import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Check,
  Play,
  Pause,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PatientDetailView: React.FC = () => {
  const {
    selectedPatientId,
    patients,
    recordings,
    navigate,
    updatePatientDiagnosis,
    addDoctorNote,
    playRecording,
    playbackState,
    alerts,
    startNewVisit,
    viewVisitDetail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'spo2' | 'sound' | 'history' | 'notes'>('overview');
  const [spo2Range, setSpo2Range] = useState<'24h' | '7d' | '30d'>('24h');
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);
  const [editedDiagnosis, setEditedDiagnosis] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientRecordings = recordings.filter((r) => r.patientId === patient.id);
  const latestRecording = patientRecordings[0] || recordings[0];
  const patientAlerts = alerts.filter((a) => a.patientId === patient.id);

  const isCurrentAudioPlaying =
    playbackState.isPlaying && playbackState.activeRecordingId === latestRecording?.id;

  const handleStartEditDiagnosis = () => {
    setEditedDiagnosis(patient.backgroundDiagnosis);
    setIsEditingDiagnosis(true);
  };

  const handleSaveDiagnosis = () => {
    if (editedDiagnosis.trim()) {
      updatePatientDiagnosis(patient.id, editedDiagnosis.trim());
    }
    setIsEditingDiagnosis(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      addDoctorNote(patient.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  // SVG Chart points for SpO2
  const spo2History = patient.spo2History24h || [];
  const minVal = 85;
  const maxVal = 100;
  const getY = (v: number) => 130 - ((v - minVal) / (maxVal - minVal)) * 100;

  const pointsSvg = spo2History
    .map((p, i) => {
      const x = 30 + i * ((500 - 60) / Math.max(1, spo2History.length - 1));
      const y = getY(p.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Back Button & Patient Header */}
      <div>
        <button
          onClick={() => navigate('patients')}
          className="flex items-center gap-1.5 text-xs text-[#5A7799] hover:text-[#2F78C8] mb-4 transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hồ sơ bệnh nhân</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E7F1FB]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold text-base flex items-center justify-center border border-[#9EC9F3]/60">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .slice(-2)
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
                  {patient.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#F4F8FD] text-[#5A7799] border border-[#E7F1FB]">
                  {patient.code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A7799] mt-1">
                <span>{patient.age} tuổi</span>
                <span>·</span>
                <span>{patient.gender}</span>
                <span>·</span>

                {/* Editable Background Diagnosis */}
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-[#9EC9F3]">Chẩn đoán nền:</span>
                  {isEditingDiagnosis ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={editedDiagnosis}
                        onChange={(e) => setEditedDiagnosis(e.target.value)}
                        className="px-2 py-0.5 text-xs border border-[#2F78C8] rounded bg-white text-[#173A5E] outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveDiagnosis}
                        className="p-1 hover:bg-[#E7F1FB] text-[#2F78C8] rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5">
                      <strong className="font-semibold text-[#173A5E]">
                        {patient.backgroundDiagnosis}
                      </strong>
                      <span className="text-[11px] text-[#9EC9F3] italic">
                        ({patient.diagnosisNote})
                      </span>
                      <button
                        onClick={handleStartEditDiagnosis}
                        title="Chỉnh sửa chẩn đoán nền do bác sĩ ghi nhận"
                        className="p-1 hover:text-[#2F78C8] text-[#9EC9F3] transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TWO PRIMARY CLINICAL VALUES ONLY */}
          <div className="flex items-center gap-4 bg-[#F4F8FD] p-3.5 rounded-2xl border border-[#9EC9F3]/30 self-stretch sm:self-auto justify-around">
            <div className="text-left px-2">
              <span className="text-[10px] text-[#5A7799] block uppercase tracking-wide">
                SpO₂ hiện tại
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    patient.currentSpo2 < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                  }`}
                >
                  {patient.currentSpo2}%
                </span>
                <span
                  className={`text-xs font-semibold ${
                    patient.currentSpo2 < 90 ? 'text-[#EF4444]' : 'text-[#2F78C8]'
                  }`}
                >
                  {patient.currentSpo2 < 90 ? 'Thấp' : 'Bình thường'}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-[#9EC9F3]/40" />

            <div className="text-left px-2">
              <span className="text-[10px] text-[#5A7799] block uppercase tracking-wide">
                Âm phổi AI
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className={`text-sm font-bold ${
                    patient.latestSoundResult === 'Normal'
                      ? 'text-[#2F78C8]'
                      : patient.latestSoundResult === 'Crackles'
                      ? 'text-[#F59E0B]'
                      : patient.latestSoundResult === 'Wheezes'
                      ? 'text-[#6366F1]'
                      : 'text-[#EF4444]'
                  }`}
                >
                  {patient.latestSoundResult}
                </span>
                <span className="text-[11px] tabular-nums text-[#9EC9F3]">
                  ({patient.soundConfidence}%)
                </span>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION: START NEW VISIT FOR EXISTING PATIENT */}
          <button
            type="button"
            onClick={() => startNewVisit(patient.id)}
            className="self-stretch sm:self-center px-4 py-2.5 bg-[#2F78C8] hover:bg-[#2563A6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lần khám mới</span>
          </button>
        </div>

        {/* Lightweight Text Tabs with thin blue indicator */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E7F1FB] text-xs font-medium pt-2 overflow-x-auto whitespace-nowrap">
          {(
            [
              { id: 'overview', label: 'Tổng quan' },
              { id: 'spo2', label: 'SpO₂' },
              { id: 'sound', label: 'Âm phổi' },
              { id: 'history', label: 'Lịch sử khám' },
              { id: 'notes', label: 'Ghi chú' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 relative transition-colors ${
                  isActive
                    ? 'text-[#2F78C8] font-bold'
                    : 'text-[#5A7799] hover:text-[#173A5E]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2F78C8] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SpO2 Monitoring (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#173A5E]">
                    Xu hướng SpO₂
                  </h3>
                  <p className="text-xs text-[#5A7799] mt-0.5">Theo dõi thời gian thực</p>
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-[#F4F8FD] border border-[#E7F1FB] rounded-lg text-xs">
                  {(['24h', '7d', '30d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSpo2Range(r)}
                      className={`px-2 py-0.5 rounded-md ${
                        spo2Range === r
                          ? 'bg-white font-semibold text-[#173A5E] shadow-xs'
                          : 'text-[#5A7799]'
                      }`}
                    >
                      {r === '24h' ? '24 giờ' : r === '7d' ? '7 ngày' : '30 ngày'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimal Line Chart */}
              <div className="h-36 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <line
                    x1="30"
                    y1={getY(90)}
                    x2="490"
                    y2={getY(90)}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                  <polygon
                    points={`30,130 ${pointsSvg} 490,130`}
                    fill="#2F78C8"
                    fillOpacity="0.1"
                  />
                  <polyline
                    points={pointsSvg}
                    fill="none"
                    stroke="#2F78C8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {spo2History.map((p, i) => {
                    const x = 30 + i * ((500 - 60) / Math.max(1, spo2History.length - 1));
                    const y = getY(p.value);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={p.value < 90 ? 4 : 2.5}
                        fill={p.value < 90 ? '#EF4444' : '#2F78C8'}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E7F1FB] text-center">
                <div>
                  <span className="text-[11px] text-[#5A7799] block">Hiện tại</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      patient.spo2Stats.current < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                    }`}
                  >
                    {patient.spo2Stats.current}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A7799] block">Trung bình</span>
                  <span className="text-base font-bold tabular-nums text-[#173A5E]">
                    {patient.spo2Stats.average}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A7799] block">Thấp nhất</span>
                  <span className="text-base font-bold tabular-nums text-[#EF4444]">
                    {patient.spo2Stats.lowest}%
                  </span>
                </div>
              </div>
            </div>

            {/* Latest Lung Sound Section */}
            {latestRecording && (
              <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#173A5E]">
                      Âm phổi gần nhất
                    </h3>
                    <p className="text-xs text-[#5A7799] mt-0.5">
                      Ghi nhận lúc {latestRecording.recordedAt}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      latestRecording.aiClassification === 'Normal'
                        ? 'bg-[#E7F1FB] text-[#2F78C8]'
                        : 'bg-[#FFF1F2] text-[#EF4444]'
                    }`}
                  >
                    {latestRecording.aiClassification}
                  </span>
                </div>

                {/* Details summary */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A7799]">
                  <div>
                    Độ tin cậy: <strong className="text-[#173A5E] font-semibold">{latestRecording.confidence}%</strong>
                  </div>
                  <span>·</span>
                  <div>
                    Thời lượng: <strong className="text-[#173A5E] font-semibold">{latestRecording.durationSeconds}s</strong>
                  </div>
                  <span>·</span>
                  <div>
                    Chu kỳ: <strong className="text-[#173A5E] font-semibold">{latestRecording.totalCycles} chu kỳ</strong>
                  </div>
                  <span>·</span>
                  <div>
                    Vị trí: <strong className="text-[#173A5E] font-semibold">{latestRecording.position}</strong>
                  </div>
                </div>

                {/* Lightweight waveform preview */}
                <div className="h-12 bg-[#F4F8FD] rounded-xl flex items-center justify-between px-3 gap-1 overflow-hidden border border-[#E7F1FB]">
                  {latestRecording.cycles.map((cycle, idx) => (
                    <div
                      key={cycle.id}
                      className="flex-1 h-8 flex items-center justify-center gap-0.5 rounded px-1 transition-all"
                      style={{
                        backgroundColor:
                          cycle.classification === 'Normal'
                            ? '#E7F1FB'
                            : cycle.classification === 'Crackles'
                            ? '#FEF3C7'
                            : cycle.classification === 'Wheezes'
                            ? '#EEF2FF'
                            : '#FEE2E2',
                      }}
                      title={`Chu kỳ ${idx + 1}: ${cycle.classification}`}
                    >
                      <span className="w-0.5 h-3 bg-current opacity-40 rounded-full" />
                      <span className="w-0.5 h-5 bg-current opacity-70 rounded-full" />
                      <span className="w-0.5 h-2 bg-current opacity-30 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => playRecording(latestRecording)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors"
                  >
                    {isCurrentAudioPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Nghe âm phổi</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      navigate('recording-analysis', { recordingId: latestRecording.id })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E7F1FB] hover:bg-[#F4F8FD] text-[#173A5E] text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#5A7799]" />
                    <span>Xem phân tích chi tiết</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sub-Panel: Doctor note + Recent Alert (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Doctor Note */}
            <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#173A5E] tracking-wide uppercase">
                  Ghi chú lâm sàng
                </h3>
                <span className="text-[11px] text-[#9EC9F3]">Mới nhất</span>
              </div>

              {patient.doctorNotes.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB] text-xs text-[#173A5E] leading-relaxed">
                  <p>{patient.doctorNotes[0].content}</p>
                  <span className="text-[10px] text-[#9EC9F3] block mt-2">
                    {patient.doctorNotes[0].date} · {patient.doctorNotes[0].doctorName}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#9EC9F3] italic">Chưa có ghi chú lâm sàng</p>
              )}

              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs text-[#2F78C8] hover:underline font-semibold block pt-1"
              >
                + Thêm ghi chú mới
              </button>
            </div>

            {/* Recent Alert */}
            <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-[#173A5E] tracking-wide uppercase">
                Cảnh báo gần nhất
              </h3>

              {patientAlerts.length > 0 ? (
                <div className="space-y-2">
                  {patientAlerts.slice(0, 2).map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#FFF1F2]/60 border border-[#EF4444]/20 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                        <strong className="text-[#EF4444] font-semibold">{a.message}</strong>
                      </div>
                      <span className="text-[10px] text-[#9EC9F3] block mt-1 pl-4">
                        {a.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#F4F8FD] text-xs text-[#5A7799]">
                  Không có cảnh báo hoạt động nào.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SpO2 TAB */}
      {activeTab === 'spo2' && (
        <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#173A5E]">Theo dõi SpO₂</h3>
              <p className="text-xs text-[#5A7799] mt-0.5">
                Cảm biến liên tục phát hiện giảm oxy máu sớm
              </p>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#F4F8FD] border border-[#E7F1FB] rounded-lg text-xs">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSpo2Range(r)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    spo2Range === r
                      ? 'bg-white font-semibold text-[#173A5E] shadow-xs'
                      : 'text-[#5A7799]'
                  }`}
                >
                  {r === '24h' ? '24 giờ' : r === '7d' ? '7 ngày' : '30 ngày'}
                </button>
              ))}
            </div>
          </div>

          {/* Large SpO2 Chart */}
          <div className="h-48 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <line
                x1="30"
                y1={getY(90)}
                x2="490"
                y2={getY(90)}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <polygon
                points={`30,130 ${pointsSvg} 490,130`}
                fill="#2F78C8"
                fillOpacity="0.12"
              />
              <polyline
                points={pointsSvg}
                fill="none"
                stroke="#2F78C8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {spo2History.map((p, i) => {
                const x = 30 + i * ((500 - 60) / Math.max(1, spo2History.length - 1));
                const y = getY(p.value);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={p.value < 90 ? 4 : 3}
                    fill={p.value < 90 ? '#EF4444' : '#2F78C8'}
                  />
                );
              })}
            </svg>
          </div>

          {/* Four Stats Row */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB] text-center">
            <div>
              <span className="text-[11px] text-[#5A7799] block">Hiện tại</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  patient.spo2Stats.current < 90 ? 'text-[#EF4444]' : 'text-[#173A5E]'
                }`}
              >
                {patient.spo2Stats.current}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#5A7799] block">Trung bình</span>
              <span className="text-lg font-bold tabular-nums text-[#173A5E]">
                {patient.spo2Stats.average}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#5A7799] block">Cao nhất</span>
              <span className="text-lg font-bold tabular-nums text-[#2F78C8]">
                {patient.spo2Stats.highest}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#5A7799] block">Thấp nhất</span>
              <span className="text-lg font-bold tabular-nums text-[#EF4444]">
                {patient.spo2Stats.lowest}%
              </span>
            </div>
          </div>

          {/* Minimal Chronological List */}
          <div>
            <h4 className="text-xs font-semibold text-[#173A5E] mb-3">
              Nhật ký đo SpO₂ chi tiết
            </h4>
            <div className="divide-y divide-[#E7F1FB] border border-[#E7F1FB] rounded-xl overflow-hidden">
              {spo2History.map((reading, index) => {
                const isLow = reading.value < 90;
                return (
                  <div
                    key={index}
                    className="p-3 flex items-center justify-between text-xs hover:bg-[#F4F8FD]/50"
                  >
                    <span className="font-mono text-[#5A7799]">{reading.time}</span>
                    <span
                      className={`font-bold tabular-nums ${
                        isLow ? 'text-[#EF4444]' : 'text-[#173A5E]'
                      }`}
                    >
                      {reading.value}%
                    </span>
                    <span
                      className={`font-medium ${
                        isLow
                          ? 'text-[#EF4444]'
                          : reading.value <= 92
                          ? 'text-[#F59E0B]'
                          : 'text-[#2F78C8]'
                      }`}
                    >
                      {reading.note || (isLow ? 'Thấp' : 'Bình thường')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. ÂM PHỔI TAB */}
      {activeTab === 'sound' && (
        <div className="space-y-6">
          {/* Latest recording card */}
          {latestRecording && (
            <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#173A5E]">
                  Bản ghi gần nhất ({latestRecording.recordedAt})
                </h3>
                <span className="text-xs text-[#2F78C8] font-bold">
                  {latestRecording.aiClassification} ({latestRecording.confidence}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#F4F8FD] rounded-xl text-xs text-[#5A7799] border border-[#E7F1FB]">
                <span>Vị trí: <strong className="text-[#173A5E]">{latestRecording.position}</strong></span>
                <span>Thời lượng: <strong className="text-[#173A5E]">{latestRecording.durationSeconds}s</strong></span>
                <span>Chu kỳ: <strong className="text-[#173A5E]">{latestRecording.totalCycles}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playRecording(latestRecording)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors"
                >
                  {isCurrentAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isCurrentAudioPlaying ? 'Dừng' : 'Nghe'}</span>
                </button>
                <button
                  onClick={() =>
                    navigate('recording-analysis', { recordingId: latestRecording.id })
                  }
                  className="px-4 py-2 rounded-xl border border-[#E7F1FB] hover:bg-[#F4F8FD] text-xs font-semibold text-[#173A5E]"
                >
                  Phân tích chi tiết
                </button>
              </div>
            </div>
          )}

          {/* History of recordings */}
          <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs">
            <h3 className="text-sm font-semibold text-[#173A5E] mb-4">
              Lịch sử bản ghi
            </h3>

            <div className="divide-y divide-[#E7F1FB]">
              {patientRecordings.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate('recording-analysis', { recordingId: rec.id })}
                  className="py-3 flex items-center justify-between text-xs hover:bg-[#F4F8FD] px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-semibold text-[#173A5E] block">{rec.recordedAt}</span>
                    <span className="text-[11px] text-[#9EC9F3]">{rec.position} · {rec.durationSeconds}s</span>
                  </div>

                  <div className="text-center">
                    <span
                      className={`font-semibold ${
                        rec.aiClassification === 'Normal' ? 'text-[#2F78C8]' : 'text-[#EF4444]'
                      }`}
                    >
                      {rec.aiClassification}
                    </span>
                    <span className="text-[10px] text-[#9EC9F3] block">{rec.confidence}%</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        rec.status === 'confirmed'
                          ? 'bg-[#E7F1FB] text-[#2F78C8]'
                          : 'bg-[#FFF1F2] text-[#EF4444]'
                      }`}
                    >
                      {rec.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LỊCH SỬ KHÁM TAB */}
      {activeTab === 'history' && (
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#173A5E]">
                Lịch sử các lần khám ({patient.visits?.length || 0})
              </h3>
              <p className="text-xs text-[#5A7799] mt-0.5">
                Các phiên theo dõi hô hấp, SpO₂ và bản ghi âm phổi của bệnh nhân
              </p>
            </div>

            <button
              type="button"
              onClick={() => startNewVisit(patient.id)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2F78C8] hover:bg-[#2563A6] rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo lần khám mới</span>
            </button>
          </div>

          {!patient.visits || patient.visits.length === 0 ? (
            <div className="p-8 text-center bg-[#F4F8FD] rounded-2xl border border-[#E7F1FB] space-y-3">
              <p className="text-xs text-[#5A7799]">
                Bệnh nhân chưa có lần khám nào được ghi nhận.
              </p>
              <button
                type="button"
                onClick={() => startNewVisit(patient.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2F78C8] hover:bg-[#2563A6] rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bắt đầu lần khám đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E7F1FB] pl-10 space-y-5">
              {patient.visits.map((visit) => {
                const isCrit = visit.spo2Status === 'low';
                return (
                  <div
                    key={visit.id}
                    className="relative group p-4 rounded-2xl border border-[#E7F1FB] hover:border-[#9EC9F3] bg-white hover:bg-[#F4F8FD]/40 transition-all shadow-2xs"
                  >
                    {/* Timeline dot */}
                    <span
                      className={`absolute -left-10 top-5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                        isCrit ? 'bg-[#EF4444]' : 'bg-[#2F78C8]'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#173A5E]">
                            {visit.startedAt}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold">
                            {visit.status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A7799] mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[#9EC9F3]">SpO₂:</span>
                            <span
                              className={`font-bold tabular-nums ${
                                isCrit ? 'text-[#EF4444]' : 'text-[#173A5E]'
                              }`}
                            >
                              {visit.currentSpo2}%
                            </span>
                          </div>

                          <span>·</span>

                          <div>
                            <span className="text-[#9EC9F3]">Âm phổi: </span>
                            <strong className="text-[#173A5E]">
                              {visit.recordings.length} bản ghi âm
                            </strong>
                          </div>

                          <span>·</span>

                          <div>
                            <span className="text-[#9EC9F3]">Kết quả: </span>
                            <span
                              className={`font-semibold ${
                                visit.overallAiSummary === 'Normal'
                                  ? 'text-[#2F78C8]'
                                  : visit.overallAiSummary === 'Crackles'
                                  ? 'text-[#F59E0B]'
                                  : visit.overallAiSummary === 'Wheezes'
                                  ? 'text-[#6366F1]'
                                  : 'text-[#EF4444]'
                              }`}
                            >
                              {visit.overallAiSummary || 'Normal'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#5A7799] mt-1.5">
                          Bác sĩ phụ trách: <strong>{visit.doctorName}</strong>
                        </p>
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        onClick={() => viewVisitDetail(patient.id, visit.id)}
                        className="self-start sm:self-center px-3.5 py-1.5 rounded-xl border border-[#E7F1FB] hover:border-[#2F78C8] text-xs font-semibold text-[#2F78C8] hover:bg-[#E7F1FB] transition-all shrink-0"
                      >
                        → Xem chi tiết
                      </button>
                    </div>

                    {visit.notes && (
                      <p className="text-xs text-[#5A7799] italic mt-2.5 pt-2 border-t border-[#E7F1FB]/60 line-clamp-2">
                        &ldquo;{visit.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. GHI CHÚ TAB */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-6 shadow-xs">
          <h3 className="text-sm font-semibold text-[#173A5E]">
            Ghi chú của bác sĩ
          </h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Nhập nhận định lâm sàng, hướng xử trí hô hấp hoặc lưu ý theo dõi..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full p-3 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E] placeholder:text-[#9EC9F3]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] disabled:opacity-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-4 border-t border-[#E7F1FB]">
            {patient.doctorNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#173A5E]">{note.doctorName}</span>
                  <span className="text-[10px] text-[#9EC9F3]">{note.date}</span>
                </div>
                <p className="text-xs text-[#5A7799] leading-relaxed pt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
