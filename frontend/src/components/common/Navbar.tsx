import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Send,
  Search,
  MapPin,
  Home,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  FolderClock,
} from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

export const Navbar: React.FC = () => {
  const { user, logout, isAdminOrStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const isCitizenUser = user && !isAdminOrStaff;

  const navLinks = [
    { name: "Trang chủ", path: "/", icon: Home },
    { name: "Gửi phản ánh", path: "/submit", icon: Send },
    ...(isCitizenUser
      ? [{ name: "Phản ánh của tôi", path: "/my-feedbacks", icon: FolderClock }]
      : []),
    { name: "Tra cứu tiến độ", path: "/track", icon: Search },
    { name: "Bản đồ số", path: "/map", icon: MapPin },
  ];

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1b4d89] text-white shadow-md border-b border-[#2762bf]/40">
        {/* Top micro bar */}
        <div className="bg-[#0f294a] text-xs py-1 px-4 text-slate-300 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2 container mx-auto max-w-7xl">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Hệ thống tiếp nhận phản ánh, kiến nghị công dân trực tuyến 24/7
            </span>
            <span className="hidden md:inline text-slate-400">
              | Tổng đài hỗ trợ: 1211 2004
            </span>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg border-2 border-white/20 text-gov-900 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#1b4d89]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white uppercase">
                    Reflect<span className="text-amber-400">Gov</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded">
                    Portal
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-blue-100/80 font-medium">
                  Cổng Phản Ánh & Giám Sát Đô Thị
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? "bg-white/15 text-white shadow-inner border border-white/20"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? "text-amber-400" : "text-blue-200"}`}
                    />
                    {link.name}
                  </Link>
                );
              })}

              {isAdminOrStaff && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all ml-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Bàn làm việc Cán bộ
                </Link>
              )}
            </nav>

            {/* Right Action: User / Login */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                  <Link
                    to={isCitizenUser ? "/my-feedbacks" : "/admin"}
                    className="text-right hover:opacity-80 transition-opacity"
                    title={isCitizenUser ? "Xem phản ánh của tôi" : "Bàn làm việc"}
                  >
                    <p className="text-xs font-bold text-white leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-amber-300 font-medium">
                      {isCitizenUser ? "Công dân • Hồ sơ" : user.role}
                    </p>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Đăng xuất"
                    className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f294a] border-t border-white/10 px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 text-amber-400" />
                  {link.name}
                </Link>
              );
            })}

            {isAdminOrStaff && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-amber-500 text-slate-950"
              >
                <LayoutDashboard className="w-5 h-5" />
                Bàn làm việc Cán bộ
              </Link>
            )}

            <div className="pt-3 border-t border-white/10">
              {user ? (
                <div className="flex items-center justify-between px-2">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-amber-300">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/80 text-xs font-semibold text-white cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/10 text-sm font-bold text-white"
                >
                  <UserIcon className="w-4 h-4" /> Đăng nhập công dân
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Xác Nhận Đăng Xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="danger"
        icon="logout"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
