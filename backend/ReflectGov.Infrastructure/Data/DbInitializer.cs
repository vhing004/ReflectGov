using BCrypt.Net;
using ReflectGov.Domain.Entities;
using ReflectGov.Domain.Enums;

namespace ReflectGov.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Seed Departments
        if (!context.Departments.Any())
        {
            var depts = new List<Department>
            {
                new() { Id = Guid.Parse("11111111-0000-0000-0000-000000000001"), Name = "Văn phòng UBND", Description = "Văn phòng Ủy ban Nhân dân Quận/Huyện", HeadName = "Ông Nguyễn Văn A", PhoneNumber = "024.3555.0001" },
                new() { Id = Guid.Parse("11111111-0000-0000-0000-000000000002"), Name = "Phòng Tài nguyên & Môi trường", Description = "Quản lý môi trường, rác thải, thoát nước", HeadName = "Bà Trần Thị B", PhoneNumber = "024.3555.0002" },
                new() { Id = Guid.Parse("11111111-0000-0000-0000-000000000003"), Name = "Đội Quản lý Trật tự Đô thị", Description = "Trật tự vỉa hè, xây dựng trái phép, biển hiệu", HeadName = "Ông Lê Văn C", PhoneNumber = "024.3555.0003" },
                new() { Id = Guid.Parse("11111111-0000-0000-0000-000000000004"), Name = "Đơn vị Quản lý Giao thông", Description = "Hạ tầng giao thông, đường hố, đèn tín hiệu", HeadName = "Ông Phạm Văn D", PhoneNumber = "024.3555.0004" },
                new() { Id = Guid.Parse("11111111-0000-0000-0000-000000000005"), Name = "Trung tâm Tiếp nhận", Description = "Tiếp nhận và điều phối phản ánh", HeadName = "Bà Vũ Thị E", PhoneNumber = "024.3555.0005" },
            };
            context.Departments.AddRange(depts);
            await context.SaveChangesAsync();
        }

        // Seed Categories
        if (!context.Categories.Any())
        {
            var cats = new List<Category>
            {
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000001"), Name = "Đường & Hạ tầng Giao thông", Icon = "🚗", DefaultSlaHours = 48, Description = "Ổ gà, đường hỏng, vạch kẻ đường, biển báo" },
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000002"), Name = "Môi trường & Vệ sinh", Icon = "♻️", DefaultSlaHours = 24, Description = "Rác thải, ô nhiễm, cống tắc nghẽn, nước thải" },
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000003"), Name = "Trật tự Đô thị", Icon = "🏙️", DefaultSlaHours = 72, Description = "Vỉa hè, xây dựng trái phép, lấn chiếm không gian công" },
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000004"), Name = "Chiếu sáng Công cộng", Icon = "💡", DefaultSlaHours = 48, Description = "Đèn đường hỏng, cột điện nguy hiểm" },
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000005"), Name = "Cây xanh & Công viên", Icon = "🌳", DefaultSlaHours = 72, Description = "Cây gãy đổ, cỏ mọc um tùm, hồ nước ô nhiễm" },
                new() { Id = Guid.Parse("22222222-0000-0000-0000-000000000006"), Name = "An ninh Trật tự", Icon = "🛡️", DefaultSlaHours = 12, Description = "Tệ nạn xã hội, tiếng ồn, hành vi vi phạm" },
            };
            context.Categories.AddRange(cats);
            await context.SaveChangesAsync();
        }

        // Seed Users
        if (!context.Users.Any())
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("123456");
            var users = new List<User>
            {
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000001"), Username = "admin", PasswordHash = hash, FullName = "Nguyễn Văn Quản Trị", Email = "admin@reflectgov.vn", Role = UserRole.Admin, DepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000001") },
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000002"), Username = "tiepnhan", PasswordHash = hash, FullName = "Trần Thị Tiếp Nhận", Email = "tiepnhan@reflectgov.vn", Role = UserRole.Dispatcher, DepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000005") },
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000003"), Username = "canbo_dothi", PasswordHash = hash, FullName = "Lê Hoàng Đô Thị", Email = "dothi@reflectgov.vn", Role = UserRole.Officer, DepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000003") },
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000004"), Username = "canbo_moitruong", PasswordHash = hash, FullName = "Phạm Minh Môi Trường", Email = "moitruong@reflectgov.vn", Role = UserRole.Officer, DepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000002") },
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000005"), Username = "canbo_giaothong", PasswordHash = hash, FullName = "Vũ Tuấn Giao Thông", Email = "giaothong@reflectgov.vn", Role = UserRole.Officer, DepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000004") },
                new() { Id = Guid.Parse("33333333-0000-0000-0000-000000000006"), Username = "congdan", PasswordHash = hash, FullName = "Nguyễn Văn A", Email = "nguyenvana@gmail.com", PhoneNumber = "0987654321", Role = UserRole.Citizen },
            };
            context.Users.AddRange(users);
            await context.SaveChangesAsync();
        }

        // Seed Sample Feedbacks
        if (!context.Feedbacks.Any())
        {
            var fb1Id = Guid.Parse("44444444-0000-0000-0000-000000000001");
            var fb2Id = Guid.Parse("44444444-0000-0000-0000-000000000002");
            var fb3Id = Guid.Parse("44444444-0000-0000-0000-000000000003");
            var fb4Id = Guid.Parse("44444444-0000-0000-0000-000000000004");
            var fb5Id = Guid.Parse("44444444-0000-0000-0000-000000000005");
            var fb6Id = Guid.Parse("44444444-0000-0000-0000-000000000006");
            var fb7Id = Guid.Parse("44444444-0000-0000-0000-000000000007");

            var feedbacks = new List<Feedback>
            {
                // #RPT-8492: Hư hỏng mặt đường Nguyễn Trãi (Hoàn thành)
                new()
                {
                    Id = fb1Id,
                    TrackingCode = "RPT-8492",
                    Title = "Hư hỏng mặt đường Nguyễn Trãi",
                    Content = "Mặt đường bị sụt lún tạo thành hố sâu nguy hiểm cho người tham gia giao thông, đặc biệt vào ban đêm. Đã có một số vụ va quẹt nhỏ xảy ra tại gần số nhà 123.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000001"),
                    CitizenName = "Nguyễn Văn A",
                    CitizenPhone = "0987654321",
                    CitizenEmail = "nguyenvana@gmail.com",
                    Address = "123 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
                    Latitude = 20.9984,
                    Longitude = 105.8123,
                    Status = FeedbackStatus.Published,
                    Priority = FeedbackPriority.High,
                    IsPublic = true,
                    AssignedDepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000004"),
                    AssignedUserId = Guid.Parse("33333333-0000-0000-0000-000000000005"),
                    SlaDeadline = DateTime.UtcNow.AddDays(-3),
                    ResolutionSummary = "Đơn vị thi công đã tiến hành san lấp, đầm nèn và trải nhựa lại khu vực hố sụt lún. Đảm bảo an toàn giao thông theo tiêu chuẩn kỹ thuật.",
                    ResolvedAt = DateTime.UtcNow.AddDays(-4),
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow.AddDays(-4),
                },
                // #RPT-8501: Rác thải ùn ứ khu vực chợ (Đang xử lý)
                new()
                {
                    Id = fb2Id,
                    TrackingCode = "RPT-8501",
                    Title = "Rác thải ùn ứ khu vực chợ",
                    Content = "Điểm tập kết rác thải sinh hoạt bừa bãi tại cổng chợ dân sinh, bốc mùi hôi thối và cản trở lối đi lại của người dân trong khu vực.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000002"),
                    CitizenName = "Trần Thị Hoa",
                    CitizenPhone = "0912345678",
                    CitizenEmail = "hoatt@yahoo.com",
                    Address = "Cổng chợ Kim Liên, Phường Kim Liên, Quận Đống Đa, Hà Nội",
                    Latitude = 21.0089,
                    Longitude = 105.8341,
                    Status = FeedbackStatus.InProgress,
                    Priority = FeedbackPriority.Normal,
                    IsPublic = true,
                    AssignedDepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000002"),
                    AssignedUserId = Guid.Parse("33333333-0000-0000-0000-000000000004"),
                    SlaDeadline = DateTime.UtcNow.AddHours(20),
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1),
                },
                // #RPT-8512: Đèn giao thông không hoạt động (Tiếp nhận)
                new()
                {
                    Id = fb3Id,
                    TrackingCode = "RPT-8512",
                    Title = "Đèn giao thông không hoạt động",
                    Content = "Cụm đèn tín hiệu giao thông ngã tư liên tục chớp nháy vàng hoặc tắt ngúm vào giờ cao điểm, gây ùn tắc và nguy cơ tai nạn cao.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000004"),
                    CitizenName = "Phạm Quốc Bảo",
                    CitizenPhone = "0345678901",
                    Address = "Ngã tư Chùa Bộc - Thái Hà, Quận Đống Đa, Hà Nội",
                    Latitude = 21.0090,
                    Longitude = 105.8234,
                    Status = FeedbackStatus.Processing,
                    Priority = FeedbackPriority.Urgent,
                    IsPublic = true,
                    AssignedDepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000004"),
                    SlaDeadline = DateTime.UtcNow.AddHours(3), // AT RISK (< 4h)
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow.AddHours(-6),
                },
                // REP-1042: Severe Pothole on Main St (Open - High Priority, 2h SLA)
                new()
                {
                    Id = fb4Id,
                    TrackingCode = "REP-1042",
                    Title = "Severe Pothole on Main St",
                    Content = "Large pothole causing vehicle damage in the northbound lane near the intersection. Urgent repair needed.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000001"),
                    CitizenName = "David Miller",
                    CitizenPhone = "0934567890",
                    Address = "Main St & 4th Avenue intersection",
                    Latitude = 21.0285,
                    Longitude = 105.8542,
                    Status = FeedbackStatus.Submitted,
                    Priority = FeedbackPriority.Urgent,
                    IsPublic = true,
                    SlaDeadline = DateTime.UtcNow.AddHours(2), // 2h SLA
                    CreatedAt = DateTime.UtcNow.AddHours(-1),
                    UpdatedAt = DateTime.UtcNow.AddHours(-1),
                },
                // REP-1045: Graffiti on Bus Shelter (Open - Medium Priority, 24h SLA)
                new()
                {
                    Id = fb5Id,
                    TrackingCode = "REP-1045",
                    Title = "Graffiti on Bus Shelter",
                    Content = "Vandalism on the glass panels of the downtown bus shelter obscuring route schedules.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000003"),
                    CitizenName = "Sarah Jenkins",
                    CitizenPhone = "0945678901",
                    Address = "Downtown Bus Terminal, Shelter #3",
                    Latitude = 21.0310,
                    Longitude = 105.8450,
                    Status = FeedbackStatus.Submitted,
                    Priority = FeedbackPriority.Normal,
                    IsPublic = true,
                    SlaDeadline = DateTime.UtcNow.AddHours(23),
                    CreatedAt = DateTime.UtcNow.AddHours(-2),
                    UpdatedAt = DateTime.UtcNow.AddHours(-2),
                },
                // REP-2024-0891: Water pipe burst (OVERDUE - SLA Alert)
                new()
                {
                    Id = fb6Id,
                    TrackingCode = "REP-2024-0891",
                    Title = "Water pipe burst flooding street",
                    Content = "Underground water pipe burst causing serious flooding and water pressure loss in surrounding households.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000001"),
                    CitizenName = "Lê Hoàng Quân",
                    CitizenPhone = "0956789012",
                    Address = "Đường Giải Phóng, Quận Hoàng Mai, Hà Nội",
                    Latitude = 20.9850,
                    Longitude = 105.8400,
                    Status = FeedbackStatus.InProgress,
                    Priority = FeedbackPriority.Urgent,
                    IsPublic = true,
                    AssignedDepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000002"),
                    SlaDeadline = DateTime.UtcNow.AddHours(-24), // OVERDUE
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2),
                },
                // REP-2024-0905: Illegal dumping (AT RISK - SLA Alert)
                new()
                {
                    Id = fb7Id,
                    TrackingCode = "REP-2024-0905",
                    Title = "Illegal chemical waste dumping in canal",
                    Content = "Industrial waste discharged directly into drainage canal without treatment, causing discoloration and chemical odor.",
                    CategoryId = Guid.Parse("22222222-0000-0000-0000-000000000002"),
                    CitizenName = "Vũ Bích Thủy",
                    CitizenPhone = "0967890123",
                    Address = "Kênh Cầu Sa, Quận Nam Từ Liêm, Hà Nội",
                    Latitude = 21.0150,
                    Longitude = 105.7700,
                    Status = FeedbackStatus.Processing,
                    Priority = FeedbackPriority.High,
                    IsPublic = true,
                    AssignedDepartmentId = Guid.Parse("11111111-0000-0000-0000-000000000002"),
                    SlaDeadline = DateTime.UtcNow.AddHours(4), // AT RISK
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow.AddHours(-4),
                },
            };

            context.Feedbacks.AddRange(feedbacks);
            await context.SaveChangesAsync();

            // Seed Attachments cho #RPT-8492
            context.FeedbackAttachments.AddRange(new List<FeedbackAttachment>
            {
                new()
                {
                    FeedbackId = fb1Id,
                    FileName = "hien_truong_ho_sut_lun.jpg",
                    FilePath = "https://lh3.googleusercontent.com/aida-public/AB6AXuDzlRgyzXPdMIw-TMhEOx-oe9sqSyxlC3h0eRrdxOLRpwUEiIaFEqdiINYAC-MRhIuXYP-IiC76bIvOe6xRgZshtJ4H88ZLiq3ZUyW35IeTCdAq6GAUDblDHDdmd2qEIRNXOHhM5FAxw_CfKcYNVvVZWo7KwkFGvZqUD2ydWxXBEEQY_INzyZ1T72p14f0awOHXOKEwvLvwewpmKmmsJ2k12lu0F1ufx1EsCIgEFIljiEtj1SYHLBgHKw",
                    FileType = "image/jpeg",
                    FileSizeBytes = 1024 * 450,
                    AttachmentType = AttachmentType.CitizenUpload,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new()
                {
                    FeedbackId = fb1Id,
                    FileName = "nghiem_thu_va_duong.jpg",
                    FilePath = "https://lh3.googleusercontent.com/aida-public/AB6AXuAAd-ytbmPnwmMpmD2FkxGqY63jkfOyc8SIx7J5oJtQSVwp8NUcZE6Mjtvr_xiFXoE5BCoKzKvEWTaAbOJkOzz08a0RTIz6fnZUqVLh_1-ZLRmTvb9P3XU1fKAeQ6z7vua9xS8ec80XXwuhpX8TxJ52szDiU3Gp2DmC9dYFvPOUt8JVLUIOWfV_ibE_-4Cp9sv0lQgr7xG_5qJfgyzt1W2eDTm-tFqdvee7KzPDUhlMOaHAvzdu35i5MQ",
                    FileType = "image/jpeg",
                    FileSizeBytes = 1024 * 520,
                    AttachmentType = AttachmentType.ResolutionProof,
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                }
            });

            // Seed FeedbackLogs cho #RPT-8492
            var logs = new List<FeedbackLog>
            {
                new() { FeedbackId = fb1Id, ActorName = "Nguyễn Văn A", ActorRole = "Citizen", Action = "Submitted", Note = "Công dân gửi phản ánh lên Cổng dịch vụ công ReflectGov", CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new() { FeedbackId = fb1Id, ActorName = "Trần Thị Tiếp Nhận", ActorRole = "Dispatcher", Action = "Verified", Note = "Tiếp nhận hợp lệ. Chuyển Đơn vị Quản lý Giao thông xử lý khẩn.", CreatedAt = DateTime.UtcNow.AddDays(-9) },
                new() { FeedbackId = fb1Id, ActorName = "Trần Thị Tiếp Nhận", ActorRole = "Dispatcher", Action = "Assigned", Note = "Giao Đơn vị Giao thông, cán bộ Vũ Tuấn Giao Thông. SLA: 48h. Mức độ: Cao.", CreatedAt = DateTime.UtcNow.AddDays(-9) },
                new() { FeedbackId = fb1Id, ActorName = "Vũ Tuấn Giao Thông", ActorRole = "Officer", Action = "UpdatedProgress", Note = "Đã xuống kiểm tra thực địa, lập phương án san lấp và trải nhựa.", CreatedAt = DateTime.UtcNow.AddDays(-7) },
                new() { FeedbackId = fb1Id, ActorName = "Vũ Tuấn Giao Thông", ActorRole = "Officer", Action = "Resolved", Note = "Đã hoàn tất san lấp, đầm nèn và trải nhựa bê tông asphalt. Đính kèm ảnh nghiệm thu.", CreatedAt = DateTime.UtcNow.AddDays(-4) },
                new() { FeedbackId = fb1Id, ActorName = "Nguyễn Văn Quản Trị", ActorRole = "Admin", Action = "Approved", Note = "Lãnh đạo đã kiểm tra hồ sơ và nghiệm thu. Phê duyệt công khai kết quả cho người dân.", CreatedAt = DateTime.UtcNow.AddDays(-4) },
            };

            context.FeedbackLogs.AddRange(logs);

            // Rating cho #RPT-8492
            context.FeedbackRatings.Add(new FeedbackRating
            {
                FeedbackId = fb1Id,
                Score = 5,
                Comment = "Đơn vị xử lý rất nhanh, mặt đường đã bằng phẳng an toàn. Xin cảm ơn cơ quan chức năng!",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            });

            await context.SaveChangesAsync();
        }
    }
}
