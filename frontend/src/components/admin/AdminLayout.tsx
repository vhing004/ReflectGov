import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Bell,
  Search,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Bảng điều khiển KPI', path: '/admin', icon: LayoutDashboard, roles: ['Admin', 'Dispatcher', 'Officer'] },
    { label: 'Quản lý Hồ sơ Phản ánh', path: '/admin/feedbacks', icon: ClipboardList, roles: ['Admin', 'Dispatcher', 'Officer'] },
    { label: 'Quản lý Người dùng & Cán bộ', path: '/admin/users', icon: Users, roles: ['Admin'] },
  ];

  const userRole = user?.role || 'Officer';
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/admin/login');
  };

  return (
    <>
      <div className="min-h-screen flex bg-slate-100 font-sans">
        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 bg-[#0f294a] text-white flex flex-col shrink-0 shadow-2xl z-30 hidden md:flex border-r border-white/5">
          {/* Brand */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-gov-900 shadow">
              <ShieldCheck className="w-6 h-6 text-[#1b4d89]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white uppercase">
                  Reflect<span className="text-amber-400">Gov</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 font-medium">Bàn Làm Việc Cán Bộ</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Phân hệ Quản trị ({userRole})
            </p>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? 'bg-[#1b4d89] text-white shadow-md ring-1 ring-white/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-6 border-t border-white/10 mt-6 space-y-1.5">
              <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Liên kết ngoài
              </p>
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Về Cổng Người Dân</span>
              </Link>
            </div>
          </nav>

          {/* User Card & Logout */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Cán bộ quản trị'}</p>
                <p className="text-[11px] text-amber-300 truncate font-semibold">
                  {userRole === 'Admin' ? '👑 Quản trị viên' : userRole === 'Dispatcher' ? '📋 Tiếp nhận Một Cửa' : '🚗 Cán bộ Đơn vị'}
                  {user?.departmentName ? ` • ${user.departmentName}` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Đăng xuất khỏi bàn làm việc"
                className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Area ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <Link to="/" className="md:hidden flex items-center gap-2 text-gov-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" /> ReflectGov
              </Link>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Chính quyền số IOC • Vai trò: <strong className="text-gov-700">{userRole}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors relative">
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
                </button>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1b4d89] text-white flex items-center justify-center font-bold text-xs shadow">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-800">
                    {user?.fullName}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    {user?.username} ({userRole})
                  </span>
                </div>
              </div>

              {/* Prominent Topbar Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-sm cursor-pointer ml-1"
                title="Đăng xuất khỏi phiên làm việc"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </header>

          {/* Dynamic page outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Officer Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Xác Nhận Đăng Xuất Cán Bộ"
        message="Bạn có chắc chắn muốn kết thúc phiên làm việc công vụ và đăng xuất khỏi hệ thống IOC không?"
        confirmText="Đăng xuất ngay"
        cancelText="Tiếp tục làm việc"
        variant="danger"
        icon="logout"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
