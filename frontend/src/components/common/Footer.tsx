import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f294a] text-slate-300 border-t border-white/10 pt-12 pb-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-gov-900 shadow">
                <ShieldCheck className="w-6 h-6 text-[#1b4d89]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white uppercase">
                Reflect<span className="text-amber-400">Gov</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cổng tiếp nhận và xử lý phản ánh, kiến nghị trực tuyến của người dân và doanh nghiệp. Nâng cao hiệu quả quản trị đô thị và tương tác chính quyền số.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>Phiên bản: <span className="text-amber-400 font-mono">v2.6.0 (2026)</span></p>
              <p>Tiêu chuẩn: <span className="text-emerald-400 font-semibold">SLA Đô Thị 24/7</span></p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Dịch vụ trực tuyến
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/submit" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Gửi phản ánh hiện trường
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Tra cứu tiến độ xử lý hồ sơ
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Bản đồ số phản ánh cộng đồng
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Cổng tiếp nhận Một Cửa & Cán bộ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Lĩnh vực phản ánh chính
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">🚗 Giao thông & Hạ tầng đường bộ</li>
              <li className="flex items-center gap-2">🌳 Vệ sinh môi trường & Rác thải</li>
              <li className="flex items-center gap-2">🏢 Trật tự đô thị & Lấn chiếm vỉa hè</li>
              <li className="flex items-center gap-2">💡 Chiếu sáng & Cấp thoát nước</li>
              <li className="flex items-center gap-2">🛡️ An ninh trật tự & An toàn PCCC</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Đường dây nóng hỗ trợ
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-base">1900 6868</p>
                  <p className="text-xs text-slate-400">Tiếp nhận thông tin 24/7 (Miễn phí)</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-slate-300">hotro@reflectgov.vn</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400 leading-relaxed">
                  Trung tâm Giám sát & Điều hành Thông minh Đô thị (IOC)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 mt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 Cổng Dịch Vụ Công Trực Tuyến ReflectGov. Bản quyền thuộc cơ quan quản lý nhà nước.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Quy chế hoạt động</span>
            <span className="hover:text-white cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-white cursor-pointer flex items-center gap-1">
              Dịch vụ công Quốc gia <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
