import React, { useState } from 'react';
import { ChevronRight, Play, Pause } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LungSoundType } from '../../types/respi';

export const RecordingsListView: React.FC = () => {
  const { recordings, navigate, playRecording, playbackState } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | LungSoundType>('all');

  const filteredRecordings = recordings.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending_review';
    if (filter === 'confirmed') return r.status === 'confirmed' || r.status === 'overridden';
    return r.aiClassification === filter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
          Bản ghi âm
        </h2>
        <p className="text-xs text-[#5A7799] mt-0.5">
          Các bản ghi từ ống nghe số và phân loại AI RespiSense
        </p>
      </div>

      {/* Lightweight filter pills */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl self-start overflow-x-auto max-w-full">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ xác nhận' },
          { id: 'confirmed', label: 'Đã xác nhận' },
          { id: 'Normal', label: 'Normal' },
          { id: 'Crackles', label: 'Crackles' },
          { id: 'Wheezes', label: 'Wheezes' },
          { id: 'Crackles + Wheezes', label: 'Crackles + Wheezes' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === item.id
                ? 'bg-white text-[#173A5E] shadow-xs'
                : 'text-[#5A7799] hover:text-[#173A5E]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Recordings clean list */}
      <div className="bg-white rounded-2xl border border-[#E7F1FB] overflow-hidden divide-y divide-[#E7F1FB] shadow-xs">
        {filteredRecordings.length === 0 ? (
          <div className="p-12 text-center text-[#5A7799] text-xs">
            Không có bản ghi âm nào phù hợp tiêu chí lọc.
          </div>
        ) : (
          filteredRecordings.map((rec) => {
            const isPlayingThis =
              playbackState.isPlaying && playbackState.activeRecordingId === rec.id;

            return (
              <div
                key={rec.id}
                className="p-4 flex items-center justify-between hover:bg-[#F4F8FD]/60 transition-colors group cursor-pointer"
                onClick={() => navigate('recording-analysis', { recordingId: rec.id })}
              >
                {/* Left: Patient Avatar & Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#E7F1FB] text-[#173A5E] font-bold text-xs flex items-center justify-center border border-[#9EC9F3]/40">
                    {rec.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(-2)
                      .join('')}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#173A5E] group-hover:text-[#2F78C8] transition-colors">
                      {rec.patientName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#5A7799] mt-0.5">
                      <span className="font-mono text-[11px] text-[#9EC9F3]">{rec.patientCode}</span>
                      <span>·</span>
                      <span>{rec.recordedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Position & Duration */}
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-[#173A5E] block">
                    {rec.position}
                  </span>
                  <span className="text-[11px] text-[#9EC9F3]">
                    {rec.durationSeconds} giây · {rec.totalCycles} chu kỳ
                  </span>
                </div>

                {/* Right: AI Result, Confidence, Status, Quick Play, Arrow */}
                <div className="flex items-center gap-6">
                  {/* AI result & confidence */}
                  <div className="text-right min-w-[120px]">
                    <span
                      className={`text-xs font-semibold block ${
                        rec.aiClassification === 'Normal'
                          ? 'text-[#2F78C8]'
                          : rec.aiClassification === 'Crackles'
                          ? 'text-[#F59E0B]'
                          : rec.aiClassification === 'Wheezes'
                          ? 'text-[#6366F1]'
                          : 'text-[#EF4444]'
                      }`}
                    >
                      {rec.aiClassification}
                    </span>
                    <span className="text-[10px] text-[#9EC9F3]">
                      Tin cậy: {rec.confidence}%
                    </span>
                  </div>

                  {/* Review Status */}
                  <div className="hidden md:block text-right">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                        rec.status === 'confirmed' || rec.status === 'overridden'
                          ? 'bg-[#E7F1FB] text-[#2F78C8]'
                          : 'bg-[#FFF1F2] text-[#EF4444]'
                      }`}
                    >
                      {rec.status === 'confirmed' || rec.status === 'overridden'
                        ? 'Đã duyệt'
                        : 'Chờ duyệt'}
                    </span>
                  </div>

                  {/* Play audio preview */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playRecording(rec);
                    }}
                    title={isPlayingThis ? 'Dừng phát' : 'Nghe bản ghi'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isPlayingThis
                        ? 'bg-[#2F78C8] text-white'
                        : 'bg-[#F4F8FD] text-[#5A7799] hover:bg-[#E7F1FB] hover:text-[#2F78C8] border border-[#E7F1FB]'
                    }`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

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
