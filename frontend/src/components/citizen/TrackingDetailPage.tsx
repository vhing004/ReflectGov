import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  User,
  Calendar,
  AlertCircle,
  Star,
  Send,
  Camera,
  Check,
  ChevronRight,
  ShieldCheck,
  FolderClock,
  Lock,
  Edit3,
  LogIn,
  Phone,
} from 'lucide-react';
import { FeedbackDetail } from '../../types';
import { feedbackApi } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { StarRating } from '../common/StarRating';
import { useAuth } from '../../context/AuthContext';

export const TrackingDetailPage: React.FC = () => {
  const { user, isAdminOrStaff } = useAuth();
  const isCitizen = user && !isAdminOrStaff;
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryCode, setQueryCode] = useState(searchParams.get('code') || '');
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rating State
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState('');
  const [phoneVerification, setPhoneVerification] = useState('');
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    if (isCitizen) {
      feedbackApi.getMyFeedbacks()
        .then((data) => setMyFeedbacks(data))
        .catch((err) => console.error('Error fetching my feedbacks for tracking page', err));
    }
  }, [isCitizen]);

  const fetchFeedback = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await feedbackApi.trackByCode(code.trim());
      setFeedback(data);
      if (data.rating) {
        setUserRating(data.rating.score);
        setUserComment(data.rating.comment || '');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          'Không tìm thấy hồ sơ với mã phản ánh này. Vui lòng kiểm tra lại.'
      );
      setFeedback(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setQueryCode(code);
      fetchFeedback(code);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCode.trim()) {
      setSearchParams({ code: queryCode.trim() });
      fetchFeedback(queryCode.trim());
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;
    setIsSubmittingRating(true);
    setRatingError(null);
    try {
      await feedbackApi.rateFeedback(feedback.id, {
        score: userRating,
        comment: userComment.trim(),
        phoneVerification: phoneVerification.trim() || undefined,
      });
      setRatingSuccess(true);
      setIsEditingRating(false);
      setPhoneVerification('');
      // Reload updated feedback
      fetchFeedback(feedback.trackingCode);
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setRatingError(
        err.response?.data?.message ||
          'Không thể gửi đánh giá. Vui lòng kiểm tra lại quyền đánh giá hoặc số điện thoại xác nhận.'
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Determine current active step in 4-step stepper (0: Submitted, 1: Processing, 2: InProgress, 3: Published)
  const getStepIndex = (statusStr: string) => {
    switch (statusStr) {
      case 'Submitted':
        return 0;
      case 'Processing':
        return 1;
      case 'InProgress':
      case 'ResolvedPendingApproval':
        return 2;
      case 'Published':
      case 'Closed':
        return 3;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = feedback ? getStepIndex(feedback.statusName) : 0;

  const steps = [
    { label: 'Đã tiếp nhận', desc: 'Công dân gửi phản ánh' },
    { label: 'Phân công', desc: 'Điều phối đơn vị chuyên trách' },
    { label: 'Đang xử lý', desc: 'Cán bộ khắc phục hiện trường' },
    { label: 'Hoàn thành', desc: 'Nghiệm thu & Công khai' },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gov-700">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-slate-500">Tra cứu tiến độ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tra Cứu & Giám Sát Tiến Độ Xử Lý
        </h1>
        <p className="text-sm text-slate-500">
          Nhập mã hồ sơ (Ví dụ: <span className="font-mono text-gov-700 font-bold">#RPT-8492</span> hoặc <span className="font-mono text-gov-700 font-bold">PA-2026...</span>) để xem nhật ký giải quyết chi tiết.
        </p>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl pt-2">
          <div className="flex-1 flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-sm focus-within:border-gov-600 focus-within:ring-2 focus-within:ring-gov-600/20">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Nhập mã hồ sơ (Ví dụ: #RPT-8492)..."
              value={queryCode}
              onChange={(e) => setQueryCode(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Tra cứu
          </button>
        </form>

        {/* Quick selector chips for logged-in citizens */}
        {isCitizen && myFeedbacks.length > 0 && (
          <div className="pt-2 space-y-2 max-w-3xl">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-gov-800">
                <FolderClock className="w-3.5 h-3.5 text-gov-700" />
                <span>Phản ánh của bạn ({myFeedbacks.length} hồ sơ):</span>
              </span>
              <Link to="/my-feedbacks" className="text-gov-700 hover:underline font-bold">
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {myFeedbacks.slice(0, 5).map((myFb) => (
                <button
                  key={myFb.id}
                  type="button"
                  onClick={() => {
                    setQueryCode(myFb.trackingCode);
                    setSearchParams({ code: myFb.trackingCode });
                    fetchFeedback(myFb.trackingCode);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    feedback?.id === myFb.id
                      ? 'bg-gov-50 border-gov-600 text-gov-900 ring-2 ring-gov-600/30 font-bold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-mono text-gov-700 font-bold">#{myFb.trackingCode}</span>
                  <span className="truncate max-w-[150px]">{myFb.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {myFb.statusName === 'Submitted' ? 'Chờ duyệt' : myFb.statusName === 'Published' ? 'Hoàn thành' : 'Đang xử lý'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {feedback && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* ─── 1. Main Header Card ────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg sm:text-xl font-black text-gov-700 bg-gov-50 px-3 py-1 rounded-xl border border-gov-200">
                    #{feedback.trackingCode}
                  </span>
                  <StatusBadge status={feedback.statusName} />
                  <PriorityBadge priority={feedback.priority} />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {feedback.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Gửi lúc: {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                  </span>
                  {feedback.categoryName && (
                    <span className="flex items-center gap-1 font-semibold text-gov-700">
                      {feedback.categoryIcon || '📌'} {feedback.categoryName}
                    </span>
                  )}
                </div>
              </div>

              {/* SLA Timer Badge */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 space-y-1 sm:text-right">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Hạn xử lý cam kết (SLA)
                </p>
                <div className="flex items-center gap-1.5 sm:justify-end text-sm font-extrabold">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className={feedback.isOverdue ? 'text-rose-600' : 'text-slate-800'}>
                    {feedback.slaLabel || (feedback.slaDeadline ? new Date(feedback.slaDeadline).toLocaleString('vi-VN') : '72h tiêu chuẩn')}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 4-Step Stepper ────────────────────────────────────────── */}
            <div className="py-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStep || currentStep === 3;
                  const isCurrent = idx === currentStep && currentStep !== 3;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-2 relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all z-10 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isCurrent
                            ? 'bg-gov-700 text-white ring-4 ring-gov-100 animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-400 hidden sm:block">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & Address info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-sm">
              <div className="md:col-span-2 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Nội dung phản ánh
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {feedback.content}
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Thông tin thụ lý
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gov-600 shrink-0 mt-0.5" />
                    <span>{feedback.address || 'Đang cập nhật địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gov-600 shrink-0" />
                    <span className="font-medium text-slate-900">
                      {feedback.assignedDepartmentName || 'Bộ phận tiếp nhận Một Cửa'}
                    </span>
                  </div>
                  {feedback.assignedUserName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gov-600 shrink-0" />
                      <span>Cán bộ: <span className="font-semibold text-slate-900">{feedback.assignedUserName}</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── 2. Before & After Resolution Proofs (Stitch Mockup) ──────── */}
          {(feedback.citizenUploads.length > 0 || feedback.resolutionProofs.length > 0) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gov-700" />
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Hình Ảnh Hiện Trường & Nghiệm Thu
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Đối chiếu trước và sau xử lý</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Before (Citizen Upload) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      1. Hiện trạng phản ánh (Trước xử lý)
                    </span>
                    <span className="text-[11px] text-slate-400">Do công dân gửi</span>
                  </div>
                  {feedback.citizenUploads.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {feedback.citizenUploads.map((att) => (
                        <div key={att.id} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100 group relative">
                          <img
                            src={att.filePath}
                            alt="Trước xử lý"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <a
                            href={att.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-2 right-2 text-xs bg-slate-900/80 text-white px-2 py-1 rounded-lg backdrop-blur-sm"
                          >
                            Xem ảnh gốc
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                      Không có ảnh ban đầu
                    </div>
                  )}
                </div>

                {/* After (Resolution Proof) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      2. Kết quả nghiệm thu (Sau xử lý)
                    </span>
                    <span className="text-[11px] text-slate-400">Do cán bộ chụp</span>
                  </div>
                  {feedback.resolutionProofs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {feedback.resolutionProofs.map((att) => (
                        <div key={att.id} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100 group relative">
                          <img
                            src={att.filePath}
                            alt="Sau xử lý"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <a
                            href={att.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-2 right-2 text-xs bg-slate-900/80 text-white px-2 py-1 rounded-lg backdrop-blur-sm"
                          >
                            Xem ảnh gốc
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 p-6 text-center space-y-2 bg-slate-50">
                      <Clock className="w-8 h-8 text-slate-300 animate-pulse" />
                      <p className="font-semibold text-slate-600">Đang tiến hành khắc phục</p>
                      <p>Ảnh nghiệm thu sẽ được cán bộ cập nhật ngay khi hoàn tất.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Summary note */}
              {feedback.resolutionSummary && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 text-sm">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Báo cáo kết quả xử lý từ cơ quan:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                    {feedback.resolutionSummary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── 3. Audit Trail Logs Timeline ───────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-4">
              Nhật Ký Tiến Trình Xử Lý Chi Tiết
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {feedback.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center text-xs shadow-md shrink-0 ring-4 ring-white z-10">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 space-y-1 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900">
                        {log.actorName} <span className="font-normal text-slate-400">({log.actorRole})</span>
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {log.note || log.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 4. Citizen Rating & Feedback (If Published) ─────────────── */}
          {(feedback.statusName === 'Published' || feedback.statusName === 'Closed') && (() => {
            const currentUserId = user ? ('id' in user ? user.id : user.userId) : null;
            const isOwner = Boolean(currentUserId && feedback.citizenId && currentUserId === feedback.citizenId);
            const isAnonymousFeedback = !feedback.citizenId;
            const hasRating = Boolean(feedback.rating);

            return (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200 space-y-5">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Đánh Giá Mức Độ Hài Lòng Của Người Dân
                    </h3>
                  </div>

                  {hasRating && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã ghi nhận đánh giá
                    </span>
                  )}
                </div>

                {ratingError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{ratingError}</span>
                  </div>
                )}

                {ratingSuccess && (
                  <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cảm ơn bạn! Đánh giá chất lượng phục vụ đã được lưu thành công.
                  </div>
                )}

                {/* ─── CASE 1: Cán bộ đang thi hành công vụ (Read-only) ─── */}
                {isAdminOrStaff ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span>Điểm đánh giá hiện tại từ công dân:</span>
                      {hasRating ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-extrabold text-xs">
                          {feedback.rating!.score} / 5 ⭐
                        </span>
                      ) : (
                        <span className="text-slate-500 italic font-normal">Chưa có đánh giá</span>
                      )}
                    </div>
                    {feedback.rating?.comment && (
                      <p className="italic text-slate-700 bg-white/70 p-3 rounded-xl border border-amber-200/50">
                        "{feedback.rating.comment}"
                      </p>
                    )}
                    <p className="text-[11px] text-amber-800/80 pt-1 border-t border-amber-200/60">
                      ℹ️ <strong>Lưu ý nghiệp vụ:</strong> Cán bộ công vụ không được phép tự chấm điểm đánh giá hồ sơ.
                    </p>
                  </div>
                ) : hasRating && !isEditingRating ? (
                  /* ─── CASE 2: Đã có đánh giá (Display Card) ──────────── */
                  <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StarRating score={feedback.rating!.score} readOnly size="md" />
                        <span className="font-extrabold text-lg text-slate-900">
                          {feedback.rating!.score} / 5 sao
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserRating(feedback.rating!.score);
                              setUserComment(feedback.rating?.comment || '');
                              setIsEditingRating(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-gov-700" />
                            <span>Chỉnh sửa đánh giá của bạn</span>
                          </button>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(feedback.rating!.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {feedback.rating?.comment ? (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 italic">
                        "{feedback.rating.comment}"
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Người dân không để lại nhận xét bằng lời.</p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Đánh giá chính thức từ người gửi:{' '}
                        <strong className="text-slate-800">{feedback.citizenName}</strong>
                      </span>
                      {!isOwner && (
                        <span className="text-[11px] text-slate-400 italic">
                          (Chỉ người gửi mới có quyền chỉnh sửa)
                        </span>
                      )}
                    </div>
                  </div>
                ) : !hasRating && feedback.citizenId && !isOwner ? (
                  /* ─── CASE 3: Hồ sơ tài khoản công dân nhưng người xem không phải chính chủ ─── */
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="font-bold text-sm text-slate-900">
                        Chờ Đánh Giá Từ Chính Chủ Hồ Sơ
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hồ sơ này được gửi bởi tài khoản công dân <strong>{feedback.citizenName}</strong>. Để bảo đảm tính minh bạch và tránh đánh giá sai lệch, chỉ chính chủ tài khoản mới có quyền thực hiện đánh giá.
                      </p>
                    </div>
                    {!user && (
                      <div className="pt-2">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs shadow transition-all"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Đăng nhập tài khoản công dân</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ─── CASE 4: Cho phép đánh giá (Chính chủ hoặc Khách vãng lai lần đầu) ─── */
                  <form onSubmit={handleRateSubmit} className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-slate-600">
                        {isEditingRating
                          ? 'Cập nhật lại mức độ hài lòng và nhận xét của bạn:'
                          : 'Ý kiến đánh giá của bạn là cơ sở quan trọng để cải thiện chất lượng phục vụ công đô thị:'}
                      </p>
                      {isEditingRating && (
                        <button
                          type="button"
                          onClick={() => setIsEditingRating(false)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Hủy chỉnh sửa
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Mức độ hài lòng của bạn: <span className="text-rose-500">*</span>
                      </label>
                      <StarRating
                        score={userRating}
                        readOnly={false}
                        size="lg"
                        onChange={(newScore) => setUserRating(newScore)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ý kiến đóng góp thêm (tùy chọn)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nhập nhận xét về tốc độ xử lý, thái độ cán bộ..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:border-gov-600 bg-white"
                      />
                    </div>

                    {/* Khách vãng lai: Yêu cầu xác nhận SĐT để tránh người khác vào đánh giá thay */}
                    {isAnonymousFeedback && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gov-700" />
                          <span>Xác nhận số điện thoại người gửi phản ánh:</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Nhập đúng số điện thoại bạn đã dùng khi gửi phản ánh này để xác thực quyền đánh giá (đánh giá 1 lần duy nhất).
                        </p>
                        <input
                          type="tel"
                          required
                          placeholder="Nhập số điện thoại người gửi..."
                          value={phoneVerification}
                          onChange={(e) => setPhoneVerification(e.target.value)}
                          className="w-full max-w-sm px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none focus:border-gov-600"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingRating}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isEditingRating ? 'Lưu thay đổi đánh giá' : 'Gửi đánh giá'}</span>
                      </button>

                      {isEditingRating && (
                        <button
                          type="button"
                          onClick={() => setIsEditingRating(false)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
