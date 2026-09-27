import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StethoscopeIllustration } from '../common/StethoscopeIllustration';

export const DashboardView: React.FC = () => {
  const { doctorProfile, patients, navigate, setIsStartVisitModalOpen } = useApp();

  // Patients needing attention first
  const attentionPatients = patients.filter((p) => p.needsAttention);
  const otherPatients = patients.filter((p) => !p.needsAttention);
  const displayPatients = [...attentionPatients, ...otherPatients].slice(0, 5);

  // SpO2 24h trend sample points for main patient (PAT-001)
  const spo2Points = [
    { hour: '16h', val: 96 },
    { hour: '20h', val: 95 },
    { hour: '00h', val: 94 },
    { hour: '04h', val: 94 },
    { hour: '08h', val: 93 },
    { hour: '12h', val: 91 },
    { hour: '14h', val: 90 },
    { hour: '15h', val: 89 },
  ];

  const minVal = 85;
  const maxVal = 100;
  const getY = (v: number) => 130 - ((v - minVal) / (maxVal - minVal)) * 100;

  const pointsSvg = spo2Points
    .map((p, i) => {
      const x = 30 + i * ((460 - 60) / (spo2Points.length - 1));
      const y = getY(p.val);
      return `${x},${y}`;
    })
    .join(' ');

  // Lung sound distribution data
  const soundDistribution = [
    { label: 'Normal', percent: 30, color: '#2F78C8' },
    { label: 'Crackles', percent: 39, color: '#F59E0B' },
    { label: 'Wheezes', percent: 17, color: '#6366F1' },
    { label: 'Crackles + Wheezes', percent: 14, color: '#EF4444' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl">
      {/* Welcome & Stethoscope Illustration from reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#F4F8FD] to-[#E7F1FB]/60 rounded-3xl p-5 sm:p-7 border border-[#9EC9F3]/30 overflow-hidden relative gap-4 sm:gap-0">
        <div className="z-10 max-w-lg space-y-3.5">
          <div>
            <span className="text-xs font-semibold text-[#2F78C8] tracking-wider uppercase">
              Bảng điều khiển
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#173A5E] mt-1 tracking-tight">
              Xin chào, <span className="text-[#2F78C8]">{doctorProfile.name}</span>!
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7799] mt-1 sm:mt-1.5">
              Hôm nay có <strong className="text-[#EF4444] font-semibold">{attentionPatients.length} bệnh nhân</strong> cần được chú ý.
            </p>
          </div>

          {/* PRIMARY GLOBAL ACTION: Bắt đầu khám */}
          <div>
            <button
              onClick={() => setIsStartVisitModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2F78C8] hover:bg-[#2563A6] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 group cursor-pointer"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Bắt đầu khám</span>
            </button>
          </div>
        </div>

        {/* Faithfully rendered Stethoscope from reference image */}
        <div className="self-center sm:self-auto shrink-0 relative pr-0 sm:pr-4">
          <StethoscopeIllustration width={190} height={140} className="sm:scale-100 scale-90" />
        </div>
      </div>

      {/* Main Grid: Patients Needing Attention + Clinical Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Bệnh nhân cần chú ý (approx 7 cols) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#173A5E]">
              Bệnh nhân cần chú ý
            </h3>
            <button
              onClick={() => navigate('patients')}
              className="text-xs text-[#2F78C8] hover:underline font-semibold"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2.5">
            {displayPatients.map((patient) => {
              const isCrit = patient.spo2Status === 'low' || patient.needsAttention;

              return (
                <div
                  key={patient.id}
                  onClick={() => navigate('patient-detail', { patientId: patient.id })}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[#E7F1FB] hover:border-[#9EC9F3] bg-white hover:bg-[#F4F8FD]/60 transition-all cursor-pointer shadow-xs gap-3 sm:gap-0"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#E7F1FB] text-[#173A5E] font-bold text-xs flex items-center justify-center border border-[#9EC9F3]/40">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')}
                      </div>
                      {patient.needsAttention && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#173A5E] group-hover:text-[#2F78C8] transition-colors truncate">
                          {patient.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5A7799] mt-0.5 truncate">
                        <span className="font-mono text-[11px] text-[#9EC9F3]">{patient.code}</span>
                        <span>·</span>
                        <span className="truncate">{patient.backgroundDiagnosis}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: SpO2 + Lung Sound + Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7F1FB]">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] sm:text-xs text-[#5A7799]">SpO₂</div>
                      <div
                        className={`text-sm font-bold tabular-nums ${
                          isCrit ? 'text-[#EF4444]' : 'text-[#173A5E]'
                        }`}
                      >
                        {patient.currentSpo2}%
                      </div>
                    </div>

                    <div className="text-right min-w-[90px] sm:min-w-[110px]">
                      <div className="text-[11px] sm:text-xs text-[#5A7799]">Âm phổi AI</div>
                      <div
                        className={`text-xs font-semibold truncate max-w-[120px] ${
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
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#9EC9F3] group-hover:text-[#2F78C8] transition-colors shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theo dõi hôm nay (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#173A5E] mb-4">
              Theo dõi hôm nay
            </h3>

            {/* TWO large metrics directly inside clean white area */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-[#F4F8FD] border border-[#9EC9F3]/30">
              <div className="space-y-1">
                <span className="text-xs text-[#5A7799]">SpO₂ thấp</span>
                <div className="text-2xl font-bold tabular-nums text-[#EF4444]">
                  2 <span className="text-xs font-normal text-[#5A7799]">bệnh nhân</span>
                </div>
              </div>

              <div className="space-y-1 pl-4 border-l border-[#9EC9F3]/40">
                <span className="text-xs text-[#5A7799]">Bản ghi chờ duyệt</span>
                <div className="text-2xl font-bold tabular-nums text-[#2F78C8]">
                  3 <span className="text-xs font-normal text-[#5A7799]">bản ghi</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Lung Sound Summary Distribution */}
          <div className="p-5 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#173A5E]">
                Phân tích âm phổi
              </h4>
              <span className="text-[11px] text-[#9EC9F3]">Toàn bộ bản ghi</span>
            </div>

            {/* Minimal distribution horizontal bars */}
            <div className="space-y-3">
              {soundDistribution.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5A7799]">{item.label}</span>
                    <span className="font-semibold tabular-nums text-[#173A5E]">
                      {item.percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7F1FB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SpO2 Trend Analytics Area */}
      <div className="p-4 sm:p-6 rounded-2xl border border-[#E7F1FB] bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#173A5E]">
              Xu hướng SpO₂ (24 giờ)
            </h3>
            <p className="text-xs text-[#5A7799] mt-0.5">
              Dữ liệu liên tục từ cảm biến SpO₂ bệnh nhân Trần Văn Mạnh (PAT-001)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#2F78C8]">
              <span className="w-2.5 h-0.5 bg-[#2F78C8] rounded-full" />
              <span>SpO₂ (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#EF4444]">
              <span className="w-2.5 h-0.5 bg-[#EF4444] rounded-full" />
              <span>Ngưỡng 90%</span>
            </div>
          </div>
        </div>

        {/* Lightweight SVG Line Chart */}
        <div className="relative h-44 w-full">
          <svg className="w-full h-full" viewBox="0 0 480 150" preserveAspectRatio="none">
            {/* Threshold line at 90% */}
            <line
              x1="30"
              y1={getY(90)}
              x2="460"
              y2={getY(90)}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.6"
            />

            {/* Subtle horizontal grid lines */}
            <line x1="30" y1={getY(95)} x2="460" y2={getY(95)} stroke="#E7F1FB" strokeWidth="1" />
            <line x1="30" y1={getY(100)} x2="460" y2={getY(100)} stroke="#E7F1FB" strokeWidth="1" />

            {/* Area fill under curve */}
            <defs>
              <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F78C8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2F78C8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <polygon
              points={`30,130 ${pointsSvg} 460,130`}
              fill="url(#spo2Grad)"
            />

            {/* Data line */}
            <polyline
              points={pointsSvg}
              fill="none"
              stroke="#2F78C8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point dots */}
            {spo2Points.map((p, i) => {
              const x = 30 + i * ((460 - 60) / (spo2Points.length - 1));
              const y = getY(p.val);
              const isLow = p.val < 90;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isLow ? 4 : 3}
                    fill={isLow ? '#EF4444' : '#2F78C8'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-[#5A7799]"
                  >
                    {p.val}
                  </text>
                  <text
                    x={x}
                    y="145"
                    textAnchor="middle"
                    className="text-[10px] fill-[#9EC9F3]"
                  >
                    {p.hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
