import React from 'react';
import {
  LayoutDashboard,
  Users,
  AudioLines,
  Bell,
  Radio,
  Settings,
  LogOut,
  Stethoscope,
  X,
} from 'lucide-react';
import { useApp, AppRoute } from '../../context/AppContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentRoute, navigate, alerts, doctorProfile } = useApp();
  const unreadAlertsCount = alerts.filter((a) => a.isUnread).length;

  const navItems: Array<{
    id: AppRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'patients', label: 'Bệnh nhân', icon: Users },
    { id: 'recordings', label: 'Bản ghi âm', icon: AudioLines, badge: doctorProfile.pendingReviewsCount },
    { id: 'alerts', label: 'Cảnh báo', icon: Bell, badge: unreadAlertsCount },
    { id: 'devices', label: 'Thiết bị', icon: Radio },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleNavClick = (route: AppRoute) => {
    navigate(route);
    onCloseMobile?.();
  };

  return (
    <aside className="w-64 lg:w-56 shrink-0 flex flex-col justify-between py-6 px-4 border-r border-[#E7F1FB] select-none bg-white h-full">
      {/* Brand lockup */}
      <div>
        <div className="px-3 mb-6 lg:mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#E7F1FB] flex items-center justify-center text-[#2F78C8]">
                <Stethoscope className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#9EC9F3] uppercase block leading-none">
                  ITxMech
                </span>
                <span className="text-base font-bold tracking-tight text-[#173A5E] leading-tight">
                  RESPI<span className="text-[#2F78C8]">care</span>
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#5A7799] font-normal pl-9">
              Hệ thống AIoT Hô hấp
            </p>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#5A7799] hover:bg-[#F4F8FD] transition-colors"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.id ||
              (item.id === 'patients' && currentRoute === 'patient-detail') ||
              (item.id === 'recordings' && currentRoute === 'recording-analysis');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-[#2F78C8] font-semibold bg-[#E7F1FB]'
                    : 'text-[#5A7799] hover:text-[#173A5E] hover:bg-[#F4F8FD]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 stroke-[1.8] ${
                      isActive ? 'text-[#2F78C8]' : 'text-[#9EC9F3]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] tabular-nums font-medium px-1.5 py-0.2 rounded-md ${
                      item.id === 'alerts'
                        ? 'bg-[#FFF1F2] text-[#EF4444]'
                        : 'bg-[#E7F1FB] text-[#2F78C8]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="space-y-4 pt-4 border-t border-[#E7F1FB]">
        {/* Subtle AI RespiSense Core Notice */}
        <div className="px-3 py-2.5 rounded-lg bg-[#F4F8FD] border border-[#9EC9F3]/30 text-left">
          <p className="text-[10px] font-semibold text-[#2F78C8] tracking-wide uppercase">
            AI RespiSense Core
          </p>
          <p className="text-[11px] text-[#5A7799] mt-0.5 leading-snug">
            Phân loại âm phổi 4 lớp
          </p>
        </div>

        <button
          onClick={() => {
            navigate('login');
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-[#5A7799] hover:text-[#EF4444] transition-colors rounded-lg hover:bg-red-50/40"
        >
          <LogOut className="w-4 h-4 stroke-[1.8]" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
