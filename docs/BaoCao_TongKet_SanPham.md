# BÁO CÁO TỔNG KẾT SẢN PHẨM HỆ THỐNG REFLECTGOV

## (Hệ Thống Số Hóa Tiếp Nhận, Phân Luồng & Trả Lời Phản Ánh Kiến Nghị Công Dân)

---

## 1. TỔNG QUAN DỰ ÁN

Hệ thống **ReflectGov** là nền tảng số hóa quản lý phản ánh kiến nghị công dân theo tiêu chuẩn **Chính phủ điện tử & Đô thị thông minh (Smart City)**. Nền tảng giải quyết triệt để bài toán kết nối 2 chiều giữa **Người dân/Doanh nghiệp** và **Cơ quan Quản lý Nhà nước/Đơn vị xử lý**, mang lại sự minh bạch, nhanh chóng và giám sát chất lượng giải quyết công vụ theo thời gian thực.

- **Đơn vị phát triển**: Senior Full-Stack Software Engineering Team
- **Công nghệ cốt lõi**:
  - **Backend**: ASP.NET Core Web API (.NET 9) thiết kế theo mô hình Clean Architecture (Domain - Infrastructure - Application - API).
  - **Frontend**: React 18+ (Vite + TypeScript + Tailwind CSS + Lucide Icons + Recharts + Leaflet OpenStreetMap).
  - **Cơ sở dữ liệu**: PostgreSQL 16 (Hỗ trợ linh hoạt tự động qua Entity Framework Core 9 / Npgsql).
  - **Bảo mật**: JWT Bearer Token, Phân quyền Role-Based (Admin, Dispatcher, Officer, Citizen), mã hóa mật khẩu BCrypt.

---

## 2. KIẾN TRÚC & MÔ HÌNH HỆ THỐNG

### 2.1. Cấu trúc Giải pháp Clean Architecture (Backend)

```
ReflectGov/
├── backend/
│   ├── ReflectGov.Domain/          # Entities, Enums (FeedbackStatus, Priority, UserRole, AttachmentType)
│   ├── ReflectGov.Infrastructure/  # AppDbContext, Npgsql/EF Core, LocalFileStorageService, DbInitializer (Seed Data)
│   ├── ReflectGov.Application/     # DTOs, Business Services (Auth, Feedback, Stats, MasterData, Users)
│   └── ReflectGov.Api/             # REST Controllers, JWT Auth, Swagger OpenAPI, Static Media Hosting
```

### 2.2. Cấu trúc Ứng dụng Frontend (React + Vite + TypeScript)

```
frontend/
├── src/
│   ├── types/                     # Định nghĩa kiểu dữ liệu đồng bộ với DTOs backend
│   ├── services/api.ts            # Axios client với JWT Bearer Interceptors
│   ├── context/AuthContext.tsx    # State đăng nhập, phân quyền RBAC
│   ├── components/
│   │   ├── common/                # Navbar, Footer, StatusBadge, PriorityBadge, StarRating
│   │   ├── citizen/               # HomePage, SubmitFeedbackPage, TrackingDetailPage, MapPage
│   │   ├── auth/                  # LoginPage (Đăng nhập, Đăng ký, Quick demo account picker)
│   │   └── admin/                 # AdminLayout, DashboardOverview (Recharts), FeedbackManagementPage (Table + Kanban), UserManagementPage
│   └── App.tsx                    # React Router Dom định tuyến đa phân hệ
```

---

## 3. DANH SÁCH TÍNH NĂNG ĐÃ TRIỂN KHAI

### 3.1. Phân hệ Cổng Dịch vụ Công Dân (Citizen Portal)

1. **Trang chủ Cổng thông tin (Home Portal)**:
   - Banner giao diện hành chính công hiện đại, thống kê trực tiếp 4 chỉ số KPI quan trọng (Tổng phản ánh, Đã giải quyết, Tỷ lệ đạt SLA, Điểm hài lòng ⭐).
   - Danh mục các lĩnh vực phản ánh kèm thời hạn cam kết SLA.
   - Giới thiệu quy trình 4 bước minh bạch và danh sách các kết quả xử lý nổi bật ngoài hiện trường.
2. **Gửi phản ánh hiện trường (Submit Feedback)**:
   - Form thông minh cho phép chọn Lĩnh vực, Tiêu đề, Mô tả chi tiết.
   - Hỗ trợ **Định vị GPS tự động** hoặc chọn vị trí trên bản đồ / nhập địa chỉ.
   - Tải lên nhiều hình ảnh/video hiện trường với thumbnail preview và nút xóa nhanh.
   - Tự động sinh mã tra cứu công khai độc nhất dạng `PA-YYYYMMDD-XXXX` (VD: `PA-2026-0001`) kèm tính năng sao chép mã tiện lợi.
3. **Tra cứu tiến độ & Kết quả (Tracking & Transparency)**:
   - Nhập mã tra cứu để xem toàn bộ thông tin phản ánh.
   - **Thanh tiến trình 5 bước trực quan** (_Submitted -> Processing -> InProgress -> ResolvedPendingApproval -> Published/Closed_).
   - Xem đơn vị thụ lý, cán bộ phụ trách, thời hạn SLA cam kết.
   - Đối chiếu hình ảnh hiện trường người dân gửi với **Hình ảnh minh chứng kết quả đã khắc phục** do cán bộ tải lên.
   - **Nhật ký luân chuyển hồ sơ (Audit Trail)** ghi nhận đầy đủ người thực hiện, vai trò, thời gian và nội dung thao tác.
   - **Đánh giá mức độ hài lòng**: Công dân chấm điểm 1 - 5 sao ⭐ kèm góp ý sau khi hồ sơ hoàn tất.
4. **Bản đồ số phản ánh hiện trường (Interactive Map)**:
   - Tích hợp bản đồ số vệ tinh/đường phố Leaflet OpenStreetMap.
   - Hiển thị vị trí các phản ánh với Marker và Popup thông tin chi tiết (ảnh chụp, địa chỉ, trạng thái).
   - Bộ lọc tìm kiếm theo Lĩnh vực và Địa bàn.

---

### 3.2. Phân hệ Cán bộ Điều phối & Quản trị (Officer & Admin Portal)

1. **Dashboard Phân tích & Báo cáo KPI (Analytics Dashboard)**:
   - Thẻ thống kê thời gian thực: Tổng hồ sơ, Đang xử lý, Hoàn thành, Điểm hài lòng trung bình.
   - **Biểu đồ cột (Bar Chart)**: Phân bố số lượng phản ánh theo từng Lĩnh vực (Giao thông, Môi trường, Đô thị, Chiếu sáng,...).
   - **Biểu đồ tròn (Donut Chart)**: Tỷ trọng các trạng thái xử lý trong hệ thống.
   - **Bảng KPI tuân thủ SLA theo Đơn vị/Phòng ban**: Thống kê số lượng tiếp nhận, đang xử lý, hoàn thành, tỷ lệ đúng hạn từng đơn vị.
2. **Quản lý & Điều phối Phản ánh (Feedback Management & Workflow)**:
   - Hỗ trợ **2 chế độ xem**: Bảng dữ liệu đa tiêu chí (_Table View_) và Bảng luồng công việc kéo thẻ (_Kanban Board View_).
   - Bộ lọc đa chiều: Trạng thái, Lĩnh vực, Phòng ban, Mức độ ưu tiên, Lọc hồ sơ quá hạn SLA.
   - **Thao tác nghiệp vụ theo vai trò**:
     - _Cán bộ tiếp nhận_: Sơ duyệt hợp lệ hoặc từ chối phản ánh kèm lý do.
     - _Phân công giao việc_: Gán phòng ban, cán bộ thụ lý, mức độ ưu tiên và thời hạn SLA.
     - _Đội xử lý hiện trường_: Bắt đầu xử lý, cập nhật tiến độ & ảnh hiện trường, Báo cáo giải quyết kèm ảnh nghiệm thu.
     - _Lãnh đạo phê duyệt_: Thẩm định kết quả và bấm Duyệt công khai cho công dân hoặc Yêu cầu xử lý lại.
3. **Quản lý Người dùng & Cán bộ (User Management)**:
   - Quản lý danh sách tài khoản theo từng vai trò (Admin, Dispatcher, Officer, Citizen).
   - Thêm mới tài khoản cán bộ kèm gán phòng ban trực thuộc.
   - Khóa / Mở khóa trạng thái hoạt động của tài khoản.

---

## 4. TÀI KHOẢN MẪU THỬ NGHIỆM HỆ THỐNG

Tất cả các tài khoản dưới đây đã được khởi tạo sẵn trong CSDL với mật khẩu mặc định là `123456`:

| Tên đăng nhập   | Mật khẩu | Họ và tên             | Vai trò (Role)                              | Đơn vị trực thuộc            |
| :------------------ | :--------- | :----------------------- | :------------------------------------------- | :-------------------------------- |
| `admin`           | `123456` | Nguyễn Văn Quản Trị  | **Admin** (Lãnh đạo / Quản trị)   | Văn phòng UBND                  |
| `tiepnhan`        | `123456` | Trần Thị Tiếp Nhận   | **Dispatcher** (Cán bộ điều phối) | Trung tâm Tiếp nhận            |
| `canbo_dothi`     | `123456` | Lê Hoàng Đô Thị     | **Officer** (Cán bộ xử lý)         | Đội QL Trật tự Đô thị      |
| `canbo_moitruong` | `123456` | Phạm Minh Môi Trường | **Officer** (Cán bộ xử lý)         | Phòng Tài nguyên Môi trường |
| `canbo_giaothong` | `123456` | Vũ Tuấn Giao Thông    | **Officer** (Cán bộ xử lý)         | Đơn vị QL Giao thông          |
| `congdan`         | `123456` | Hoàng Đức Dân        | **Citizen** (Công dân)               | Người dân địa phương       |

---

## 5. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH

### 5.1. Yêu cầu môi trường

- .NET SDK: 8.0 hoặc 9.0 trở lên.
- Node.js: 18.x trở lên (khuyên dùng Node.js 20+ hoặc 24+).
- CSDL: PostgreSQL 14+ (Hệ thống có chế độ tự động chạy SQLite Standalone nếu không có sẵn máy chủ PostgreSQL).

### 5.2. Khởi chạy Backend API (.NET)

```bash
cd backend
dotnet run --project ReflectGov.Api/ReflectGov.Api.csproj
```

- **API Server**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/swagger`

### 5.3. Khởi chạy Frontend Portal (React)

```bash
cd frontend
npm install
npm run dev
```

- **Citizen & Admin Portal**: `http://localhost:5173`

---

## 6. KẾT LUẬN

Hệ thống **ReflectGov** đã được thiết kế, lập trình và hoàn thiện toàn diện với chất lượng chuẩn doanh nghiệp. Sự kết hợp giữa **ASP.NET Core Web API**, **ReactJS TypeScript** và **PostgreSQL** mang lại hiệu năng cao, bảo mật nhiều lớp, giao diện thân thiện và khả năng mở rộng linh hoạt phục vụ lộ trình chuyển đổi số quốc gia.
