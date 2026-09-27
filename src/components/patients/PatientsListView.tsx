import React, { useState } from 'react';
import { Search, ChevronRight, Plus, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PatientsListView: React.FC = () => {
  const { patients, navigate, setIsStartVisitModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'spo2_low' | 'abnormal_sound'>('all');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.backgroundDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'spo2_low') {
      return p.currentSpo2 < 90 || p.spo2Status === 'low';
    }
    if (activeFilter === 'abnormal_sound') {
      return p.latestSoundResult !== 'Normal';
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header with primary button: + Thêm bệnh nhân */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
            Bệnh nhân
          </h2>
          <p className="text-xs text-[#5A7799] mt-0.5">
            Danh sách bệnh nhân đang được theo dõi
          </p>
        </div>

        <button
          onClick={() => setIsStartVisitModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 bg-[#2F78C8] hover:bg-[#2563A6] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bệnh nhân</span>
        </button>
      </div>

      {/* Search & Minimal Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EC9F3]" />
          <input
            type="text"
            placeholder="Tìm bệnh nhân theo tên, mã hoặc chẩn đoán..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] transition-all text-[#173A5E] placeholder:text-[#9EC9F3]"
          />
        </div>

        {/* Minimal Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-white text-[#173A5E] shadow-xs'
                : 'text-[#5A7799] hover:text-[#173A5E]'
            }`}
          >
            Tất cả ({patients.length})
          </button>
          <button
            onClick={() => setActiveFilter('spo2_low')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeFilter === 'spo2_low'
                ? 'bg-white text-[#EF4444] shadow-xs'
                : 'text-[#5A7799] hover:text-[#EF4444]'
            }`}
          >
            SpO₂ thấp
          </button>
          <button
            onClick={() => setActiveFilter('abnormal_sound')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeFilter === 'abnormal_sound'
                ? 'bg-white text-[#2F78C8] shadow-xs'
                : 'text-[#5A7799] hover:text-[#2F78C8]'
            }`}
          >
            Âm phổi bất thường
          </button>
        </div>
      </div>

      {/* Clean Patient List (no dense grid table lines) */}
      <div className="bg-white rounded-2xl border border-[#E7F1FB] overflow-hidden divide-y divide-[#E7F1FB] shadow-xs">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-[#5A7799]">
            <p className="text-sm">Không tìm thấy bệnh nhân phù hợp</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isLow = patient.currentSpo2 < 90;
            return (
              <div
                key={patient.id}
                onClick={() => navigate('patient-detail', { patientId: patient.id })}
                className="group p-4 flex items-center justify-between hover:bg-[#F4F8FD]/60 transition-colors cursor-pointer"
              >
                {/* Left: Avatar & Bio */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
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

                  <div>
                    <h4 className="text-sm font-semibold text-[#173A5E] group-hover:text-[#2F78C8] transition-colors">
                      {patient.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#5A7799] mt-0.5">
                      <span className="font-mono text-[11px] text-[#9EC9F3]">{patient.code}</span>
                      <span>·</span>
                      <span>{patient.age} tuổi</span>
                      <span>·</span>
                      <span>{patient.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Background Diagnosis (Do bác sĩ ghi nhận) */}
                <div className="hidden md:block text-left max-w-[200px]">
                  <span className="text-[10px] text-[#9EC9F3] block">Chẩn đoán nền</span>
                  <div className="text-xs font-semibold text-[#173A5E] mt-0.5">
                    {patient.backgroundDiagnosis}
                  </div>
                  <span className="text-[10px] text-[#5A7799] italic block">
                    {patient.diagnosisNote}
                  </span>
                </div>

                {/* Right: SpO2, AI Lung Sound, Arrow */}
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="text-[10px] text-[#9EC9F3] block">SpO₂</span>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isLow ? 'text-[#EF4444]' : 'text-[#173A5E]'
                      }`}
                    >
                      {patient.currentSpo2}%
                    </span>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <span className="text-[10px] text-[#9EC9F3] block">Âm phổi AI</span>
                    <span
                      className={`text-xs font-semibold ${
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
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#9EC9F3] group-hover:text-[#2F78C8] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
