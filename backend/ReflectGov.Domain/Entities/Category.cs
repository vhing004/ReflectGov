namespace ReflectGov.Domain.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }         // emoji hoặc icon class
    public int DefaultSlaHours { get; set; } = 72;  // SLA mặc định theo giờ
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
