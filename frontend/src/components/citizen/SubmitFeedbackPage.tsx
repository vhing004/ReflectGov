import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Upload,
  X,
  MapPin,
  CheckCircle2,
  Copy,
  ArrowRight,
  Info,
  AlertCircle,
  FileVideo,
  LocateFixed,
  Loader2,
  Sparkles,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Category, FeedbackDetail } from '../../types';
import { feedbackApi, masterDataApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Create a modern SVG pin icon for Leaflet marker (100% reliable)
const createGovMarkerIcon = (color: string = '#1b4d89') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 38px;
          height: 38px;
          background-color: ${color};
          border: 3.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-size: 17px;">📍</div>
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 40],
    popupAnchor: [0, -40],
  });
};

const defaultPinIcon = createGovMarkerIcon('#1b4d89');

// High-precision Reverse Geocoding with Street, Alley, House Number, Ward & District
const fetchDetailedAddress = async (lat: number, lng: number): Promise<string> => {
  // Primary Method: Photon Komoot (Detailed OSM features with house number, street, lane, ward, district)
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const p = data.features[0].properties;
        const parts: string[] = [];

        // 1. House number + Street or Place Name
        if (p.housenumber && p.street) {
          parts.push(`Số ${p.housenumber} ${p.street}`);
        } else if (p.name && p.name !== p.street && p.name !== p.district && p.name !== p.city) {
          if (p.street) {
            parts.push(`${p.name}, ${p.street}`);
          } else {
            parts.push(p.name);
          }
        } else if (p.street) {
          parts.push(p.street);
        }

        // 2. Alley / Neighborhood / Locality
        if (p.locality && !parts.includes(p.locality)) {
          parts.push(p.locality);
        }

        // 3. District
        if (p.district && !parts.includes(p.district)) {
          parts.push(p.district);
        }

        // 4. City / Province
        if (p.city && !parts.includes(p.city)) {
          parts.push(p.city);
        } else if (p.state && !parts.includes(p.state)) {
          parts.push(p.state);
        }

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    }
  } catch (err) {
    console.warn('Photon reverse geocode fallback', err);
  }

  // Fallback Method: BigDataCloud API
  try {
    const res2 = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`
    );
    if (res2.ok) {
      const data2 = await res2.json();
      const parts: string[] = [];
      if (data2.locality) parts.push(data2.locality);
      if (data2.city && data2.city !== data2.locality) parts.push(data2.city);
      if (data2.principalSubdivision && data2.principalSubdivision !== data2.city) parts.push(data2.principalSubdivision);
      if (parts.length > 0) return parts.join(', ');
    }
  } catch (err2) {
    console.warn('BigDataCloud geocoder fallback', err2);
  }

  return `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

// Map controller to listen to clicks and center view
const MapController: React.FC<{
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onLocationSelected: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onLocationSelected }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(position, map.getZoom());
    }, 150);
    return () => clearTimeout(timer);
  }, [map, position]);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} icon={defaultPinIcon} />;
};

export const SubmitFeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdminOrStaff, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState('123 Đường Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội');
  const [coordinates, setCoordinates] = useState<[number, number]>([20.9984, 105.8123]); // Default Hanoi
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [citizenName, setCitizenName] = useState(user?.fullName || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phoneNumber || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<FeedbackDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Sync user info if logged in as citizen
  useEffect(() => {
    if (user && !isAdminOrStaff) {
      if (user.fullName) setCitizenName(user.fullName);
      if (user.phoneNumber) setCitizenPhone(user.phoneNumber);
      if (user.email) setCitizenEmail(user.email);
    }
  }, [user, isAdminOrStaff]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await masterDataApi.getCategories();
        setCategories(data);
        const queryCat = searchParams.get('categoryId');
        if (queryCat && data.some((c) => c.id === queryCat)) {
          setSelectedCategoryId(queryCat);
        } else if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, [searchParams]);

  // Handle map click: get high-precision address including street, alley, house number
  const handleLocationSelected = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const detailedAddress = await fetchDetailedAddress(lat, lng);
      setAddress(detailedAddress);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCoordinates(newCoords);
        await handleLocationSelected(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed', err);
        setIsLocating(false);
        alert('Không thể lấy tọa độ hiện tại. Vui lòng nhấp trực tiếp trên bản đồ.');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setErrorMsg('Chỉ được tải lên tối đa 5 tệp tin (ảnh hoặc video).');
        return;
      }
      setFiles((prev) => [...prev, ...selectedFiles]);
      setErrorMsg(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề phản ánh.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung chi tiết phản ánh.');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMsg('Vui lòng chọn lĩnh vực phản ánh.');
      return;
    }
    if (!citizenName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người phản ánh.');
      return;
    }
    if (!citizenPhone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại liên hệ để nhận thông báo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('CategoryId', selectedCategoryId);
      formData.append('Title', title.trim());
      formData.append('Content', content.trim());
      formData.append('CitizenName', citizenName.trim());
      formData.append('CitizenPhone', citizenPhone.trim());
      if (citizenEmail.trim()) formData.append('CitizenEmail', citizenEmail.trim());
      if (address.trim()) formData.append('Address', address.trim());
      formData.append('Latitude', coordinates[0].toString());
      formData.append('Longitude', coordinates[1].toString());

      files.forEach((file) => {
        formData.append('Files', file);
      });

      const res = await feedbackApi.submitFeedback(formData);
      setSuccessData(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi phản ánh. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (successData?.trackingCode) {
      navigator.clipboard.writeText(successData.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If logged in as Officer/Staff/Admin, prevent submitting citizen feedback
  if (isAdminOrStaff) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-amber-200 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Tài Khoản Cán Bộ Đang Thi Hành Công Vụ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Bạn đang đăng nhập với tư cách là cán bộ <strong className="text-gov-800">{user?.fullName}</strong> (Vai trò: <span className="font-bold text-amber-600">{user?.role}</span>).
            </p>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium max-w-lg mx-auto text-left space-y-1">
              <p className="font-bold">⚠️ Quy định phân quyền nghiệp vụ:</p>
              <p>Tài khoản Cán bộ công vụ không thực hiện gửi phản ánh kiến nghị công dân trên Cổng dịch vụ công trực tuyến. Vui lòng chuyển về Bàn làm việc để xử lý hồ sơ hoặc Đăng xuất nếu muốn gửi với tư cách công dân.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Vào Bàn Làm Việc Cán Bộ</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-gov-700">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-slate-500">Gửi phản ánh</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Gửi Phản Ánh & Kiến Nghị Hiện Trường
        </h1>
        <p className="text-sm text-slate-500">
          Hãy cung cấp đầy đủ thông tin, hình ảnh và định vị vị trí để cơ quan chức năng tiếp nhận và xử lý nhanh nhất.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
        {/* 1. Chọn lĩnh vực */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            1. Lĩnh vực phản ánh <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-gov-700 bg-gov-50 text-gov-900 shadow-sm ring-2 ring-gov-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{cat.icon || '📌'}</span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm leading-tight">{cat.name}</p>
                    <p className="text-[11px] text-slate-400">SLA: {cat.defaultSlaHours}h</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Tiêu đề & Nội dung */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-900">
            2. Chi tiết sự việc phản ánh <span className="text-rose-500">*</span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tiêu đề tóm tắt sự việc
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Hố sâu nguy hiểm trên mặt đường Nguyễn Trãi gần số nhà 123..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gov-600 focus:ring-2 focus:ring-gov-600/20 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nội dung mô tả chi tiết hiện trạng
            </label>
            <textarea
              required
              rows={4}
              placeholder="Mô tả cụ thể thời gian phát hiện, mức độ ảnh hưởng đến giao thông/môi trường/đời sống người dân..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gov-600 focus:ring-2 focus:ring-gov-600/20 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none"
            />
          </div>
        </div>

        {/* 3. Tải tệp đính kèm */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-900">
            3. Hình ảnh / Video hiện trường (Tối đa 5 tệp, tối đa 10MB/tệp)
          </label>

          <div className="border-2 border-dashed border-slate-200 hover:border-gov-600 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 transition-colors relative">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-gov-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Kéo thả hình ảnh hoặc <span className="text-gov-700 underline">chọn từ thiết bị</span>
              </p>
              <p className="text-xs text-slate-400">
                Hỗ trợ định dạng JPG, PNG, MP4. Hình ảnh rõ nét sẽ giúp việc xử lý nhanh hơn.
              </p>
            </div>
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {files.map((file, idx) => {
                const isVideo = file.type.startsWith('video');
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group h-24 flex items-center justify-center">
                    {isVideo ? (
                      <div className="flex flex-col items-center text-slate-600 p-2">
                        <FileVideo className="w-8 h-8 text-gov-700" />
                        <span className="text-[10px] truncate max-w-[80px]">{file.name}</span>
                      </div>
                    ) : (
                      <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Vị trí trên bản đồ & Tự động nhận diện ngõ ngách, tên đường */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-gov-700" />
              <span>4. Vị trí xảy ra sự việc</span>
              <span className="text-rose-500">*</span>
              {isGeocoding && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gov-700 font-bold bg-gov-50 px-2.5 py-0.5 rounded-full border border-gov-200 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gov-700" />
                  Đang nhận diện số nhà, ngõ ngách, tên đường...
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-gov-50 text-gov-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Đang định vị...' : 'Vị trí hiện tại'}</span>
              </button>
              <span className="text-xs text-slate-400 hidden sm:inline">Nhấp vào bản đồ để chọn</span>
            </div>
          </div>

          {/* Address input with auto-update */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Địa chỉ chi tiết (Tự động nhận diện ngõ/ngách/tên đường khi nhấp bản đồ)
            </label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-gov-600 focus-within:ring-2 focus-within:ring-gov-600/20">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên ngõ/ngách, tên đường, phường/xã, quận/huyện..."
                className="w-full bg-transparent text-sm text-slate-900 font-semibold outline-none"
              />
            </div>
          </div>

          {/* Leaflet Map using CartoDB Voyager CDN Tiles */}
          <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
            <MapContainer
              center={coordinates}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', minHeight: '320px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains={['a', 'b', 'c', 'd']}
                maxZoom={20}
              />
              <MapController
                position={coordinates}
                setPosition={setCoordinates}
                onLocationSelected={handleLocationSelected}
              />
            </MapContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
            <p>
              Tọa độ GPS: <span className="font-mono text-slate-800 font-bold">{coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</span>
            </p>
            <p className="text-gov-700 italic">
              💡 Mẹo: Bạn có thể phóng to bản đồ và nhấp vào vị trí cụ thể để nhận diện đúng số nhà hoặc ngõ ngách.
            </p>
          </div>
        </div>

        {/* 5. Thông tin người gửi */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-900">
            5. Thông tin người phản ánh <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gov-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0987654321"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gov-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email nhận kết quả (tùy chọn)
              </label>
              <input
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gov-600"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-gov-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-gov-600 shrink-0 mt-0.5" />
            <span>
              Thông tin cá nhân của công dân được bảo mật theo quy định pháp luật. Số điện thoại chỉ dùng để xác minh hoặc thông báo khi hoàn thành xử lý.
            </span>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-extrabold text-base shadow-xl hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang gửi phản ánh...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Gửi phản ánh ngay</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ─── Success Modal ──────────────────────────────────────────────── */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Gửi Phản Ánh Thành Công!
              </h3>
              <p className="text-sm text-slate-500">
                Cảm ơn bạn đã gửi phản ánh. Cơ quan chức năng đã tiếp nhận và đang tiến hành xử lý theo quy định.
              </p>
            </div>

            {/* Tracking code box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mã Tra Cứu Hồ Sơ
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono font-extrabold text-2xl text-gov-700 tracking-wider">
                  #{successData.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-gov-700" />
                  {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Lưu lại mã này để tra cứu tiến độ giải quyết bất kỳ lúc nào.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/track?code=${successData.trackingCode}`)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1b4d89] hover:bg-[#2762bf] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem tiến độ xử lý</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setTitle('');
                  setContent('');
                  setFiles([]);
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Gửi phản ánh khác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
