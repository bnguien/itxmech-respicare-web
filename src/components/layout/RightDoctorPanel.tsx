import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  patientName?: string;
  type: 'spo2' | 'stetho' | 'review';
  completed?: boolean;
}

interface RightDoctorPanelProps {
  onCloseMobile?: () => void;
}

export const RightDoctorPanel: React.FC<RightDoctorPanelProps> = ({ onCloseMobile }) => {
  const { doctorProfile } = useApp();

  // Calendar state: defaults to September 2026 (matching app's current date 27/09/2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 27)); // Month 8 is September (0-indexed)
  const [selectedDay, setSelectedDay] = useState(27);

  // Events map by day of the month
  const [events, setEvents] = useState<Record<number, ScheduleEvent[]>>({
    27: [
      {
        id: 'e1',
        time: '08:30',
        title: 'Đo lại SpO₂ & theo dõi buồng',
        patientName: 'Trần Văn Mạnh',
        type: 'spo2',
        completed: true,
      },
      {
        id: 'e2',
        time: '10:15',
        title: 'Ghi âm phổi số (Phổi trái)',
        patientName: 'Phạm Đức Thành',
        type: 'stetho',
        completed: true,
      },
      {
        id: 'e3',
        time: '14:30',
        title: 'Hội chẩn kết quả AI Crackles',
        patientName: 'Đỗ Hữu Trí',
        type: 'review',
        completed: false,
      },
      {
        id: 'e4',
        time: '16:00',
        title: 'Kiểm tra pin cảm biến BLE SpO₂',
        type: 'spo2',
        completed: false,
      },
    ],
    28: [
      {
        id: 'e5',
        time: '09:00',
        title: 'Đánh giá đáp ứng dãn phế quản',
        patientName: 'Võ Thị Hương',
        type: 'stetho',
        completed: false,
      },
      {
        id: 'e6',
        time: '15:00',
        title: 'Duyệt bản ghi âm phổi tồn đọng',
        type: 'review',
        completed: false,
      },
    ],
    29: [
      {
        id: 'e7',
        time: '08:45',
        title: 'Ghi âm phổi định kỳ 24h',
        patientName: 'Nguyễn Thị Lan',
        type: 'stetho',
        completed: false,
      },
    ],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:30');
  const [newEventType, setNewEventType] = useState<'spo2' | 'stetho' | 'review'>('stetho');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = (firstDayIndex + 6) % 7;

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: ScheduleEvent = {
      id: `ev-${Date.now()}`,
      time: newEventTime,
      title: newEventTitle,
      type: newEventType,
      completed: false,
    };

    setEvents((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newEv],
    }));

    setNewEventTitle('');
    setShowAddModal(false);
  };

  const toggleEventComplete = (id: string) => {
    setEvents((prev) => {
      const dayEvents = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: dayEvents.map((ev) =>
          ev.id === id ? { ...ev, completed: !ev.completed } : ev
        ),
      };
    });
  };

  const selectedDayEvents = events[selectedDay] || [];

  return (
    <aside className="w-full lg:w-80 shrink-0 border-l border-[#E7F1FB] p-5 sm:p-6 flex flex-col bg-white overflow-y-auto h-full">
      {/* ========================================================= */}
      {/* 1. PROFILE SECTION (BS. NGUYỄN HOÀNG NAM + PALETTE RING)  */}
      {/* ========================================================= */}
      <div className="pb-6 border-b border-[#E7F1FB]">
        {/* Top Label & Mobile Close Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#173A5E] tracking-tight">
            Hồ sơ bác sĩ
          </h3>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#5A7799] hover:bg-[#F4F8FD] transition-colors"
              title="Đóng panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Centered Avatar with circular primary palette glowing halo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3.5 flex items-center justify-center">
            {/* Glowing circular halo with web primary theme colors (#2F78C8, #9EC9F3, #173A5E) */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#173A5E] via-[#2F78C8] to-[#9EC9F3] p-[3px] shadow-[0_8px_24px_rgba(47,120,200,0.30)] flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=320"
                alt="BS. Nguyễn Hoàng Nam"
                className="w-full h-full rounded-full object-cover border-2 border-white"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              {/* Fallback initials if image fails */}
              <div className="w-full h-full rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold text-lg flex items-center justify-center border-2 border-white hidden">
                HN
              </div>
            </div>

            {/* Online active medical badge */}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#2F78C8] border-2 border-white rounded-full shadow-xs" />
          </div>

          {/* Doctor Name */}
          <h4 className="text-base font-bold text-[#173A5E] tracking-tight">
            {doctorProfile.name}
          </h4>

          {/* Specialization / Title */}
          <p className="text-xs text-[#5A7799] mt-0.5 font-medium">
            Bác sĩ chuyên khoa Hô hấp
          </p>
          <span className="text-[11px] text-[#2F78C8] bg-[#E7F1FB] border border-[#9EC9F3]/40 px-2.5 py-0.5 rounded-full mt-2 font-medium">
            Khoa Hô hấp · AIoT
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CALENDAR SECTION (INTERACTIVE MONTH & DAY SELECTOR)    */}
      {/* ========================================================= */}
      <div className="pt-6 space-y-4">
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#173A5E] tracking-tight uppercase">
              Lịch làm việc
            </h4>
            <p className="text-xs font-semibold text-[#2F78C8]">
              {monthNames[month]} {year}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              title="Tháng trước"
              className="w-7 h-7 rounded-lg border border-[#E7F1FB] hover:border-[#9EC9F3] hover:bg-[#F4F8FD] text-[#5A7799] flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              title="Tháng sau"
              className="w-7 h-7 rounded-lg border border-[#E7F1FB] hover:border-[#9EC9F3] hover:bg-[#F4F8FD] text-[#5A7799] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
            <span
              key={d}
              className="text-[10px] font-semibold text-[#5A7799] py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty offset cells before day 1 */}
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = dayNum === selectedDay;
            const isToday = dayNum === 27 && month === 8;
            const dayHasEvents = events[dayNum] && events[dayNum].length > 0;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-8 w-8 mx-auto rounded-xl flex flex-col items-center justify-center relative text-xs transition-all ${
                  isSelected
                    ? 'bg-[#2F78C8] text-white font-bold shadow-xs'
                    : isToday
                    ? 'bg-[#E7F1FB] text-[#2F78C8] font-bold border border-[#9EC9F3]'
                    : 'text-[#173A5E] hover:bg-[#F4F8FD]'
                }`}
              >
                <span>{dayNum}</span>

                {/* Event indicator dot */}
                {dayHasEvents && (
                  <span
                    className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      isSelected ? 'bg-white' : 'bg-[#2F78C8]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 3. CLINICAL SCHEDULE FOR SELECTED DAY                     */}
        {/* ========================================================= */}
        <div className="pt-4 border-t border-[#E7F1FB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#173A5E]">
              Lịch khám {selectedDay}/{month + 1}
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#2F78C8] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm lịch</span>
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F4F8FD] border border-[#E7F1FB] text-center">
              <p className="text-xs text-[#5A7799]">
                Không có lịch khám vào ngày này
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-xs font-semibold text-[#2F78C8] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Tạo lịch theo dõi
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => toggleEventComplete(ev.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    ev.completed
                      ? 'bg-[#F4F8FD]/60 border-[#E7F1FB] opacity-60'
                      : 'bg-white border-[#E7F1FB] hover:border-[#9EC9F3] shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-[#5A7799] hover:text-[#2F78C8] shrink-0"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        ev.completed ? 'text-[#2F78C8] fill-[#E7F1FB]' : 'text-[#9EC9F3]'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold text-[#173A5E] truncate leading-tight ${
                        ev.completed ? 'line-through text-[#5A7799]' : ''
                      }`}
                    >
                      {ev.title}
                    </p>
                    {ev.patientName && (
                      <p className="text-[11px] text-[#2F78C8] mt-0.5 truncate">
                        {ev.patientName}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-[#5A7799] mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{ev.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#173A5E]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full border border-[#E7F1FB] shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-[#173A5E]">
              Thêm lịch ngày {selectedDay}/{month + 1}/{year}
            </h4>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-xs text-[#5A7799] block mb-1">
                  Nội dung kiểm tra
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đo lại SpO2 buồng 3"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] text-[#173A5E]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-[#5A7799] block mb-1">
                  Giờ hẹn
                </label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] text-[#173A5E]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5A7799] hover:bg-[#F4F8FD] rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#2F78C8] text-white hover:bg-[#2563A6] rounded-lg shadow-xs"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
