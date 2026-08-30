namespace ReflectGov.Domain.Enums;

public enum FeedbackStatus
{
    Submitted = 0,             // Công dân vừa gửi, chờ sơ duyệt
    Processing = 1,            // Tiếp nhận hợp lệ, đang phân công
    InProgress = 2,            // Đang xử lý hiện trường
    ResolvedPendingApproval = 3, // Cán bộ báo cáo hoàn thành, chờ lãnh đạo duyệt
    Published = 4,             // Lãnh đạo đã duyệt, công khai kết quả cho dân
    Closed = 5,                // Đã đóng hồ sơ sau khi đánh giá
    Rejected = 6               // Từ chối tiếp nhận
}

public enum FeedbackPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

public enum UserRole
{
    Citizen = 0,
    Officer = 1,
    Dispatcher = 2,
    Admin = 3
}

public enum AttachmentType
{
    CitizenUpload = 0,
    ResolutionProof = 1,
    ProgressUpdate = 2
}
