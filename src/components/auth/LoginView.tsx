import React, { useState } from 'react';
import { Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { navigate, doctorProfile } = useApp();
  const [email, setEmail] = useState('nam.nguyen@respicare.med.vn');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#E7F1FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#9EC9F3]/30 shadow-[0_20px_50px_rgba(23,58,94,0.06)] space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center mx-auto mb-3 border border-[#9EC9F3]/40">
            <Stethoscope className="w-6 h-6 stroke-[2]" />
          </div>

          <span className="text-xs font-semibold tracking-wider text-[#5A7799] uppercase block">
            ITxMech
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#173A5E]">
            RESPI<span className="text-[#2F78C8]">care</span>
          </h1>
          <p className="text-xs text-[#5A7799]">
            Hệ thống AIoT hỗ trợ theo dõi hô hấp
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5A7799]">
              Email bác sĩ
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#5A7799]">
                Mật khẩu
              </label>
              <button type="button" className="text-[11px] text-[#2F78C8] hover:underline">
                Quên mật khẩu?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
          >
            <span>Đăng nhập với tư cách {doctorProfile.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E7F1FB] flex items-center justify-center gap-2 text-[11px] text-[#5A7799]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F78C8]" />
          <span>Bảo mật dữ liệu y tế theo tiêu chuẩn lâm sàng</span>
        </div>
      </div>
    </div>
  );
};
