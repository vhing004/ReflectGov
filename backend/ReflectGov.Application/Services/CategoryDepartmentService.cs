using Microsoft.EntityFrameworkCore;
using ReflectGov.Application.DTOs;
using ReflectGov.Infrastructure.Data;

namespace ReflectGov.Application.Services;

public interface ICategoryDepartmentService
{
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<List<DepartmentDto>> GetDepartmentsAsync();
}

public class CategoryDepartmentService : ICategoryDepartmentService
{
    private readonly AppDbContext _context;

    public CategoryDepartmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        var cats = await _context.Categories
            .Include(c => c.Feedbacks)
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return cats.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Icon = c.Icon,
            DefaultSlaHours = c.DefaultSlaHours,
            IsActive = c.IsActive,
            FeedbackCount = c.Feedbacks.Count
        }).ToList();
    }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync()
    {
        var depts = await _context.Departments
            .Include(d => d.Users)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();

        return depts.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            HeadName = d.HeadName,
            PhoneNumber = d.PhoneNumber,
            IsActive = d.IsActive,
            StaffCount = d.Users.Count
        }).ToList();
    }
}
