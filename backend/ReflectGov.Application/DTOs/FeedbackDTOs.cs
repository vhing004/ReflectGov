using Microsoft.AspNetCore.Http;
using ReflectGov.Domain.Enums;

namespace ReflectGov.Application.DTOs;

public class CreateFeedbackRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }

    public string CitizenName { get; set; } = string.Empty;
    public string CitizenPhone { get; set; } = string.Empty;
    public string? CitizenEmail { get; set; }

    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public List<IFormFile>? Files { get; set; }
}

public class FeedbackAttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string AttachmentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class FeedbackLogDto
{
    public Guid Id { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FeedbackRatingDto
{
    public Guid Id { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FeedbackPublicDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public string Address { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public FeedbackStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public FeedbackPriority Priority { get; set; }
    public string? ResolutionSummary { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<FeedbackAttachmentDto> Attachments { get; set; } = new();
    public FeedbackRatingDto? Rating { get; set; }
}

public class FeedbackDetailDto : FeedbackPublicDto
{
    public Guid CategoryId { get; set; }
    public string CitizenName { get; set; } = string.Empty;
    public string CitizenPhone { get; set; } = string.Empty;
    public string? CitizenEmail { get; set; }

    public DateTime? SlaDeadline { get; set; }
    public bool IsOverdue => SlaDeadline.HasValue && DateTime.UtcNow > SlaDeadline.Value && Status != FeedbackStatus.Published && Status != FeedbackStatus.Closed && Status != FeedbackStatus.Rejected;
    public double? HoursLeft => SlaDeadline.HasValue ? (SlaDeadline.Value - DateTime.UtcNow).TotalHours : null;

    public Guid? AssignedDepartmentId { get; set; }
    public string? AssignedDepartmentName { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }

    public string? SlaLabel
    {
        get
        {
            if (Status == FeedbackStatus.Published || Status == FeedbackStatus.Closed) return "Hoàn thành";
            if (!SlaDeadline.HasValue) return null;
            var diff = SlaDeadline.Value - DateTime.UtcNow;
            if (diff.TotalHours < 0) return "Quá hạn (Overdue)";
            if (diff.TotalHours < 1) return $"{Math.Max(1, (int)diff.TotalMinutes)}m SLA";
            if (diff.TotalHours < 24) return $"{(int)Math.Ceiling(diff.TotalHours)}h SLA";
            return $"{(int)Math.Ceiling(diff.TotalDays)}d SLA";
        }
    }

    public List<FeedbackAttachmentDto> CitizenUploads => Attachments.Where(a => a.AttachmentType == "CitizenUpload").ToList();
    public List<FeedbackAttachmentDto> ResolutionProofs => Attachments.Where(a => a.AttachmentType == "ResolutionProof").ToList();
    public List<FeedbackAttachmentDto> ProgressUploads => Attachments.Where(a => a.AttachmentType == "ProgressUpdate").ToList();

    public List<FeedbackLogDto> Logs { get; set; } = new();
}

public class FeedbackFilterRequest
{
    public string? Search { get; set; }
    public FeedbackStatus? Status { get; set; }
    public FeedbackPriority? Priority { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool? IsOverdue { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

// Workflow Action Requests
public class VerifyFeedbackRequest
{
    public bool IsApproved { get; set; } // true: Tiếp nhận, false: Từ chối
    public string? RejectReason { get; set; }
}

public class AssignFeedbackRequest
{
    public Guid DepartmentId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public FeedbackPriority Priority { get; set; } = FeedbackPriority.Normal;
    public int? CustomSlaHours { get; set; }
    public string? Note { get; set; }
}

public class UpdateProgressRequest
{
    public string Note { get; set; } = string.Empty;
    public List<IFormFile>? Files { get; set; }
}

public class ResolveFeedbackRequest
{
    public string ResolutionSummary { get; set; } = string.Empty;
    public List<IFormFile>? ProofFiles { get; set; }
}

public class ApproveFeedbackRequest
{
    public bool IsApproved { get; set; } // true: Phê duyệt công khai, false: Yêu cầu xử lý lại
    public string? Note { get; set; }
}

public class RateFeedbackRequest
{
    public int Score { get; set; } // 1 - 5
    public string? Comment { get; set; }
}
