import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Kanban,
  Table as TableIcon,
  Search,
  Filter,
  Clock,
  MapPin,
  Building,
  User as UserIcon,
  Plus,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  CheckCheck,
  UserPlus,
  Wrench,
  Shield,
} from 'lucide-react';
import {
  Category,
  Department,
  FeedbackDetail,
  FeedbackStatus,
  PagedResult,
} from '../../types';
import { adminFeedbackApi, masterDataApi } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  FeedbackActionModal,
  ActionModalType,
} from './FeedbackActionModal';

export const FeedbackManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // User Role Permissions
  const userRole = user?.role || 'Officer';
  const isDispatcherOrAdmin = userRole === 'Admin' || userRole === 'Dispatcher';
  const isOfficerOrAdmin = userRole === 'Admin' || userRole === 'Officer';
  const isAdmin = userRole === 'Admin';

  // Filters state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);

  // Master Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Feedbacks Data
  const [feedbacks, setFeedbacks] = useState<FeedbackDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Action state
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackDetail | null>(null);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await adminFeedbackApi.getFeedbacksPaged({
        page,
        pageSize: 50,
        search: searchKeyword || undefined,
        categoryId: selectedCategory || undefined,
        departmentId: selectedDepartment || undefined,
        priority: selectedPriority || undefined,
        isOverdue: isOverdueOnly ? true : undefined,
      });
      setFeedbacks(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [cats, depts] = await Promise.all([
          masterDataApi.getCategories(),
          masterDataApi.getDepartments(),
        ]);
        setCategories(cats);
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMaster();
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, selectedCategory, selectedDepartment, selectedPriority, isOverdueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeedbacks();
  };

  const openActionModal = (type: ActionModalType, fb: FeedbackDetail) => {
    // Permission validation before opening
    if ((type === 'verify' || type === 'assign') && !isDispatcherOrAdmin) {
      alert('Chức năng Thẩm tra và Phân công chỉ dành cho Cán bộ Tiếp nhận Một Cửa (Dispatcher) hoặc Quản trị viên (Admin).');
      return;
    }
    if ((type === 'progress' || type === 'resolve') && !isOfficerOrAdmin) {
      alert('Chức năng Cập nhật tiến độ và Báo cáo hoàn thành hiện trường chỉ dành cho Cán bộ Hiện Trường (Officer) hoặc Quản trị viên (Admin).');
      return;
    }
    if (type === 'approve' && !isAdmin) {
      alert('Chức năng Phê duyệt nghiệm thu công khai chỉ dành cho Lãnh đạo / Quản trị viên (Admin).');
      return;
    }

    setActiveFeedback(fb);
    setModalType(type);
  };

  const handleModalSuccess = (updated: FeedbackDetail) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Grouping for Kanban columns
  const openColumn = feedbacks.filter(
    (f) => f.statusName === 'Submitted' || f.statusName === 'Rejected'
  );
  const inProgressColumn = feedbacks.filter(
    (f) =>
      f.statusName === 'Processing' ||
      f.statusName === 'InProgress' ||
      f.statusName === 'ResolvedPendingApproval'
  );
  const resolvedColumn = feedbacks.filter(
    (f) => f.statusName === 'Published' || f.statusName === 'Closed'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Top Bar: Title & View Switcher ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Hồ Sơ Phản Ánh
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gov-100 text-gov-800 border border-gov-200">
              Quyền: {userRole === 'Admin' ? '👑 Lãnh đạo' : userRole === 'Dispatcher' ? '📋 Tiếp nhận' : '🚗 Cán bộ'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng số: <span className="font-bold text-slate-900">{totalCount}</span> hồ sơ trong hệ thống
            {user?.departmentName && ` • Đơn vị: ${user.departmentName}`}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl self-start sm:self-auto border border-slate-300/60">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-white text-gov-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-gov-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Bảng danh sách</span>
          </button>
        </div>
      </div>

      {/* ─── Role Duty Helper Alert ─────────────────────────────────────── */}
      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-gov-900">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gov-700 shrink-0" />
          <span>
            {userRole === 'Admin' && '👑 Quyền Quản trị viên / Lãnh đạo: Toàn quyền điều phối, chỉ đạo và Phê duyệt công khai kết quả xử lý.'}
            {userRole === 'Dispatcher' && '📋 Quyền Cán bộ Tiếp nhận: Chuyên trách Thẩm tra tính hợp lệ và Phân công đơn vị/cán bộ thụ lý & Hạn cam kết SLA.'}
            {userRole === 'Officer' && '🚗 Quyền Cán bộ Hiện trường: Chuyên trách Cập nhật tiến độ khắc phục và Nộp báo cáo hoàn thành nghiệm thu hiện trường.'}
          </span>
        </div>
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:bg-white focus-within:border-gov-600">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mã hồ sơ (#REP-...)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-900 font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-gov-600"
          >
            <option value="">Tất cả Lĩnh vực</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-gov-600"
          >
            <option value="">Tất cả Phòng ban</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:border-gov-600"
          >
            <option value="">Mọi mức độ ưu tiên</option>
            <option value="Urgent">Khẩn cấp (Urgent)</option>
            <option value="High">Cao (High)</option>
            <option value="Normal">Bình thường (Normal)</option>
            <option value="Low">Thấp (Low)</option>
          </select>

          {/* Overdue checkbox */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => {
                setIsOverdueOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span>Chỉ xem Quá hạn (Overdue)</span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs shadow transition-all cursor-pointer shrink-0"
          >
            Lọc hồ sơ
          </button>
        </form>
      </div>

      {/* ─── KANBAN VIEW (Stitch Mockup 23ce95feb80543f6875ad92630990d4a) ── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: OPEN */}
          <div className="bg-slate-100/90 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                  Chờ Tiếp Nhận (Open)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-mono">
                {openColumn.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {openColumn.map((fb) => (
                <KanbanCard
                  key={fb.id}
                  feedback={fb}
                  userRole={userRole}
                  onVerify={() => openActionModal('verify', fb)}
                  onAssign={() => openActionModal('assign', fb)}
                  onProgress={() => openActionModal('progress', fb)}
                  onResolve={() => openActionModal('resolve', fb)}
                  onApprove={() => openActionModal('approve', fb)}
                />
              ))}
              {openColumn.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Không có hồ sơ chờ tiếp nhận
                </div>
              )}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="bg-slate-100/90 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                  Đang Xử Lý (In Progress)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                {inProgressColumn.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {inProgressColumn.map((fb) => (
                <KanbanCard
                  key={fb.id}
                  feedback={fb}
                  userRole={userRole}
                  onVerify={() => openActionModal('verify', fb)}
                  onAssign={() => openActionModal('assign', fb)}
                  onProgress={() => openActionModal('progress', fb)}
                  onResolve={() => openActionModal('resolve', fb)}
                  onApprove={() => openActionModal('approve', fb)}
                />
              ))}
              {inProgressColumn.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Không có hồ sơ đang xử lý
                </div>
              )}
            </div>
          </div>

          {/* Column 3: RESOLVED */}
          <div className="bg-slate-100/90 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                  Hoàn Thành (Resolved)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                {resolvedColumn.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {resolvedColumn.map((fb) => (
                <KanbanCard
                  key={fb.id}
                  feedback={fb}
                  userRole={userRole}
                  onVerify={() => openActionModal('verify', fb)}
                  onAssign={() => openActionModal('assign', fb)}
                  onProgress={() => openActionModal('progress', fb)}
                  onResolve={() => openActionModal('resolve', fb)}
                  onApprove={() => openActionModal('approve', fb)}
                />
              ))}
              {resolvedColumn.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                  Chưa có hồ sơ nghiệm thu
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TABLE VIEW ─────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Mã hồ sơ</th>
                  <th className="py-3.5 px-4">Tiêu đề phản ánh</th>
                  <th className="py-3.5 px-4">Lĩnh vực</th>
                  <th className="py-3.5 px-4">Đơn vị thụ lý</th>
                  <th className="py-3.5 px-4">Hạn mức SLA</th>
                  <th className="py-3.5 px-4">Ưu tiên</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Tác vụ theo vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gov-700">
                      #{fb.trackingCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {fb.title}
                    </td>
                    <td className="py-3.5 px-4">{fb.categoryName}</td>
                    <td className="py-3.5 px-4">
                      {fb.assignedDepartmentName || (
                        <span className="text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          fb.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {fb.slaLabel || '72h'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={fb.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={fb.statusName} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Dispatcher Actions */}
                      {isDispatcherOrAdmin && fb.statusName === 'Submitted' && (
                        <>
                          <button
                            onClick={() => openActionModal('verify', fb)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-gov-700 font-bold cursor-pointer"
                          >
                            Thẩm tra
                          </button>
                          <button
                            onClick={() => openActionModal('assign', fb)}
                            className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
                          >
                            Phân công
                          </button>
                        </>
                      )}

                      {/* Officer Actions */}
                      {isOfficerOrAdmin && (fb.statusName === 'Processing' || fb.statusName === 'InProgress') && (
                        <>
                          <button
                            onClick={() => openActionModal('progress', fb)}
                            className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer"
                          >
                            Tiến độ
                          </button>
                          <button
                            onClick={() => openActionModal('resolve', fb)}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer"
                          >
                            Báo cáo xong
                          </button>
                        </>
                      )}

                      {/* Admin Approve Action */}
                      {isAdmin && fb.statusName === 'ResolvedPendingApproval' && (
                        <button
                          onClick={() => openActionModal('approve', fb)}
                          className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold cursor-pointer"
                        >
                          Duyệt công khai
                        </button>
                      )}

                      {/* Officer View only for Pending Approval */}
                      {!isAdmin && fb.statusName === 'ResolvedPendingApproval' && (
                        <span className="text-[11px] text-amber-600 font-semibold italic">
                          Chờ Lãnh đạo duyệt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <FeedbackActionModal
        type={modalType}
        feedback={activeFeedback}
        onClose={() => {
          setModalType(null);
          setActiveFeedback(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

// ─── Individual Kanban Card Component ─────────────────────────────────────
const KanbanCard: React.FC<{
  feedback: FeedbackDetail;
  userRole: string;
  onVerify: () => void;
  onAssign: () => void;
  onProgress: () => void;
  onResolve: () => void;
  onApprove: () => void;
}> = ({ feedback, userRole, onVerify, onAssign, onProgress, onResolve, onApprove }) => {
  const isDispatcherOrAdmin = userRole === 'Admin' || userRole === 'Dispatcher';
  const isOfficerOrAdmin = userRole === 'Admin' || userRole === 'Officer';
  const isAdmin = userRole === 'Admin';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all space-y-3">
      {/* Card Header: Tracking Code & SLA timer */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
          #{feedback.trackingCode}
        </span>

        {/* SLA Timer Indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
            feedback.isOverdue
              ? 'bg-rose-100 text-rose-700 font-extrabold animate-pulse'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{feedback.slaLabel || 'SLA'}</span>
        </div>
      </div>

      {/* Title & snippet */}
      <div>
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
          {feedback.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{feedback.content}</p>
      </div>

      {/* Category & Address */}
      <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">
            {feedback.categoryIcon} {feedback.categoryName}
          </span>
          <PriorityBadge priority={feedback.priority} />
        </div>

        {feedback.address && (
          <div className="flex items-center gap-1 text-slate-400 truncate">
            <MapPin className="w-3 h-3 text-gov-600 shrink-0" />
            <span className="truncate">{feedback.address}</span>
          </div>
        )}
      </div>

      {/* Assignee Footer & Action Buttons (Strictly filtered by Role) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
            {feedback.assignedUserName ? feedback.assignedUserName.charAt(0) : '?'}
          </div>
          <span className="truncate text-xs font-semibold">
            {feedback.assignedUserName || feedback.assignedDepartmentName || 'Chưa giao'}
          </span>
        </div>

        {/* Dynamic Action Buttons based strictly on Role and Status */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Dispatcher Actions on Submitted */}
          {isDispatcherOrAdmin && feedback.statusName === 'Submitted' && (
            <>
              <button
                onClick={onVerify}
                title="Thẩm tra tiếp nhận"
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={onAssign}
                title="Phân công cán bộ & SLA"
                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Officer Actions on Processing / InProgress */}
          {isOfficerOrAdmin && (feedback.statusName === 'Processing' || feedback.statusName === 'InProgress') && (
            <>
              <button
                onClick={onProgress}
                title="Cập nhật tiến độ hiện trường"
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
              </button>
              <button
                onClick={onResolve}
                title="Báo cáo hoàn thành & nộp ảnh nghiệm thu"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Admin Approve on ResolvedPendingApproval */}
          {isAdmin && feedback.statusName === 'ResolvedPendingApproval' && (
            <button
              onClick={onApprove}
              title="Lãnh đạo duyệt & công khai kết quả"
              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {!isAdmin && feedback.statusName === 'ResolvedPendingApproval' && (
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              Chờ duyệt
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
