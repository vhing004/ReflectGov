import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  UserX,
  Building,
  Mail,
  Phone,
  Lock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Department, User, UserRole } from '../../types';
import { masterDataApi } from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Role Protection
  const isAdmin = currentUser?.role === 'Admin';

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Toggle Confirm Modal State
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const [userList, deptList] = await Promise.all([
        masterDataApi.getUsers({
          departmentId: selectedDept || undefined,
          role: selectedRole || undefined,
        }),
        masterDataApi.getDepartments(),
      ]);
      setUsers(userList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedDept, selectedRole, isAdmin]);

  const handleConfirmToggleActive = async () => {
    if (!confirmUser) return;
    try {
      await masterDataApi.toggleUserActive(confirmUser.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === confirmUser.id ? { ...u, isActive: !u.isActive } : u))
      );
      setActionSuccessMsg(
        `Đã ${confirmUser.isActive ? 'tạm khóa' : 'mở khóa kích hoạt'} tài khoản [${confirmUser.fullName}] thành công!`
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to toggle user status', err);
      alert('Không thể thay đổi trạng thái tài khoản.');
    } finally {
      setConfirmUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchKeyword.toLowerCase().trim();
    if (!term) return true;
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(term))
    );
  });

  // If not Admin, show restricted screen
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Truy Cập Bị Giới Hạn</h2>
        <p className="text-xs text-slate-500">
          Chức năng Quản lý Cán bộ & Tài khoản chỉ dành riêng cho <strong>Quản trị viên (Admin)</strong>. Vai trò hiện tại của bạn là <strong>{currentUser?.role || 'Cán bộ'}</strong>.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="px-5 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quản Lý Cán Bộ & Người Dùng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Danh sách cán bộ điều phối, cán bộ hiện trường và phân quyền truy cập hệ thống.
        </p>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:bg-white focus-within:border-gov-600">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, username, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-900 font-medium"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-gov-600"
        >
          <option value="">Tất cả Phòng ban</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-gov-600"
        >
          <option value="">Mọi vai trò</option>
          <option value="Admin">Quản trị viên (Admin)</option>
          <option value="Dispatcher">Tiếp nhận Một Cửa (Dispatcher)</option>
          <option value="Officer">Cán bộ hiện trường (Officer)</option>
          <option value="Citizen">Công dân (Citizen)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Tên tài khoản</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Phòng ban trực thuộc</th>
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1b4d89] text-white flex items-center justify-center font-bold text-xs">
                      {u.fullName.charAt(0)}
                    </div>
                    <span>{u.fullName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-gov-700">
                    {u.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : u.role === 'Dispatcher'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : u.role === 'Officer'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.departmentName ? (
                      <span className="font-medium text-slate-800">{u.departmentName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Toàn hệ thống</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5 text-slate-500">
                    {u.email && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    )}
                    {u.phoneNumber && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.phoneNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {u.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setConfirmUser(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        u.isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmUser}
        title={confirmUser?.isActive ? 'Xác Nhận Tạm Khóa Tài Khoản' : 'Xác Nhận Mở Khóa Tài Khoản'}
        message={
          confirmUser?.isActive
            ? `Bạn có chắc chắn muốn tạm khóa tài khoản của cán bộ [${confirmUser?.fullName}] (@${confirmUser?.username}) không? Cán bộ này sẽ tạm thời không thể đăng nhập vào hệ thống.`
            : `Bạn có chắc chắn muốn mở khóa kích hoạt lại tài khoản của cán bộ [${confirmUser?.fullName}] (@${confirmUser?.username}) không?`
        }
        confirmText={confirmUser?.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy bỏ"
        variant={confirmUser?.isActive ? 'danger' : 'primary'}
        icon={confirmUser?.isActive ? 'warning' : 'question'}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setConfirmUser(null)}
      />
    </div>
  );
};
