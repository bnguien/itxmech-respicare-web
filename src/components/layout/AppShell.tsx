import React, { useState } from 'react';
import { Menu, Calendar, Bell, Stethoscope, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { RightDoctorPanel } from './RightDoctorPanel';
import { useApp } from '../../context/AppContext';
import { DashboardView } from '../dashboard/DashboardView';
import { PatientsListView } from '../patients/PatientsListView';
import { PatientDetailView } from '../patients/PatientDetailView';
import { RecordingsListView } from '../recordings/RecordingsListView';
import { RecordingAnalysisView } from '../recordings/RecordingAnalysisView';
import { AlertsView } from '../alerts/AlertsView';
import { DevicesView } from '../devices/DevicesView';
import { SettingsView } from '../settings/SettingsView';
import { LoginView } from '../auth/LoginView';
import { StartVisitModal } from '../visits/StartVisitModal';
import { VisitWorkspaceView } from '../visits/VisitWorkspaceView';
import { VisitDetailView } from '../visits/VisitDetailView';

export const AppShell: React.FC = () => {
  const { currentRoute, navigate, alerts, doctorProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  if (currentRoute === 'login') {
    return <LoginView />;
  }

  // Determine whether to display the right contextual doctor panel
  const showGlobalRightPanel = currentRoute === 'dashboard';
  const unreadAlertsCount = alerts.filter((a) => a.isUnread).length;

  return (
    <div className="min-h-screen bg-[#E7F1FB] p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center">
      {/* Centered White Dashboard Surface with subtle soft shadow & rounded corners */}
      <div className="w-full max-w-[1540px] h-[96vh] sm:h-[94vh] bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(23,58,94,0.07)] border border-[#9EC9F3]/40 flex flex-col overflow-hidden relative">
        
        {/* ========================================================= */}
        {/* MOBILE TOP BAR (< lg)                                     */}
        {/* ========================================================= */}
        <header className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#E7F1FB] bg-white z-20">
          {/* Left: Mobile Menu Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-[#5A7799] hover:text-[#173A5E] hover:bg-[#F4F8FD] rounded-xl transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-1.5" onClick={() => navigate('dashboard')}>
              <div className="w-6 h-6 rounded-lg bg-[#E7F1FB] flex items-center justify-center text-[#2F78C8]">
                <Stethoscope className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#173A5E]">
                RESPI<span className="text-[#2F78C8]">care</span>
              </span>
            </div>
          </div>

          {/* Right: Notification Bell & Profile/Calendar Drawer Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('alerts')}
              className="p-2 text-[#5A7799] hover:text-[#2F78C8] relative rounded-xl hover:bg-[#F4F8FD] transition-colors"
              title="Cảnh báo"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
              )}
            </button>

            {/* Profile Avatar & Calendar toggle */}
            <button
              onClick={() => setMobilePanelOpen(true)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#F4F8FD] transition-colors"
              title="Xem Lịch làm việc & Hồ sơ bác sĩ"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#173A5E] via-[#2F78C8] to-[#9EC9F3] p-[2px] shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120"
                  alt={doctorProfile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <Calendar className="w-3.5 h-3.5 text-[#2F78C8]" />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN BODY AREA                                            */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* Desktop Sidebar (hidden on mobile) */}
          <div className="hidden lg:flex shrink-0">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-[#173A5E]/40 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer Container */}
              <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
                <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content Workspace (Scrollable) */}
          <main className="flex-1 overflow-y-auto bg-white flex flex-col min-h-0 w-full">
            <div className="flex-1">
              {currentRoute === 'dashboard' && <DashboardView />}
              {currentRoute === 'patients' && <PatientsListView />}
              {currentRoute === 'patient-detail' && <PatientDetailView />}
              {currentRoute === 'recordings' && <RecordingsListView />}
              {currentRoute === 'recording-analysis' && <RecordingAnalysisView />}
              {currentRoute === 'visit-workspace' && <VisitWorkspaceView />}
              {currentRoute === 'visit-detail' && <VisitDetailView />}
              {currentRoute === 'alerts' && <AlertsView />}
              {currentRoute === 'devices' && <DevicesView />}
              {currentRoute === 'settings' && <SettingsView />}
            </div>
          </main>

          {/* Desktop Right Contextual Panel */}
          {showGlobalRightPanel && (
            <div className="hidden lg:flex shrink-0">
              <RightDoctorPanel />
            </div>
          )}

          {/* Mobile Right Doctor Panel Drawer (Profile + Calendar) */}
          {mobilePanelOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-[#173A5E]/40 backdrop-blur-xs transition-opacity"
                onClick={() => setMobilePanelOpen(false)}
              />
              {/* Drawer Container */}
              <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
                <RightDoctorPanel onCloseMobile={() => setMobilePanelOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Start Visit / Create Patient Modal */}
      <StartVisitModal />
    </div>
  );
};
