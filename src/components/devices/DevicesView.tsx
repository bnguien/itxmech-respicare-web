import React, { useState } from 'react';
import { Stethoscope, Activity, Battery, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DevicesView: React.FC = () => {
  const { devices, navigate } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'stetho' | 'spo2'>('all');

  const filteredDevices = devices.filter((d) => {
    if (filterType === 'all') return true;
    return d.type === filterType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
          Thiết bị AIoT
        </h2>
        <p className="text-xs text-[#5A7799] mt-0.5">
          Quản lý ống nghe số và cảm biến SpO₂ liên tục gán cho bệnh nhân
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl self-start w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-white text-[#173A5E] shadow-xs'
              : 'text-[#5A7799] hover:text-[#173A5E]'
          }`}
        >
          Tất cả ({devices.length})
        </button>
        <button
          onClick={() => setFilterType('stetho')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'stetho'
              ? 'bg-white text-[#2F78C8] shadow-xs'
              : 'text-[#5A7799] hover:text-[#2F78C8]'
          }`}
        >
          Ống nghe số
        </button>
        <button
          onClick={() => setFilterType('spo2')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'spo2'
              ? 'bg-white text-[#2F78C8] shadow-xs'
              : 'text-[#5A7799] hover:text-[#2F78C8]'
          }`}
        >
          Thiết bị SpO₂
        </button>
      </div>

      {/* Clean Device Rows */}
      <div className="bg-white rounded-2xl border border-[#E7F1FB] divide-y divide-[#E7F1FB] overflow-hidden shadow-xs">
        {filteredDevices.map((dev) => {
          const isOnline = dev.status === 'online';

          return (
            <div
              key={dev.id}
              className="p-4 flex items-center justify-between hover:bg-[#F4F8FD]/60 transition-colors"
            >
              {/* Left: Device Icon & ID */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    dev.type === 'stetho'
                      ? 'bg-[#E7F1FB] text-[#2F78C8] border border-[#9EC9F3]/40'
                      : 'bg-[#F4F8FD] text-[#2F78C8] border border-[#9EC9F3]/40'
                  }`}
                >
                  {dev.type === 'stetho' ? (
                    <Stethoscope className="w-5 h-5 stroke-[1.8]" />
                  ) : (
                    <Activity className="w-5 h-5 stroke-[1.8]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#173A5E]">
                      {dev.code}
                    </span>
                    <span className="text-xs text-[#5A7799]">
                      {dev.type === 'stetho' ? 'Ống nghe số' : 'Thiết bị SpO₂'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7799] mt-0.5">
                    Gán: <strong
                      onClick={() =>
                        navigate('patient-detail', { patientId: dev.assignedPatientId })
                      }
                      className="text-[#173A5E] hover:text-[#2F78C8] hover:underline cursor-pointer font-semibold"
                    >
                      {dev.assignedPatientName}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Middle: Online Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-[#2F78C8]" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-[#EF4444]" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    isOnline ? 'text-[#2F78C8]' : 'text-[#EF4444]'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Right: Battery & Last Active */}
              <div className="flex items-center gap-6 text-xs text-[#5A7799]">
                <div className="flex items-center gap-1.5 tabular-nums">
                  <Battery className="w-4 h-4 text-[#9EC9F3]" />
                  <span>{dev.batteryPercent}%</span>
                </div>

                <span className="text-[11px] text-[#9EC9F3] hidden sm:block">
                  {dev.lastActive}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
