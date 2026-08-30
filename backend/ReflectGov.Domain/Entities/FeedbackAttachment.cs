using ReflectGov.Domain.Enums;

namespace ReflectGov.Domain.Entities;

public class FeedbackAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FeedbackId { get; set; }
    public Feedback? Feedback { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;  // image/jpeg, video/mp4...
    public long FileSizeBytes { get; set; }
    public AttachmentType AttachmentType { get; set; } = AttachmentType.CitizenUpload;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
