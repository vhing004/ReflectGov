import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Filter, Eye, Send, ArrowRight } from 'lucide-react';
import { Category, FeedbackPublic } from '../../types';
import { feedbackApi, masterDataApi } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';

// Dynamic SVG Leaflet Marker generator based on status color
const createPinIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background-color: ${color};
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(45deg); font-size: 15px;">📍</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const pinIcons: { [key: string]: L.DivIcon } = {
  Published: createPinIcon('#10b981'), // Green
  InProgress: createPinIcon('#f59e0b'), // Amber
  Processing: createPinIcon('#3b82f6'), // Blue
  Submitted: createPinIcon('#1b4d89'), // Gov Blue
  Default: createPinIcon('#1b4d89'),
};

const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackPublic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultCenter: [number, number] = [21.0089, 105.8245]; // Hanoi Central

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, fbs] = await Promise.all([
          masterDataApi.getCategories(),
          feedbackApi.getPublicFeedbacks(),
        ]);
        setCategories(cats);
        setFeedbacks(fbs);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchCat =
      selectedCategory === 'ALL' ||
      categories.find((c) => c.name === fb.categoryName)?.id === selectedCategory;
    const matchSearch =
      !searchKeyword.trim() ||
      fb.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      fb.trackingCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (fb.address && fb.address.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="relative h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden bg-slate-100">
      {/* ─── Left Panel: Filters & List ─────────────────────────────────── */}
      <div className="w-full md:w-96 lg:w-[420px] bg-white border-r border-slate-200 shadow-xl z-20 flex flex-col h-1/2 md:h-full shrink-0">
        {/* Top filter header */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gov-700" />
              Bản Đồ Phản Ánh Đô Thị
            </h2>
            <span className="text-xs font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded-full border border-gov-200">
              {filteredFeedbacks.length} điểm
            </span>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:border-gov-600">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mã hồ sơ, địa chỉ..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1b4d89] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1b4d89] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
              <p>Không tìm thấy phản ánh nào theo bộ lọc.</p>
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                onClick={() => setSelectedFeedback(fb)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedFeedback?.id === fb.id
                    ? 'border-gov-700 bg-gov-50 shadow-md ring-2 ring-gov-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-gov-700">#{fb.trackingCode}</span>
                  <StatusBadge status={fb.statusName} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{fb.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{fb.content}</p>
                {fb.address && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 truncate">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">{fb.address}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => navigate('/submit')}
            className="w-full py-2.5 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Gửi phản ánh tại đây
          </button>
        </div>
      </div>

      {/* ─── Right: Interactive Leaflet Map ────────────────────────────── */}
      <div className="flex-1 h-1/2 md:h-full relative z-10 bg-slate-100">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '320px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
            maxZoom={20}
          />
          <MapResizer />

          {filteredFeedbacks
            .filter((fb) => fb.latitude && fb.longitude)
            .map((fb) => {
              const icon = pinIcons[fb.statusName] || pinIcons.Default;
              return (
                <Marker
                  key={fb.id}
                  position={[fb.latitude!, fb.longitude!]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedFeedback(fb),
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 max-w-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-gov-700">#{fb.trackingCode}</span>
                        <StatusBadge status={fb.statusName} />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{fb.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{fb.content}</p>
                      <button
                        onClick={() => navigate(`/track?code=${fb.trackingCode}`)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-[#1b4d89] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Xem chi tiết <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};
