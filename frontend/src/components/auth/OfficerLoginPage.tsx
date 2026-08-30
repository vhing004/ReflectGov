import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Car,
  TreePine,
  Landmark,
  FileCheck2,
  Crown,
  KeyRound,
  ShieldAlert,
  Fingerprint,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DepartmentRoleItem {
  id: string;
  username: string;
  departmentName: string;
  roleTitle: string;
  officerName: string;
  roleBadge: string;
  roleBadgeColor: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  duties: string;
  authority: string;
}

const OFFICIAL_DEPARTMENTS: DepartmentRoleItem[] = [
  {
    id: 'tiepnhan',
    username: 'tiepnhan',
    departmentName: 'Bộ Phận Tiếp Nhận & Trả Kết Quả Một Cửa',
    roleTitle: 'Cán Bộ Tiếp Nhận & Điều Phối',
    officerName: 'Bà Trần Thị Tiếp Nhận',
    roleBadge: 'Dispatcher',
    roleBadgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    icon: FileCheck2,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    duties: 'Tiếp nhận hồ sơ mới từ công dân, Thẩm tra tính hợp lệ, Phân công đơn vị thụ lý và Thiết lập hạn cam kết SLA.',
    authority: 'Thẩm tra • Phân công • Đặt SLA',
  },
  {
    id: 'admin',
    username: 'admin',
    departmentName: 'Văn Phòng UBND / Ban Quản Trị Hệ Thống',
    roleTitle: 'Lãnh Đạo Phê Duyệt & Quản Trị Viên',
    officerName: 'Ông Nguyễn Văn Quản Trị',
    roleBadge: 'Admin (Lãnh Đạo)',
    roleBadgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    icon: Crown,
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    duties: 'Giám sát toàn diện Dashboard KPI, Nghiệm thu phê duyệt công khai kết quả xử lý của cán bộ và Quản trị danh sách cán bộ.',
    authority: 'Nghiệm thu duyệt • Quản trị cán bộ',
  },
  {
    id: 'canbo_giaothong',
    username: 'canbo_giaothong',
    departmentName: 'Đơn Vị Quản Lý Giao Thông & Hạ Tầng',
    roleTitle: 'Cán Bộ Kỹ Thuật Hiện Trường',
    officerName: 'Ông Vũ Tuấn Giao Thông',
    roleBadge: 'Officer (Hiện Trường)',
    roleBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    icon: Car,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    duties: 'Xử lý mặt đường sụt lún, ổ gà, nắp cống hư hỏng, đèn tín hiệu giao thông, cập nhật tiến độ và nộp ảnh nghiệm thu.',
    authority: 'Cập nhật tiến độ • Nộp ảnh hoàn thành',
  },
  {
    id: 'canbo_moitruong',
    username: 'canbo_moitruong',
    departmentName: 'Phòng Tài Nguyên & Môi Trường',
    roleTitle: 'Cán Bộ Kỹ Thuật Hiện Trường',
    officerName: 'Ông Phạm Minh Môi Trường',
    roleBadge: 'Officer (Hiện Trường)',
    roleBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    icon: TreePine,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    duties: 'Xử lý điểm tập kết rác thải tự phát, ô nhiễm nguồn nước, cống rãnh tắc nghẽn, cập nhật tiến độ và nộp ảnh nghiệm thu.',
    authority: 'Cập nhật tiến độ • Nộp ảnh hoàn thành',
  },
  {
    id: 'canbo_dothi',
    username: 'canbo_dothi',
    departmentName: 'Đội Quản Lý Trật Tự Đô Thị & Xây Dựng',
    roleTitle: 'Cán Bộ Kỹ Thuật Hiện Trường',
    officerName: 'Ông Lê Hoàng Đô Thị',
    roleBadge: 'Officer (Hiện Trường)',
    roleBadgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    icon: Landmark,
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    duties: 'Xử lý lấn chiếm vỉa hè, biển quảng cáo sai quy định, cây xanh gãy đổ, cập nhật tiến độ và nộp ảnh nghiệm thu.',
    authority: 'Cập nhật tiến độ • Nộp ảnh hoàn thành',
  },
];

export const OfficerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1: Verification PIN
  const [pinCode, setPinCode] = useState('GOV-2026');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Step 2: Officer Credentials
  const [selectedDeptId, setSelectedDeptId] = useState<string>('tiepnhan');
  const [username, setUsername] = useState('tiepnhan');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedDepartment = OFFICIAL_DEPARTMENTS.find((d) => d.id === selectedDeptId) || OFFICIAL_DEPARTMENTS[0];

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim().toUpperCase();
    if (cleanPin === 'GOV-2026' || cleanPin === '8888' || cleanPin === 'ADMIN') {
      setIsPinVerified(true);
      setPinError(null);
    } else {
      setPinError('Mã định danh bảo mật công vụ không chính xác. Vui lòng liên hệ quản trị IOC.');
    }
  };

  const handleSelectDepartment = (dept: DepartmentRoleItem) => {
    setSelectedDeptId(dept.id);
    setUsername(dept.username);
    setPassword('123456');
    setErrorMsg(null);
  };

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const auth = await login({ username: username.trim(), password });
      if (auth.role === 'Citizen') {
        setErrorMsg('Tài khoản này là tài khoản Công dân, không có quyền truy cập Bàn làm việc Cán bộ.');
        setIsLoading(false);
        return;
      }
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Tài khoản cán bộ hoặc mật khẩu công vụ không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg font-bold">
            <ShieldCheck className="w-6 h-6 text-[#1b4d89]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white uppercase">
              Reflect<span className="text-amber-400">Gov</span> <span className="text-xs text-blue-300 font-mono">IOC SECURE</span>
            </span>
            <p className="text-[11px] text-slate-400">Phân Hệ Xác Thực Cán Bộ Điều Hành Nội Bộ</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Về Cổng Công Dân
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto my-8">
        {/* ─── LỚP 1: BẢO MẬT MÃ PIN CƠ QUAN (NẾU CHƯA NHẬP PIN) ───────── */}
        {!isPinVerified ? (
          <div className="max-w-md mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">Xác Thực Mã Định Danh Công Vụ</h2>
              <p className="text-xs text-slate-400 mt-1">
                Khu vực nội bộ dành riêng cho Cán bộ & Lãnh đạo cơ quan nhà nước. Vui lòng nhập Mã bảo mật cơ quan (PIN).
              </p>
            </div>

            {pinError && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mã Bảo Mật Cơ Quan (Gov PIN)
                  </label>
                  <span className="text-[11px] text-amber-400/80 font-mono font-bold">Mẫu: GOV-2026</span>
                </div>
                <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-3.5 py-3 bg-slate-950/60 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <Fingerprint className="w-5 h-5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Nhập GOV-2026..."
                    className="w-full bg-transparent text-sm text-white font-mono font-bold uppercase outline-none tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Xác Thực Truy Cập Nội Bộ</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-500">
              * Người dân thông thường vui lòng quay lại <strong className="text-slate-400">Cổng Dịch Vụ Công</strong>.
            </p>
          </div>
        ) : (
          /* ─── LỚP 2: ĐÃ XÁC THỰC PIN -> CHỌN BỘ PHẬN & ĐĂNG NHẬP ──────── */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Verified Badge Header */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-5 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Đã Xác Thực Mã Công Vụ Hợp Lệ ({pinCode.toUpperCase()})</span>
              </div>
              <button
                onClick={() => setIsPinVerified(false)}
                className="text-slate-400 hover:text-rose-300 font-semibold cursor-pointer underline text-[11px]"
              >
                Khóa lại
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột Trái (7 Cột): 5 Bộ phận xử lý */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-slate-200 font-extrabold text-sm sm:text-base">
                    <Building className="w-5 h-5 text-amber-400" />
                    <span>Bộ Phận Xử Lý Chuyên Trách ({OFFICIAL_DEPARTMENTS.length})</span>
                  </div>
                  <span className="text-xs text-slate-400">Chọn để điền tài khoản</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OFFICIAL_DEPARTMENTS.map((dept) => {
                    const IconComponent = dept.icon;
                    const isSelected = selectedDeptId === dept.id;

                    return (
                      <div
                        key={dept.id}
                        onClick={() => handleSelectDepartment(dept)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30 -translate-y-0.5'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className={`w-10 h-10 rounded-xl ${dept.iconBg} ${dept.iconColor} flex items-center justify-center shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dept.roleBadgeColor}`}>
                            {dept.roleBadge}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-white leading-snug">
                            {dept.departmentName}
                          </h3>
                          <p className="text-[11px] text-amber-400 font-semibold mt-1">
                            {dept.officerName} • <span className="text-slate-400 font-normal">{dept.roleTitle}</span>
                          </p>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {dept.duties}
                        </p>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-300 truncate mr-2">
                            🔑 {dept.authority}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {dept.username}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột Phải (5 Cột): Form Đăng Nhập Cán Bộ */}
              <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-400/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      Bộ phận đã chọn:
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedDepartment.roleBadgeColor}`}>
                      {selectedDepartment.roleBadge}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">
                    {selectedDepartment.departmentName}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Cán bộ: <strong>{selectedDepartment.officerName}</strong>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleOfficerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tên tài khoản công vụ
                    </label>
                    <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-950/60 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin, tiepnhan, canbo_giaothong..."
                        className="w-full bg-transparent text-sm text-white outline-none font-semibold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">Mật khẩu xác thực</label>
                      <span className="text-[11px] text-slate-400">Mẫu: 123456</span>
                    </div>
                    <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-950/60 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-transparent text-sm text-white outline-none font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>Đăng Nhập Vào Bàn Làm Việc</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 border-t border-slate-800/80 text-xs text-slate-500">
        Hệ Thống Trung Tâm Giám Sát & Điều Hành Thông Minh (IOC) • ReflectGov © 2026
      </div>
    </div>
  );
};
