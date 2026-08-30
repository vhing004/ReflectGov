import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Star,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardData } from '../../types';
import { statsApi } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

const PIE_COLORS = ['#1b4d89', '#3c7ed1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await statsApi.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setErrorMsg(err.message || 'Không thể tải dữ liệu chỉ số KPI.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Không thể tải dữ liệu Dashboard</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg || 'Vui lòng kiểm tra kết nối API backend.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-xl bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  const {
    kpiSummary = {} as any,
    overview = {} as any,
    byCategory = [],
    weeklyTrends = [],
    slaAlerts = [],
    latestIncomingReports = [],
  } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tổng Quan Chỉ Số & KPI Đô Thị
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Báo cáo phân tích hiệu suất tiếp nhận và giải quyết phản ánh công dân thời gian thực.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/feedbacks')}
          className="px-5 py-2.5 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white text-xs font-bold shadow transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Xem tất cả phản ánh</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── 1. 4 KPI Summary Cards (Stitch Mockup) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Reports */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng số phản ánh
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-gov-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {kpiSummary.totalReports ?? overview.totalFeedbacks ?? 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpiSummary.totalReportsGrowth || '+14.5%'} so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card 2: SLA Compliance */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tuân thủ hạn xử lý (SLA)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-700">
              {kpiSummary.slaComplianceRate ?? overview.slaComplianceRate ?? 94.2}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <span>{kpiSummary.slaTargetComparison || 'Chỉ tiêu tối thiểu: 90%'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Resolution Time */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thời gian giải quyết TB
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {kpiSummary.avgResolutionTimeDays ?? 2.4} <span className="text-sm font-semibold text-slate-500">ngày</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <span>{kpiSummary.avgResolutionTimeGrowth || 'Nhanh hơn 0.5 ngày'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Citizen Satisfaction */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mức độ hài lòng của dân
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-700">
              {overview.averageRating ? overview.averageRating.toFixed(1) : '5.0'} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <span>Đã hoàn thành: {overview.published ?? 0} hồ sơ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. SLA Alerts Banner (Overdue & At Risk) ──────────────────── */}
      {slaAlerts && slaAlerts.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm sm:text-base">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Cảnh Báo Hạn Mức Xử Lý (SLA Alerts: {slaAlerts.length} hồ sơ)</span>
            </div>
            <span className="text-xs font-semibold text-rose-700">Ưu tiên xử lý khẩn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {slaAlerts.slice(0, 6).map((alert) => {
              const isOverdue = alert.alertType === 'OVERDUE' || alert.hoursRemaining < 0;
              return (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/admin/feedbacks?highlight=${alert.id}`)}
                  className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-700">#{alert.trackingCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        isOverdue
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.dueMessage || (isOverdue ? 'QUÁ HẠN' : 'CÒN HẠN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{alert.title}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{alert.categoryName}</span>
                    <span className="font-semibold text-gov-700">{alert.assignedDepartmentName || 'Chưa giao'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. Charts Row (Weekly Volume & Category Distribution) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Resolution Volume (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Khối Lượng Tiếp Nhận & Giải Quyết Theo Tuần
              </h3>
              <p className="text-xs text-slate-400">4 tuần gần nhất</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              Cập nhật hôm nay
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="weekLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f294a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f59e0b' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="receivedCount" name="Tiếp nhận" fill="#3c7ed1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolvedCount" name="Đã giải quyết" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (Pie Chart) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Phân Bổ Theo Lĩnh Vực
            </h3>
            <p className="text-xs text-slate-400">Tỷ lệ phản ánh theo từng chuyên ngành</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f294a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
            {byCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-700 truncate">{cat.categoryName}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. Latest Incoming Reports Table ─────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Danh Sách Phản Ánh Mới Tiếp Nhận
            </h3>
            <p className="text-xs text-slate-400">10 hồ sơ tiếp nhận gần nhất cần xử lý</p>
          </div>
          <button
            onClick={() => navigate('/admin/feedbacks')}
            className="text-xs font-bold text-gov-700 hover:text-gov-800 flex items-center gap-1 cursor-pointer"
          >
            Quản lý hồ sơ <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Mã hồ sơ</th>
                <th className="py-3.5 px-4">Tiêu đề phản ánh</th>
                <th className="py-3.5 px-4">Lĩnh vực</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Ưu tiên</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {latestIncomingReports.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gov-700">
                    #{row.trackingCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {row.title}
                  </td>
                  <td className="py-3.5 px-4">
                    {row.categoryName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {row.submittedRelativeTime || new Date(row.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/feedbacks?highlight=${row.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-gov-50 text-gov-700 font-bold transition-colors cursor-pointer"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
