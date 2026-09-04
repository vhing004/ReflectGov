import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderClock,
  Search,
  Send,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Copy,
  Star,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FeedbackDetail } from '../../types';
import { feedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

export const MyFeedbacksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [feedbacks, setFeedbacks] = useState<FeedbackDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchMyFeedbacks = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await feedbackApi.getMyFeedbacks();
      setFeedbacks(data);
    } catch (err: any) {
      console.error('Error fetching my feedbacks:', err);
      setErrorMsg(err.response?.data?.message || 'Không thể tải danh sách phản ánh của bạn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyFeedbacks();
  }, [isAuthenticated]);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    // Status filter
    if (statusFilter === 'Submitted' && fb.statusName !== 'Submitted') return false;
    if (
      statusFilter === 'Processing' &&
      !['Processing', 'InProgress', 'ResolvedPendingApproval'].includes(fb.statusName)
    )
      return false;
    if (statusFilter === 'Completed' && !['Published', 'Closed'].includes(fb.statusName)) return false;
    if (statusFilter === 'Rejected' && fb.statusName !== 'Rejected') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = fb.title.toLowerCase().includes(q);
      const matchCode = fb.trackingCode.toLowerCase().includes(q);
      const matchAddress = fb.address?.toLowerCase().includes(q) || false;
      const matchCategory = fb.categoryName?.toLowerCase().includes(q) || false;
      return matchTitle || matchCode || matchAddress || matchCategory;
    }

    return true;
  });

  // Calculate statistics
  const countTotal = feedbacks.length;
  const countSubmitted = feedbacks.filter((f) => f.statusName === 'Submitted').length;
  const countProcessing = feedbacks.filter((f) =>
    ['Processing', 'InProgress', 'ResolvedPendingApproval'].includes(f.statusName)
  ).length;
  const countCompleted = feedbacks.filter((f) =>
    ['Published', 'Closed'].includes(f.statusName)
  ).length;

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* ─── Header & Greeting ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gov-700">
            <span>Cổng công dân</span>
            <span>/</span>
            <span className="text-slate-500">Hồ sơ cá nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FolderClock className="w-8 h-8 text-gov-700" />
            <span>Phản Ánh Của Tôi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Xin chào <strong className="text-slate-800">{user?.fullName}</strong>. Dưới đây là toàn bộ các phản ánh, kiến nghị bạn đã gửi lên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyFeedbacks}
            disabled={isLoading}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/submit"
            className="px-5 py-3 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Gửi phản ánh mới</span>
          </Link>
        </div>
      </div>

      {/* ─── Quick Stats Summary Bar ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-gov-50/80 border-gov-500 shadow-md ring-2 ring-gov-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng số đã gửi</span>
            <Layers className="w-4 h-4 text-gov-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{countTotal}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tất cả hồ sơ</p>
        </div>

        <div
          onClick={() => setStatusFilter('Submitted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Submitted'
              ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Chờ tiếp nhận</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{countSubmitted}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Chờ một cửa duyệt</p>
        </div>

        <div
          onClick={() => setStatusFilter('Processing')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Processing'
              ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">Đang xử lý</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">{countProcessing}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cán bộ đang khắc phục</p>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{countCompleted}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Đã nghiệm thu công khai</p>
        </div>
      </div>

      {/* ─── Search & Filters Bar ──────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, mã #PA, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-gov-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'Submitted', label: 'Tiếp nhận' },
            { id: 'Processing', label: 'Đang xử lý' },
            { id: 'Completed', label: 'Hoàn thành' },
            { id: 'Rejected', label: 'Từ chối' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#1b4d89] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── Feedbacks List ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-gov-700 flex items-center justify-center mx-auto shadow-inner">
            <FolderClock className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Không tìm thấy phản ánh phù hợp'
                : 'Bạn chưa gửi phản ánh nào'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc để hiển thị nhiều kết quả hơn.'
                : 'Khi phát hiện các vấn đề về giao thông, môi trường, trật tự đô thị... hãy gửi phản ánh để cơ quan chức năng hỗ trợ bạn kịp thời.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi phản ánh ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        /* List Cards */
        <div className="space-y-4">
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              onClick={() => navigate(`/track?code=${fb.trackingCode}`)}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-gov-500 shadow-sm hover:shadow-lg transition-all cursor-pointer space-y-4 group"
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-black text-gov-700 bg-gov-50 px-2.5 py-1 rounded-lg border border-gov-200 flex items-center gap-1.5">
                    #{fb.trackingCode}
                    <button
                      onClick={(e) => handleCopy(fb.trackingCode, e)}
                      title="Sao chép mã"
                      className="text-slate-400 hover:text-gov-700 transition-colors p-0.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedCode === fb.trackingCode && (
                      <span className="text-[10px] text-emerald-600 font-sans font-bold">Đã chép!</span>
                    )}
                  </span>
                  <StatusBadge status={fb.statusName} />
                  <PriorityBadge priority={fb.priority} />
                  {fb.categoryName && (
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {fb.categoryIcon || '📌'} {fb.categoryName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(fb.createdAt).toLocaleString('vi-VN')}
                  </span>
                  {fb.slaDeadline && (
                    <span className={`flex items-center gap-1 font-semibold ${fb.isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {fb.slaLabel || new Date(fb.slaDeadline).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Middle: Title & Content & Thumbnails */}
              <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-gov-700 transition-colors">
                    {fb.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {fb.content}
                  </p>
                  {fb.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{fb.address}</span>
                    </div>
                  )}
                </div>

                {/* Attachments preview snippet */}
                {fb.attachments && fb.attachments.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    {fb.attachments.slice(0, 3).map((att) => (
                      <div key={att.id} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                        <img
                          src={att.filePath}
                          alt="Ảnh đính kèm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {fb.attachments.length > 3 && (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
                        +{fb.attachments.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom: Assigned unit & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 flex items-center gap-2">
                  <span>Đơn vị thụ lý:</span>
                  <strong className="text-slate-800 font-semibold">
                    {fb.assignedDepartmentName || 'Bộ phận tiếp nhận Một Cửa'}
                  </strong>
                </div>

                <div className="flex items-center gap-3">
                  {/* Rating display */}
                  {fb.rating ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Đã đánh giá: {fb.rating.score}/5</span>
                    </div>
                  ) : (
                    (fb.statusName === 'Published' || fb.statusName === 'Closed') && (
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⭐ Chờ bạn đánh giá
                      </span>
                    )
                  )}

                  <div className="inline-flex items-center gap-1 text-gov-700 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Xem chi tiết tiến độ</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
