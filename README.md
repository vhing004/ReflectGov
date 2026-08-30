# 🏛️ ReflectGov - Hệ Thống Tiếp Nhận & Điều Hành Xử Lý Phản Ánh Công Dân (Gov-Tech IOC Platform)

Hệ thống Chính quyền số thông minh (Gov-Tech) phục vụ tiếp nhận phản ánh kiến nghị đô thị, điều phối tự động, giám sát thi công hiện trường thời gian thực và quản lý hạn mức cam kết chất lượng dịch vụ công (SLA).

---

## 🌟 Tính Năng Nổi Bật

### 1. Cổng Dịch Vụ Công Người Dân (`/`)
- **Gửi phản ánh trực quan (`/submit`)**: Chụp/tải ảnh hiện trường, bản đồ vệ tinh CartoDB Voyager CDN, tự động bóc tách số nhà ngõ ngách (Photon Reverse Geocoding).
- **Tra cứu tiến độ thời gian thực (`/track`)**: Stepper 4 bước minh bạch, ảnh đối chiếu Trước/Sau, nhật ký thi công hiện trường.
- **Đánh giá chất lượng 1-5 sao**: Người dân chấm điểm trực tiếp sau khi hoàn thành.
- **Bản đồ GIS phản ánh số (`/map`)**: Bản đồ nhiệt và phân loại phản ánh theo 6 chuyên ngành đô thị.

### 2. Bàn Làm Việc Cán Bộ & Trung Tâm IOC (`/admin`)
- **Bảng điều khiển KPI & SLA Alerts**: 4 chỉ số KPI thời gian thực, cảnh báo hạn mức xử lý, biểu đồ khối lượng theo tuần và phân bổ lĩnh vực.
- **Kanban Board & Table View đa tiêu chí**: Quản lý hồ sơ 3 cột nghiệp vụ (*Chờ tiếp nhận*, *Đang xử lý*, *Hoàn thành*).
- **Phân quyền 4 vai trò nghiêm ngặt**:
  - `Citizen`: Gửi phản ánh, tra cứu & đánh giá 5 sao.
  - `Dispatcher`: Thẩm tra tính hợp lệ & Phân công đơn vị thụ lý kèm hạn SLA.
  - `Officer`: Cập nhật tiến độ hiện trường & Báo cáo hoàn thành nộp ảnh nghiệm thu.
  - `Admin`: Lãnh đạo giám sát toàn diện, Nghiệm thu phê duyệt công khai kết quả & Quản lý danh sách cán bộ.
- **Quy trình tuần tự bắt buộc**: Nghiệm thu công khai chỉ được kích hoạt sau khi cán bộ hiện trường đã nộp báo cáo hoàn thành.

### 3. Cổng Đăng Nhập Riêng Biệt (`/admin/login`)
- Phân tách độc lập giữa Cổng người dân (`/login`) và Cổng cán bộ nội bộ (`/admin/login`).
- Xác thực 2 lớp: Mã định danh công vụ (PIN: `GOV-2026`) + Danh sách 5 Bộ phận xử lý chuyên môn.

---

## 🏗️ Công Nghệ Sử Dụng

- **Backend**: .NET 9 Web API, C# 13, Clean Architecture, Entity Framework Core, SQLite, JWT Bearer Authentication, BCrypt.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / CartoDB Voyager, Recharts, Axios.

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi chạy Backend (.NET 9)
```bash
cd backend/ReflectGov.Api
dotnet run --launch-profile http
# API chạy tại: http://localhost:5000 (Swagger: http://localhost:5000/swagger)
```

### 2. Khởi chạy Frontend (Vite React)
```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
```

---

## 🔑 Tài Khoản Thử Nghiệm

| Vai trò / Bộ phận | Username | Password | Mã PIN Công Vụ |
| :--- | :---: | :---: | :---: |
| **Tiếp nhận Một Cửa** | `tiepnhan` | `123456` | `GOV-2026` |
| **Lãnh đạo / Admin** | `admin` | `123456` | `GOV-2026` |
| **Cán bộ Giao thông** | `canbo_giaothong` | `123456` | `GOV-2026` |
| **Cán bộ Môi trường** | `canbo_moitruong` | `123456` | `GOV-2026` |
| **Cán bộ Trật tự Đô thị** | `canbo_dothi` | `123456` | `GOV-2026` |
| **Công dân** | `congdan` | `123456` | *(Không cần PIN)* |
