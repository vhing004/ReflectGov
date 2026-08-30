using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using ReflectGov.Application.DTOs;
using ReflectGov.Domain.Entities;
using ReflectGov.Domain.Enums;
using ReflectGov.Infrastructure.Data;

namespace ReflectGov.Application.Services;

public interface IUserService
{
    Task<List<UserProfileDto>> GetUsersAsync(UserRole? role = null);
    Task<UserProfileDto?> GetUserByIdAsync(Guid id);
    Task<UserProfileDto> CreateUserAsync(CreateUserRequest request);
    Task<UserProfileDto> ToggleActiveAsync(Guid id);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserProfileDto>> GetUsersAsync(UserRole? role = null)
    {
        var query = _context.Users.Include(u => u.Department).AsQueryable();
        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        return await query
            .OrderBy(u => u.Role)
            .ThenBy(u => u.FullName)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                DepartmentId = u.DepartmentId,
                DepartmentName = u.Department != null ? u.Department.Name : null,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToListAsync();
    }

    public async Task<UserProfileDto?> GetUserByIdAsync(Guid id)
    {
        var u = await _context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);
        if (u == null) return null;

        return new UserProfileDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            DepartmentId = u.DepartmentId,
            DepartmentName = u.Department?.Name,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        };
    }

    public async Task<UserProfileDto> CreateUserAsync(CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.Trim().ToLower()))
            throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

        var user = new User
        {
            Username = request.Username.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Email = request.Email?.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = request.Role,
            DepartmentId = request.DepartmentId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (await GetUserByIdAsync(user.Id))!;
    }

    public async Task<UserProfileDto> ToggleActiveAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return (await GetUserByIdAsync(id))!;
    }
}
