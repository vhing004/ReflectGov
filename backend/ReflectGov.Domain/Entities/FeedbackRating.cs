namespace ReflectGov.Domain.Entities;

public class FeedbackRating
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FeedbackId { get; set; }
    public Feedback? Feedback { get; set; }

    public int Score { get; set; }  // 1 - 5 sao
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
