import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Category, FeedbackPublic } from '../../types';
import { feedbackApi, masterDataApi } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { StarRating } from '../common/StarRating';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicFeedbacks, setPublicFeedbacks] = useState<FeedbackPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, fbs] = await Promise.all([
          masterDataApi.getCategories(),
          feedbackApi.getPublicFeedbacks(),
        ]);
        setCategories(cats);
        setPublicFeedbacks(fbs);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    const cleanCode = trackingCode.trim().replace(/^#/, '');
    navigate(`/track?code=${encodeURIComponent(cleanCode)}`);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#1b4d89] via-[#1a4478] to-[#0f294a] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl">
        {/* Background glow & decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng Tiếp nhận & Giám sát Phản ánh Đô thị 4.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Lắng Nghe Người Dân, <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-white bg-clip-text text-transparent">
              Hành Động Vì Đô Thị Văn Minh
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
            Gửi phản ánh về hạ tầng giao thông, vệ sinh môi trường, an ninh trật tự trực tiếp đến các cơ quan chính quyền. Theo dõi tiến độ giải quyết minh bạch từng bước.
          </p>

          {/* Quick Tracking Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border-2 border-white/30 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 px-4 w-full text-slate-800">
                <Search className="w-5 h-5 text-gov-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Nhập mã hồ sơ (Ví dụ: #RPT-8492 hoặc PA-2026...)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-blue-600/30 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Tra cứu ngay
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-blue-200">
              <span>Hồ sơ mẫu thử nghiệm:</span>
              <button
                type="button"
                onClick={() => navigate('/track?code=RPT-8492')}
                className="underline hover:text-amber-300 font-mono font-bold"
              >
                #RPT-8492
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/track?code=RPT-8501')}
                className="underline hover:text-amber-300 font-mono font-bold"
              >
                #RPT-8501
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/track?code=REP-1042')}
                className="underline hover:text-amber-300 font-mono font-bold"
              >
                #REP-1042
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/submit"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Gửi phản ánh hiện trường
            </Link>
            <Link
              to="/map"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-amber-400" /> Xem bản đồ phản ánh
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Real-time Statistics Counter ────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-gov-700 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,248+</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Hồ sơ đã tiếp nhận</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">94.2%</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Tuân thủ đúng hạn (SLA)</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">3.8 ngày</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Thời gian xử lý trung bình</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-700">4.8 / 5.0</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Độ hài lòng của dân</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Steps Process ────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-3 py-1 rounded-full border border-gov-200">
            Quy trình tiếp nhận minh bạch
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            4 Bước Xử Lý Phản Ánh Công Dân
          </h2>
          <p className="text-sm text-slate-500">
            Mọi phản ánh đều được số hóa, giám sát tiến độ tự động theo cam kết chất lượng dịch vụ (SLA).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Gửi phản ánh', desc: 'Chụp ảnh/video hiện trường, chọn vị trí trên bản đồ và gửi thông tin.', icon: '📸' },
            { step: '02', title: 'Tiếp nhận & Phân công', desc: 'Bộ phận một cửa thẩm tra và điều phối trực tiếp tới đơn vị chuyên môn trong 2h.', icon: '📋' },
            { step: '03', title: 'Xử lý hiện trường', desc: 'Cán bộ xuống thực địa khắc phục và liên tục cập nhật hình ảnh tiến độ.', icon: '🛠️' },
            { step: '04', title: 'Nghiệm thu & Đánh giá', desc: 'Lãnh đạo phê duyệt công khai, người dân nhận thông báo và chấm điểm hài lòng.', icon: '⭐' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="text-3xl font-black text-slate-100 absolute top-3 right-4 group-hover:text-gov-100 transition-colors">
                {item.step}
              </div>
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories Grid ────────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-3 py-1 rounded-full border border-gov-200">
              Lĩnh vực phụ trách
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Các Lĩnh Vực Tiếp Nhận Phản Ánh
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Chọn lĩnh vực tương ứng để gửi thông tin chính xác tới cơ quan xử lý.
            </p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 text-sm font-bold text-gov-700 hover:text-gov-800"
          >
            Tạo phản ánh mới <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/submit?categoryId=${cat.id}`)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-gov-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-gov-50 border border-slate-200 group-hover:border-gov-200 flex items-center justify-center text-2xl transition-colors">
                  {cat.icon || '📌'}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-gov-700 border border-blue-100">
                  SLA: {cat.defaultSlaHours}h
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-gov-700 transition-colors mb-1.5">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                {cat.description || 'Tiếp nhận các vấn đề liên quan đến lĩnh vực này trên địa bàn toàn thành phố.'}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gov-700 group-hover:translate-x-1 transition-transform">
                Gửi phản ánh ngay <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Recent Public Feedbacks ────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Công khai minh bạch
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Kết Quả Xử Lý Phản Ánh Mới Nhất
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Các phản ánh đã được chính quyền giải quyết hoàn tất và nghiệm thu công khai.
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 text-sm font-bold text-gov-700 hover:text-gov-800"
          >
            Xem tất cả trên bản đồ số <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicFeedbacks.slice(0, 6).map((fb) => (
              <div
                key={fb.id}
                onClick={() => navigate(`/track?code=${fb.trackingCode}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group"
              >
                {/* Image preview thumbnail */}
                {fb.attachments && fb.attachments.length > 0 ? (
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={fb.attachments[0].filePath}
                      alt={fb.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={fb.statusName} />
                    </div>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-between px-6">
                    <span className="text-3xl">{fb.categoryIcon || '📌'}</span>
                    <StatusBadge status={fb.statusName} />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded">
                        #{fb.trackingCode}
                      </span>
                      <span>{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-gov-700 transition-colors line-clamp-1">
                      {fb.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {fb.content}
                    </p>

                    {fb.address && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-gov-600 shrink-0" />
                        <span className="truncate">{fb.address}</span>
                      </div>
                    )}
                  </div>

                  {fb.rating && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Đánh giá của dân:</span>
                      <StarRating score={fb.rating.score} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Bottom Banner CTA ─────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1b4d89] to-[#0f294a] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Bạn phát hiện bất cập trong khu vực?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Hãy gửi ngay phản ánh để chung tay cùng chính quyền xây dựng đô thị xanh, sạch, đẹp và văn minh hơn mỗi ngày.
            </p>
          </div>
          <Link
            to="/submit"
            className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-lg hover:scale-105 transition-all shrink-0 flex items-center gap-2"
          >
            <Send className="w-5 h-5" /> Gửi phản ánh ngay
          </Link>
        </div>
      </section>
    </div>
  );
};
