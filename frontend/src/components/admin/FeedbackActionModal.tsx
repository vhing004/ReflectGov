import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  UserPlus,
  Wrench,
  CheckCheck,
  Upload,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  Category,
  Department,
  FeedbackDetail,
  FeedbackPriority,
  User,
} from '../../types';
import {
  adminFeedbackApi,
  masterDataApi,
} from '../../services/api';

export type ActionModalType = 'verify' | 'assign' | 'progress' | 'resolve' | 'approve' | null;

interface FeedbackActionModalProps {
  type: ActionModalType;
  feedback: FeedbackDetail | null;
  onClose: () => void;
  onSuccess: (updated: FeedbackDetail) => void;
}

export const FeedbackActionModal: React.FC<FeedbackActionModalProps> = ({
  type,
  feedback,
  onClose,
  onSuccess,
}) => {
  if (!type || !feedback) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Master data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);

  // Verify state
  const [isApproved, setIsApproved] = useState(true);
  const [rejectReason, setRejectReason] = useState('');

  // Assign state
  const [selectedDeptId, setSelectedDeptId] = useState<string>(feedback.assignedDepartmentId || '');
  const [selectedUserId, setSelectedUserId] = useState<string>(feedback.assignedUserId || '');
  const [priority, setPriority] = useState<number>(2); // Normal
  const [customSlaHours, setCustomSlaHours] = useState<number>(24);
  const [assignNote, setAssignNote] = useState('');

  // Progress update state
  const [progressNote, setProgressNote] = useState('');
  const [progressFiles, setProgressFiles] = useState<File[]>([]);

  // Resolve state
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  // Approve state
  const [approveNote, setApproveNote] = useState('');
  const [isApprovalPass, setIsApprovalPass] = useState(true);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [depts, users] = await Promise.all([
          masterDataApi.getDepartments(),
          masterDataApi.getUsers({ role: 'Officer' }),
        ]);
        setDepartments(depts);
        setOfficers(users);
        if (!selectedDeptId && depts.length > 0) {
          setSelectedDeptId(depts[0].id);
        }
      } catch (err) {
        console.error('Failed to load master data for modal', err);
      }
    };
    if (type === 'assign') {
      loadMaster();
    }
  }, [type]);

  const filteredOfficers = officers.filter(
    (u) => !selectedDeptId || u.departmentId === selectedDeptId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let updated: FeedbackDetail;

      if (type === 'verify') {
        updated = await adminFeedbackApi.verifyFeedback(feedback.id, {
          isApproved,
          rejectReason: isApproved ? undefined : rejectReason,
        });
      } else if (type === 'assign') {
        if (!selectedDeptId) {
          setErrorMsg('Vui lòng chọn đơn vị thụ lý.');
          setIsLoading(false);
          return;
        }
        updated = await adminFeedbackApi.assignFeedback(feedback.id, {
          departmentId: selectedDeptId,
          assignedUserId: selectedUserId || undefined,
          priority,
          customSlaHours,
          note: assignNote || undefined,
        });
      } else if (type === 'progress') {
        if (!progressNote.trim()) {
          setErrorMsg('Vui lòng nhập ghi chú tiến độ.');
          setIsLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('Note', progressNote.trim());
        progressFiles.forEach((file) => formData.append('Files', file));
        updated = await adminFeedbackApi.updateProgress(feedback.id, formData);
      } else if (type === 'resolve') {
        if (!resolutionSummary.trim()) {
          setErrorMsg('Vui lòng nhập tóm tắt kết quả xử lý hoàn thành.');
          setIsLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('ResolutionSummary', resolutionSummary.trim());
        proofFiles.forEach((file) => formData.append('ProofFiles', file));
        updated = await adminFeedbackApi.resolveFeedback(feedback.id, formData);
      } else if (type === 'approve') {
        if (feedback.statusName !== 'ResolvedPendingApproval') {
          setErrorMsg('Hồ sơ chưa được cán bộ hiện trường xử lý xong và nộp báo cáo hoàn thành. Không thể nghiệm thu tắt quy trình.');
          setIsLoading(false);
          return;
        }
        updated = await adminFeedbackApi.approveFeedback(feedback.id, {
          isApproved: isApprovalPass,
          note: approveNote || undefined,
        });
      } else {
        return;
      }

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
                #{feedback.trackingCode}
              </span>
              <h3 className="font-extrabold text-lg text-slate-900">
                {type === 'verify' && 'Tiếp Nhận / Thẩm Tra Phản Ánh'}
                {type === 'assign' && 'Phân Công Đơn Vị & Cán Bộ'}
                {type === 'progress' && 'Cập Nhật Tiến Độ Hiện Trường'}
                {type === 'resolve' && 'Báo Cáo Hoàn Thành Hiện Trường'}
                {type === 'approve' && 'Phê Duyệt Nghiệm Thu & Công Khai'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{feedback.title}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. VERIFY MODAL */}
          {type === 'verify' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsApproved(true)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    isApproved
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="font-bold text-xs">Tiếp nhận hợp lệ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsApproved(false)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    !isApproved
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <XCircle className="w-6 h-6 text-rose-600" />
                  <span className="font-bold text-xs">Từ chối tiếp nhận</span>
                </button>
              </div>

              {!isApproved && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lý do từ chối <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ví dụ: Phản ánh không thuộc thẩm quyền giải quyết, thông tin không chính xác..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-gov-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. ASSIGN MODAL */}
          {type === 'assign' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đơn vị phòng ban phụ trách <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedUserId('');
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-gov-600 bg-white"
                >
                  <option value="">-- Chọn Đơn vị chuyên trách --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cán bộ trực tiếp thụ lý (tùy chọn)
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-gov-600 bg-white"
                >
                  <option value="">-- Giao toàn phòng ban / Chưa chỉ định --</option>
                  {filteredOfficers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-gov-600 bg-white"
                  >
                    <option value={1}>Thấp (Low)</option>
                    <option value={2}>Bình thường (Normal)</option>
                    <option value={3}>Cao (High)</option>
                    <option value={4}>Khẩn cấp (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hạn mức xử lý SLA
                  </label>
                  <select
                    value={customSlaHours}
                    onChange={(e) => setCustomSlaHours(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-gov-600 bg-white"
                  >
                    <option value={2}>2 Giờ (Khẩn cấp)</option>
                    <option value={12}>12 Giờ</option>
                    <option value={24}>24 Giờ (1 Ngày)</option>
                    <option value={48}>48 Giờ (2 Ngày)</option>
                    <option value={72}>72 Giờ (3 Ngày)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú chỉ đạo
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú yêu cầu phối hợp hiện trường..."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-gov-600"
                />
              </div>
            </div>
          )}

          {/* 3. PROGRESS UPDATE MODAL */}
          {type === 'progress' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhật ký tiến độ hiện trường <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Đã cử tổ công tác xuống hiện trường, kiểm tra đo đạc và đang tiến hành san lấp..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-gov-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ảnh hiện trường đang khắc phục (tùy chọn)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && setProgressFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gov-50 file:text-gov-700 hover:file:bg-gov-100 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 4. RESOLVE MODAL */}
          {type === 'resolve' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tóm tắt kết quả hoàn thành <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Đã hoàn tất san lấp, đầm nèn và trải thảm bê tông nhựa mặt đường. Đảm bảo an toàn kỹ thuật."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-gov-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ảnh nghiệm thu kết quả (Sau xử lý) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && setProofFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ảnh chụp kết quả hoàn thành rõ nét sẽ là cơ sở để Lãnh đạo nghiệm thu phê duyệt công khai.
                </p>
              </div>
            </div>
          )}

          {/* 5. APPROVE MODAL */}
          {type === 'approve' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsApprovalPass(true)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    isApprovalPass
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCheck className="w-6 h-6 text-emerald-600" />
                  <span className="font-bold text-xs">Duyệt & Công Khai Kết Quả</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsApprovalPass(false)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    !isApprovalPass
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <XCircle className="w-6 h-6 text-rose-600" />
                  <span className="font-bold text-xs">Yêu Cầu Xử Lý Lại</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ý kiến chỉ đạo của Lãnh đạo
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isApprovalPass
                      ? 'Ghi chú nghiệm thu công khai...'
                      : 'Nêu rõ lý do chưa đạt yêu cầu cần xử lý lại...'
                  }
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-gov-600"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Xác nhận thực hiện</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
