import React, { useState } from 'react';
import { Search, X, UserPlus, ArrowLeft, Check, Stethoscope } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StartVisitModal: React.FC = () => {
  const {
    isStartVisitModalOpen,
    setIsStartVisitModalOpen,
    patients,
    startNewVisit,
    createPatientAndStartVisit,
  } = useApp();

  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  // Create patient form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [backgroundDiagnosis, setBackgroundDiagnosis] = useState('');
  const [initialNote, setInitialNote] = useState('');

  if (!isStartVisitModalOpen) return null;

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.backgroundDiagnosis.toLowerCase().includes(q)
    );
  });

  const handleSelectPatient = (patientId: string) => {
    startNewVisit(patientId);
  };

  const handleCreatePatient = (startImmediately: boolean) => {
    if (!name.trim() || !age) return;

    createPatientAndStartVisit(
      {
        name: name.trim(),
        age: Number(age) || 40,
        gender,
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
        backgroundDiagnosis: backgroundDiagnosis.trim() || 'Chưa ghi nhận',
        initialNote: initialNote.trim() || undefined,
      },
      startImmediately
    );

    // Reset form
    setName('');
    setAge('');
    setPhone('');
    setBirthDate('');
    setBackgroundDiagnosis('');
    setInitialNote('');
    setMode('search');
  };

  const nextPatientCode = `PAT-${(patients.length + 1).toString().padStart(3, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#173A5E]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#9EC9F3]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7F1FB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            {mode === 'create' ? (
              <button
                type="button"
                onClick={() => setMode('search')}
                className="p-1 -ml-1 text-[#5A7799] hover:text-[#2F78C8] rounded-lg transition-colors"
                title="Quay lại tìm kiếm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#E7F1FB] text-[#2F78C8] flex items-center justify-center">
                <Stethoscope className="w-4 h-4 stroke-[2]" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-[#173A5E] tracking-tight">
                {mode === 'search' ? 'Bắt đầu lần khám' : 'Thêm bệnh nhân mới'}
              </h3>
              <p className="text-xs text-[#5A7799]">
                {mode === 'search'
                  ? 'Chọn bệnh nhân để theo dõi SpO₂ và nghe âm phổi'
                  : 'Tạo hồ sơ bệnh nhân mới vào hệ thống'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsStartVisitModalOpen(false);
              setMode('search');
            }}
            className="p-1.5 text-[#5A7799] hover:text-[#173A5E] hover:bg-[#F4F8FD] rounded-xl transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {mode === 'search' ? (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EC9F3]" />
              <input
                type="text"
                autoFocus
                placeholder="Tìm theo tên hoặc mã bệnh nhân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E] placeholder:text-[#9EC9F3] transition-all"
              />
            </div>

            {/* Patients List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="py-8 text-center text-[#5A7799] text-xs">
                  Không tìm thấy bệnh nhân phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-[#E7F1FB] hover:border-[#9EC9F3] hover:bg-[#F4F8FD]/60 transition-all bg-white shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E7F1FB] text-[#2F78C8] font-bold text-xs flex items-center justify-center border border-[#9EC9F3]/30 shrink-0">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#173A5E] group-hover:text-[#2F78C8] transition-colors">
                            {patient.name}
                          </h4>
                          <span className="font-mono text-[10px] text-[#9EC9F3] font-semibold">
                            {patient.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5A7799] mt-0.5">
                          <span>{patient.age} tuổi</span> · <span>{patient.gender}</span>
                          <span className="mx-1.5">·</span>
                          <span className="text-[#173A5E] font-medium">
                            Chẩn đoán nền: {patient.backgroundDiagnosis}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPatient(patient.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2F78C8] text-white text-xs font-semibold hover:bg-[#2563A6] transition-colors shadow-2xs shrink-0"
                    >
                      Chọn
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom: Not found prompt */}
            <div className="pt-3 border-t border-[#E7F1FB] flex items-center justify-between text-xs">
              <span className="text-[#5A7799]">Không tìm thấy bệnh nhân?</span>
              <button
                type="button"
                onClick={() => setMode('create')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#2F78C8] hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm bệnh nhân mới</span>
              </button>
            </div>
          </div>
        ) : (
          /* CREATE NEW PATIENT FORM */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePatient(true);
            }}
            className="p-6 space-y-4 overflow-y-auto flex-1"
          >
            {/* Auto Code indicator */}
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-[#5A7799]">Mã bệnh nhân dự kiến:</span>
              <span className="font-mono font-bold text-[#2F78C8] px-2 py-0.5 bg-[#E7F1FB] rounded-md">
                {nextPatientCode}
              </span>
            </div>

            {/* Required Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#173A5E] block mb-1">
                  Họ và tên <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#173A5E] block mb-1">
                    Tuổi <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="Ví dụ: 56"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#173A5E] block mb-1">
                    Giới tính <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#5A7799] block mb-1">
                    Ngày sinh (tùy chọn)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#5A7799] block mb-1">
                    Số điện thoại (tùy chọn)
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                  />
                </div>
              </div>

              {/* Background Diagnosis (Strictly Doctor Entered) */}
              <div>
                <label className="text-xs font-semibold text-[#173A5E] block mb-0.5">
                  Chẩn đoán nền
                </label>
                <p className="text-[11px] text-[#5A7799] mb-1.5 italic">
                  Thông tin do bác sĩ ghi nhận, không phải kết quả từ AI.
                </p>
                <input
                  type="text"
                  placeholder="Ví dụ: COPD, Hen phế quản, Viêm phổi..."
                  value={backgroundDiagnosis}
                  onChange={(e) => setBackgroundDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E]"
                />
              </div>

              {/* Initial Doctor Note */}
              <div>
                <label className="text-xs font-medium text-[#5A7799] block mb-1">
                  Ghi chú ban đầu của bác sĩ
                </label>
                <textarea
                  rows={2}
                  placeholder="Triệu chứng ban đầu, lý do vào theo dõi..."
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F4F8FD] border border-[#E7F1FB] rounded-xl focus:outline-none focus:border-[#2F78C8] focus:bg-white text-[#173A5E] resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E7F1FB] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMode('search')}
                className="px-3 py-2 text-xs font-medium text-[#5A7799] hover:bg-[#F4F8FD] rounded-xl transition-colors"
              >
                Hủy
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreatePatient(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#173A5E] bg-[#F4F8FD] hover:bg-[#E7F1FB] rounded-xl transition-colors border border-[#E7F1FB]"
                >
                  Lưu bệnh nhân
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2F78C8] hover:bg-[#2563A6] rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu & bắt đầu khám</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
