using ReflectGov.Domain.Enums;

namespace ReflectGov.Domain.Entities;

public class Feedback
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TrackingCode { get; set; } = string.Empty; // PA-YYYYMMDD-XXXX
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Lĩnh vực
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    // Thông tin công dân
    public Guid? CitizenId { get; set; }
    public User? Citizen { get; set; }
    public string CitizenName { get; set; } = string.Empty;
    public string CitizenPhone { get; set; } = string.Empty;
    public string? CitizenEmail { get; set; }

    // Vị trí hiện trường
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Trạng thái xử lý
    public FeedbackStatus Status { get; set; } = FeedbackStatus.Submitted;
    public FeedbackPriority Priority { get; set; } = FeedbackPriority.Normal;
    public bool IsPublic { get; set; } = true;

    // Phân công xử lý
    public Guid? AssignedDepartmentId { get; set; }
    public Department? AssignedDepartment { get; set; }
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }

    // SLA & kết quả
    public DateTime? SlaDeadline { get; set; }
    public string? ResolutionSummary { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<FeedbackAttachment> Attachments { get; set; } = new List<FeedbackAttachment>();
    public ICollection<FeedbackLog> Logs { get; set; } = new List<FeedbackLog>();
    public FeedbackRating? Rating { get; set; }
}
