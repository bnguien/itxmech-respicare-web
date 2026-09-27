import React, { useState } from 'react';
import { ChevronRight, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlertsView: React.FC = () => {
  const { alerts, markAlertRead, clearAllAlerts, navigate } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'all') return true;
    if (filterType === 'spo2_low') return a.type === 'spo2_low';
    if (filterType === 'abnormal_sound')
      return a.type === 'crackles' || a.type === 'wheezes' || a.type === 'both';
    if (filterType === 'pending_review') return a.type === 'pending_review';
    if (filterType === 'device_offline') return a.type === 'device_offline';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
            Cảnh báo lâm sàng
          </h2>
          <p className="text-xs text-[#5A7799] mt-0.5">
            Thông báo kịp thời về giảm oxy máu, âm phổi bất thường và trạng thái thiết bị
          </p>
        </div>

        <button
          onClick={clearAllAlerts}
          className="flex items-center gap-1.5 text-xs text-[#2F78C8] hover:text-[#173A5E] font-semibold transition-colors shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl self-start overflow-x-auto max-w-full">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'spo2_low', label: 'SpO₂ thấp' },
          { id: 'abnormal_sound', label: 'Âm phổi bất thường' },
          { id: 'pending_review', label: 'Bản ghi chờ xác nhận' },
          { id: 'device_offline', label: 'Thiết bị mất kết nối' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === f.id
                ? 'bg-white text-[#173A5E] shadow-xs'
                : 'text-[#5A7799] hover:text-[#173A5E]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clean Notification List */}
      <div className="bg-white rounded-2xl border border-[#E7F1FB] divide-y divide-[#E7F1FB] overflow-hidden shadow-xs">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-[#5A7799] text-xs">
            Không có cảnh báo nào trong mục này.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                onClick={() => {
                  markAlertRead(alert.id);
                  if (alert.targetRoute === 'patients' && alert.targetId) {
                    navigate('patient-detail', { patientId: alert.targetId });
                  } else if (alert.targetRoute === 'recordings' && alert.targetId) {
                    navigate('recording-analysis', { recordingId: alert.targetId });
                  } else if (alert.targetRoute) {
                    navigate(alert.targetRoute as any);
                  }
                }}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors group ${
                  alert.isUnread ? 'bg-white' : 'bg-[#F4F8FD]/50'
                } hover:bg-[#F4F8FD]`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Indicator Dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isCrit
                        ? 'bg-[#EF4444]'
                        : isWarn
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#2F78C8]'
                    }`}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {alert.patientName ? (
                        <h4 className="text-xs font-semibold text-[#173A5E] truncate">
                          {alert.patientName}
                        </h4>
                      ) : (
                        <h4 className="text-xs font-semibold text-[#173A5E]">Hệ thống thiết bị</h4>
                      )}
                      {alert.patientCode && (
                        <span className="font-mono text-[10px] text-[#9EC9F3]">
                          {alert.patientCode}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#5A7799] mt-0.5 leading-snug">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[11px] text-[#9EC9F3]">
                    {alert.timestamp}
                  </span>
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
