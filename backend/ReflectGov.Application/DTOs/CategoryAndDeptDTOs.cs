namespace ReflectGov.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int DefaultSlaHours { get; set; }
    public bool IsActive { get; set; }
    public int FeedbackCount { get; set; }
}

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? HeadName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public int StaffCount { get; set; }
}
