import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { doctorProfile, updateDoctorProfile } = useApp();

  const [name, setName] = useState(doctorProfile.name);
  const [title, setTitle] = useState(doctorProfile.title);
  const [department, setDepartment] = useState(doctorProfile.department);
  const [email, setEmail] = useState(doctorProfile.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification toggles
  const [notifySpo2Low, setNotifySpo2Low] = useState(true);
  const [notifyAbnormalSound, setNotifyAbnormalSound] = useState(true);
  const [notifyPendingReview, setNotifyPendingReview] = useState(true);
  const [notifyDeviceOffline, setNotifyDeviceOffline] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctorProfile({
      name,
      title,
      department,
      email,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#173A5E] tracking-tight">
          Cài đặt hệ thống
        </h2>
        <p className="text-xs text-[#5A7799] mt-0.5">
          Quản lý tài khoản bác sĩ và cấu hình cảnh báo lâm sàng
        </p>
      </div>

      {/* Doctor Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-5 shadow-xs">
        <h3 className="text-sm font-semibold text-[#173A5E]">
          Thông tin bác sĩ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5A7799]">Họ và tên bác sĩ</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5A7799]">Chức danh chuyên môn</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5A7799]">Chuyên khoa</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5A7799]">Email làm việc</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:ring-1 focus:ring-[#2F78C8] text-[#173A5E]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="text-xs text-[#2F78C8] hover:underline font-semibold"
          >
            Đổi mật khẩu
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </>
            ) : (
              <span>Lưu thông tin</span>
            )}
          </button>
        </div>
      </form>

      {/* Notifications Configuration */}
      <div className="p-6 rounded-2xl border border-[#E7F1FB] bg-white space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-[#173A5E]">
          Cấu hình thông báo lâm sàng
        </h3>

        <div className="divide-y divide-[#E7F1FB]">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#173A5E]">SpO₂ thấp (&lt; 90%)</p>
              <p className="text-[11px] text-[#5A7799]">Cảnh báo ngay lập tức khi phát hiện tình trạng giảm oxy máu</p>
            </div>
            <input
              type="checkbox"
              checked={notifySpo2Low}
              onChange={(e) => setNotifySpo2Low(e.target.checked)}
              className="w-4 h-4 accent-[#2F78C8] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#173A5E]">Âm phổi bất thường</p>
              <p className="text-[11px] text-[#5A7799]">Thông báo khi AI phát hiện Crackles, Wheezes hoặc kết hợp</p>
            </div>
            <input
              type="checkbox"
              checked={notifyAbnormalSound}
              onChange={(e) => setNotifyAbnormalSound(e.target.checked)}
              className="w-4 h-4 accent-[#2F78C8] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#173A5E]">Bản ghi chờ xác nhận</p>
              <p className="text-[11px] text-[#5A7799]">Nhắc nhở bác sĩ khi có bản ghi âm mới gửi từ ống nghe số</p>
            </div>
            <input
              type="checkbox"
              checked={notifyPendingReview}
              onChange={(e) => setNotifyPendingReview(e.target.checked)}
              className="w-4 h-4 accent-[#2F78C8] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#173A5E]">Thiết bị mất kết nối</p>
              <p className="text-[11px] text-[#5A7799]">Cảnh báo cảm biến SpO₂ hoặc ống nghe ngắt kết nối BLE</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDeviceOffline}
              onChange={(e) => setNotifyDeviceOffline(e.target.checked)}
              className="w-4 h-4 accent-[#2F78C8] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
