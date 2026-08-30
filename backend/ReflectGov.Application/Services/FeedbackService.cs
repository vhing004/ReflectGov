using Microsoft.EntityFrameworkCore;
using ReflectGov.Application.DTOs;
using ReflectGov.Domain.Entities;
using ReflectGov.Domain.Enums;
using ReflectGov.Infrastructure.Data;
using ReflectGov.Infrastructure.Storage;

namespace ReflectGov.Application.Services;

public interface IFeedbackService
{
    Task<FeedbackDetailDto> SubmitFeedbackAsync(CreateFeedbackRequest request, Guid? citizenUserId = null);
    Task<FeedbackDetailDto?> TrackByCodeAsync(string trackingCode);
    Task<List<FeedbackPublicDto>> GetPublicFeedbacksAsync(Guid? categoryId = null, string? search = null);
    Task<FeedbackRatingDto> RateFeedbackAsync(Guid feedbackId, RateFeedbackRequest request);
    Task<PagedResult<FeedbackDetailDto>> GetFeedbacksPagedAsync(FeedbackFilterRequest filter, UserRole? actorRole = null, Guid? deptId = null);
    Task<FeedbackDetailDto?> GetFeedbackByIdAsync(Guid id);
    Task<FeedbackDetailDto> VerifyFeedbackAsync(Guid id, VerifyFeedbackRequest request, string actorName, string actorRole);
    Task<FeedbackDetailDto> AssignFeedbackAsync(Guid id, AssignFeedbackRequest request, string actorName, string actorRole);
    Task<FeedbackDetailDto> UpdateProgressAsync(Guid id, UpdateProgressRequest request, string actorName, string actorRole);
    Task<FeedbackDetailDto> ResolveFeedbackAsync(Guid id, ResolveFeedbackRequest request, string actorName, string actorRole);
    Task<FeedbackDetailDto> ApproveFeedbackAsync(Guid id, ApproveFeedbackRequest request, string actorName, string actorRole);
}

public class FeedbackService : IFeedbackService
{
    private readonly AppDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IEmailNotificationService _emailService;

    public FeedbackService(AppDbContext context, IFileStorageService fileStorage, IEmailNotificationService emailService)
    {
        _context = context;
        _fileStorage = fileStorage;
        _emailService = emailService;
    }

    public async Task<FeedbackDetailDto> SubmitFeedbackAsync(CreateFeedbackRequest request, Guid? citizenUserId = null)
    {
        var category = await _context.Categories.FindAsync(request.CategoryId)
            ?? throw new ArgumentException("Lĩnh vực phản ánh không hợp lệ.");

        var today = DateTime.UtcNow.Date;
        var countToday = await _context.Feedbacks.CountAsync(f => f.CreatedAt.Date == today);
        var trackingCode = $"PA-{DateTime.UtcNow:yyyyMMdd}-{(countToday + 1):D4}";

        var feedback = new Feedback
        {
            TrackingCode = trackingCode,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            CategoryId = request.CategoryId,
            CitizenId = citizenUserId,
            CitizenName = request.CitizenName.Trim(),
            CitizenPhone = request.CitizenPhone.Trim(),
            CitizenEmail = request.CitizenEmail?.Trim(),
            Address = request.Address.Trim(),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Status = FeedbackStatus.Submitted,
            Priority = FeedbackPriority.Normal,
            IsPublic = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Files != null && request.Files.Count > 0)
        {
            foreach (var file in request.Files)
            {
                var (filePath, fileName, fileSize, fileType) = await _fileStorage.SaveFileAsync(file, "citizen_uploads");
                feedback.Attachments.Add(new FeedbackAttachment
                {
                    FileName = fileName,
                    FilePath = filePath,
                    FileType = fileType,
                    FileSizeBytes = fileSize,
                    AttachmentType = AttachmentType.CitizenUpload
                });
            }
        }

        feedback.Logs.Add(new FeedbackLog
        {
            ActorName = string.IsNullOrWhiteSpace(request.CitizenName) ? "Công dân" : request.CitizenName,
            ActorRole = "Citizen",
            Action = "Submitted",
            Note = "Công dân gửi phản ánh lên hệ thống ReflectGov",
            CreatedAt = DateTime.UtcNow
        });

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(feedback.CitizenEmail))
            _ = _emailService.SendFeedbackSubmittedEmailAsync(feedback.CitizenEmail, feedback.CitizenName, feedback.TrackingCode, feedback.Title);

        return (await GetFeedbackByIdAsync(feedback.Id))!;
    }

    public async Task<FeedbackDetailDto?> TrackByCodeAsync(string trackingCode)
    {
        var code = trackingCode.Trim().TrimStart('#').ToLower();
        var feedback = await _context.Feedbacks
            .Include(f => f.Category)
            .Include(f => f.AssignedDepartment)
            .Include(f => f.AssignedUser)
            .Include(f => f.Attachments)
            .Include(f => f.Logs.OrderBy(l => l.CreatedAt))
            .Include(f => f.Rating)
            .FirstOrDefaultAsync(f => f.TrackingCode.ToLower() == code || f.TrackingCode.ToLower() == $"#{code}");

        return feedback == null ? null : MapToDetailDto(feedback);
    }

    public async Task<List<FeedbackPublicDto>> GetPublicFeedbacksAsync(Guid? categoryId = null, string? search = null)
    {
        var query = _context.Feedbacks
            .Include(f => f.Category)
            .Include(f => f.Attachments)
            .Include(f => f.Rating)
            .Where(f => f.IsPublic && f.Status != FeedbackStatus.Rejected)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(f => f.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(f => f.Title.ToLower().Contains(s) || f.Address.ToLower().Contains(s) || f.TrackingCode.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(f => f.CreatedAt).Take(100).ToListAsync();
        return list.Select(MapToPublicDto).ToList();
    }

    public async Task<FeedbackRatingDto> RateFeedbackAsync(Guid feedbackId, RateFeedbackRequest request)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Rating)
            .Include(f => f.Logs)
            .FirstOrDefaultAsync(f => f.Id == feedbackId)
            ?? throw new KeyNotFoundException("Không tìm thấy phản ánh.");

        if (feedback.Status != FeedbackStatus.Published && feedback.Status != FeedbackStatus.Closed)
            throw new InvalidOperationException("Chỉ có thể đánh giá phản ánh đã hoàn thành.");

        if (feedback.Rating != null)
        {
            feedback.Rating.Score = Math.Clamp(request.Score, 1, 5);
            feedback.Rating.Comment = request.Comment?.Trim();
            feedback.Rating.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            var rating = new FeedbackRating
            {
                FeedbackId = feedbackId,
                Score = Math.Clamp(request.Score, 1, 5),
                Comment = request.Comment?.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            _context.FeedbackRatings.Add(rating);
            feedback.Rating = rating;
        }

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            FeedbackId = feedback.Id,
            ActorName = feedback.CitizenName,
            ActorRole = "Citizen",
            Action = "Rated",
            Note = $"Đánh giá {request.Score} sao. Góp ý: {request.Comment}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return new FeedbackRatingDto { Id = feedback.Rating!.Id, Score = feedback.Rating.Score, Comment = feedback.Rating.Comment, CreatedAt = feedback.Rating.CreatedAt };
    }

    public async Task<PagedResult<FeedbackDetailDto>> GetFeedbacksPagedAsync(FeedbackFilterRequest filter, UserRole? actorRole = null, Guid? deptId = null)
    {
        var query = _context.Feedbacks
            .Include(f => f.Category)
            .Include(f => f.AssignedDepartment)
            .Include(f => f.AssignedUser)
            .Include(f => f.Attachments)
            .Include(f => f.Logs.OrderBy(l => l.CreatedAt))
            .Include(f => f.Rating)
            .AsQueryable();

        if (actorRole == UserRole.Officer && deptId.HasValue)
            query = query.Where(f => f.AssignedDepartmentId == deptId.Value);

        if (filter.Status.HasValue) query = query.Where(f => f.Status == filter.Status.Value);
        if (filter.Priority.HasValue) query = query.Where(f => f.Priority == filter.Priority.Value);
        if (filter.CategoryId.HasValue) query = query.Where(f => f.CategoryId == filter.CategoryId.Value);
        if (filter.DepartmentId.HasValue) query = query.Where(f => f.AssignedDepartmentId == filter.DepartmentId.Value);

        if (filter.IsOverdue == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(f => f.SlaDeadline.HasValue && f.SlaDeadline.Value < now &&
                f.Status != FeedbackStatus.Published && f.Status != FeedbackStatus.Closed && f.Status != FeedbackStatus.Rejected);
        }

        if (filter.FromDate.HasValue) query = query.Where(f => f.CreatedAt >= filter.FromDate.Value);
        if (filter.ToDate.HasValue) query = query.Where(f => f.CreatedAt <= filter.ToDate.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(f => f.Title.ToLower().Contains(s) || f.TrackingCode.ToLower().Contains(s) || f.CitizenName.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(f => f.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync();

        return new PagedResult<FeedbackDetailDto>
        {
            Items = items.Select(MapToDetailDto).ToList(),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<FeedbackDetailDto?> GetFeedbackByIdAsync(Guid id)
    {
        var fb = await _context.Feedbacks
            .Include(f => f.Category)
            .Include(f => f.AssignedDepartment)
            .Include(f => f.AssignedUser)
            .Include(f => f.Attachments)
            .Include(f => f.Logs.OrderBy(l => l.CreatedAt))
            .Include(f => f.Rating)
            .FirstOrDefaultAsync(f => f.Id == id);

        return fb == null ? null : MapToDetailDto(fb);
    }

    public async Task<FeedbackDetailDto> VerifyFeedbackAsync(Guid id, VerifyFeedbackRequest request, string actorName, string actorRole)
    {
        var fb = await GetOrThrowAsync(id);

        fb.Status = request.IsApproved ? FeedbackStatus.Processing : FeedbackStatus.Rejected;
        fb.UpdatedAt = DateTime.UtcNow;

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            FeedbackId = fb.Id,
            ActorName = actorName,
            ActorRole = actorRole,
            Action = request.IsApproved ? "Verified" : "Rejected",
            Note = request.IsApproved ? "Tiếp nhận hợp lệ, chờ phân công." : $"Từ chối: {request.RejectReason}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return (await GetFeedbackByIdAsync(id))!;
    }

    public async Task<FeedbackDetailDto> AssignFeedbackAsync(Guid id, AssignFeedbackRequest request, string actorName, string actorRole)
    {
        var fb = await GetOrThrowAsync(id);
        if (fb.Status == FeedbackStatus.Published || fb.Status == FeedbackStatus.Closed)
            throw new InvalidOperationException("Không thể phân công lại hồ sơ đã nghiệm thu công khai hoàn thành.");

        var dept = await _context.Departments.FindAsync(request.DepartmentId)
            ?? throw new ArgumentException("Phòng ban/Đơn vị được chỉ định không tồn tại.");

        fb.AssignedDepartmentId = request.DepartmentId;
        fb.AssignedUserId = request.AssignedUserId;
        fb.Priority = request.Priority;
        fb.Status = FeedbackStatus.Processing;

        var category = await _context.Categories.FindAsync(fb.CategoryId);
        var slaHours = (request.CustomSlaHours.HasValue && request.CustomSlaHours.Value > 0)
            ? request.CustomSlaHours.Value
            : (category?.DefaultSlaHours ?? 72);

        fb.SlaDeadline = DateTime.UtcNow.AddHours(slaHours);
        fb.UpdatedAt = DateTime.UtcNow;

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            FeedbackId = fb.Id,
            ActorName = actorName,
            ActorRole = actorRole,
            Action = "Assigned",
            Note = $"Giao: {dept.Name}. Ưu tiên: {request.Priority}. SLA: {slaHours}h. Ghi chú: {request.Note}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        if (fb.AssignedUserId.HasValue)
        {
            var officer = await _context.Users.FindAsync(fb.AssignedUserId.Value);
            if (officer?.Email != null)
                _ = _emailService.SendAssignmentNoticeEmailAsync(officer.Email, officer.FullName, fb.TrackingCode, fb.Title, dept.Name);
        }

        return (await GetFeedbackByIdAsync(id))!;
    }

    public async Task<FeedbackDetailDto> UpdateProgressAsync(Guid id, UpdateProgressRequest request, string actorName, string actorRole)
    {
        var fb = await GetOrThrowAsync(id);

        if (fb.Status != FeedbackStatus.Processing && fb.Status != FeedbackStatus.InProgress)
            throw new InvalidOperationException("Chỉ có thể cập nhật tiến độ cho hồ sơ đã được phân công và đang trong quá trình xử lý.");

        fb.Status = FeedbackStatus.InProgress;
        fb.UpdatedAt = DateTime.UtcNow;

        if (request.Files != null)
        {
            foreach (var file in request.Files)
            {
                var (filePath, fileName, fileSize, fileType) = await _fileStorage.SaveFileAsync(file, "progress_updates");
                _context.FeedbackAttachments.Add(new FeedbackAttachment
                {
                    FeedbackId = fb.Id,
                    FileName = fileName,
                    FilePath = filePath,
                    FileType = fileType,
                    FileSizeBytes = fileSize,
                    AttachmentType = AttachmentType.ProgressUpdate
                });
            }
        }

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            FeedbackId = fb.Id,
            ActorName = actorName,
            ActorRole = actorRole,
            Action = "UpdatedProgress",
            Note = request.Note,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return (await GetFeedbackByIdAsync(id))!;
    }

    public async Task<FeedbackDetailDto> ResolveFeedbackAsync(Guid id, ResolveFeedbackRequest request, string actorName, string actorRole)
    {
        var fb = await GetOrThrowAsync(id);

        if (fb.Status != FeedbackStatus.Processing && fb.Status != FeedbackStatus.InProgress)
            throw new InvalidOperationException("Hồ sơ phải được phân công và đang xử lý hiện trường trước khi báo cáo hoàn thành.");

        if (string.IsNullOrWhiteSpace(request.ResolutionSummary))
            throw new ArgumentException("Vui lòng cung cấp nội dung tóm tắt kết quả xử lý hoàn thành.");

        fb.ResolutionSummary = request.ResolutionSummary.Trim();
        fb.Status = FeedbackStatus.ResolvedPendingApproval;
        fb.UpdatedAt = DateTime.UtcNow;

        if (request.ProofFiles != null)
        {
            foreach (var file in request.ProofFiles)
            {
                var (filePath, fileName, fileSize, fileType) = await _fileStorage.SaveFileAsync(file, "resolution_proofs");
                _context.FeedbackAttachments.Add(new FeedbackAttachment
                {
                    FeedbackId = fb.Id,
                    FileName = fileName,
                    FilePath = filePath,
                    FileType = fileType,
                    FileSizeBytes = fileSize,
                    AttachmentType = AttachmentType.ResolutionProof
                });
            }
        }

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            FeedbackId = fb.Id,
            ActorName = actorName,
            ActorRole = actorRole,
            Action = "Resolved",
            Note = $"Báo cáo hoàn thành hiện trường: {request.ResolutionSummary}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return (await GetFeedbackByIdAsync(id))!;
    }

    public async Task<FeedbackDetailDto> ApproveFeedbackAsync(Guid id, ApproveFeedbackRequest request, string actorName, string actorRole)
    {
        var fb = await GetOrThrowAsync(id);

        // BẮT BUỘC: Hồ sơ phải được Cán bộ hiện trường xử lý xong và nộp báo cáo (ResolvedPendingApproval) trước khi Lãnh đạo nghiệm thu!
        if (fb.Status != FeedbackStatus.ResolvedPendingApproval)
        {
            throw new InvalidOperationException("Hồ sơ chưa được cán bộ hiện trường xử lý và nộp báo cáo hoàn thành (yêu cầu trạng thái: Chờ Lãnh đạo phê duyệt). Không thể nghiệm thu tắt quy trình.");
        }

        if (request.IsApproved)
        {
            fb.Status = FeedbackStatus.Published;
            fb.ResolvedAt = DateTime.UtcNow;
            _context.FeedbackLogs.Add(new FeedbackLog
            {
                FeedbackId = fb.Id,
                ActorName = actorName,
                ActorRole = actorRole,
                Action = "Approved",
                Note = $"Lãnh đạo phê duyệt công khai kết quả. {request.Note}",
                CreatedAt = DateTime.UtcNow
            });

            if (!string.IsNullOrWhiteSpace(fb.CitizenEmail))
                _ = _emailService.SendFeedbackResolvedEmailAsync(fb.CitizenEmail, fb.CitizenName, fb.TrackingCode, fb.Title, fb.ResolutionSummary ?? "Đã hoàn tất.");
        }
        else
        {
            fb.Status = FeedbackStatus.InProgress;
            _context.FeedbackLogs.Add(new FeedbackLog
            {
                FeedbackId = fb.Id,
                ActorName = actorName,
                ActorRole = actorRole,
                Action = "RejectedResolution",
                Note = $"Lãnh đạo yêu cầu xử lý lại hiện trường: {request.Note}",
                CreatedAt = DateTime.UtcNow
            });
        }

        fb.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return (await GetFeedbackByIdAsync(id))!;
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private async Task<Feedback> GetOrThrowAsync(Guid id)
    {
        return await _context.Feedbacks
            .FirstOrDefaultAsync(f => f.Id == id)
            ?? throw new KeyNotFoundException("Không tìm thấy phản ánh.");
    }

    private static FeedbackPublicDto MapToPublicDto(Feedback f) => new()
    {
        Id = f.Id,
        TrackingCode = f.TrackingCode,
        Title = f.Title,
        Content = f.Content,
        CategoryName = f.Category?.Name ?? string.Empty,
        CategoryIcon = f.Category?.Icon,
        Address = f.Address,
        Latitude = f.Latitude,
        Longitude = f.Longitude,
        Status = f.Status,
        Priority = f.Priority,
        ResolutionSummary = f.ResolutionSummary,
        ResolvedAt = f.ResolvedAt,
        CreatedAt = f.CreatedAt,
        Attachments = f.Attachments.Select(a => new FeedbackAttachmentDto
        {
            Id = a.Id, FileName = a.FileName, FilePath = a.FilePath,
            FileType = a.FileType, FileSizeBytes = a.FileSizeBytes,
            AttachmentType = a.AttachmentType.ToString(), CreatedAt = a.CreatedAt
        }).ToList(),
        Rating = f.Rating == null ? null : new FeedbackRatingDto { Id = f.Rating.Id, Score = f.Rating.Score, Comment = f.Rating.Comment, CreatedAt = f.Rating.CreatedAt }
    };

    private static FeedbackDetailDto MapToDetailDto(Feedback f) => new()
    {
        Id = f.Id,
        TrackingCode = f.TrackingCode,
        Title = f.Title,
        Content = f.Content,
        CategoryId = f.CategoryId,
        CategoryName = f.Category?.Name ?? string.Empty,
        CategoryIcon = f.Category?.Icon,
        CitizenName = f.CitizenName,
        CitizenPhone = f.CitizenPhone,
        CitizenEmail = f.CitizenEmail,
        Address = f.Address,
        Latitude = f.Latitude,
        Longitude = f.Longitude,
        Status = f.Status,
        Priority = f.Priority,
        SlaDeadline = f.SlaDeadline,
        AssignedDepartmentId = f.AssignedDepartmentId,
        AssignedDepartmentName = f.AssignedDepartment?.Name,
        AssignedUserId = f.AssignedUserId,
        AssignedUserName = f.AssignedUser?.FullName,
        ResolutionSummary = f.ResolutionSummary,
        ResolvedAt = f.ResolvedAt,
        CreatedAt = f.CreatedAt,
        Attachments = f.Attachments.Select(a => new FeedbackAttachmentDto
        {
            Id = a.Id, FileName = a.FileName, FilePath = a.FilePath,
            FileType = a.FileType, FileSizeBytes = a.FileSizeBytes,
            AttachmentType = a.AttachmentType.ToString(), CreatedAt = a.CreatedAt
        }).ToList(),
        Logs = f.Logs.OrderBy(l => l.CreatedAt).Select(l => new FeedbackLogDto
        {
            Id = l.Id, ActorName = l.ActorName, ActorRole = l.ActorRole,
            Action = l.Action, Note = l.Note, CreatedAt = l.CreatedAt
        }).ToList(),
        Rating = f.Rating == null ? null : new FeedbackRatingDto { Id = f.Rating.Id, Score = f.Rating.Score, Comment = f.Rating.Comment, CreatedAt = f.Rating.CreatedAt }
    };
}
