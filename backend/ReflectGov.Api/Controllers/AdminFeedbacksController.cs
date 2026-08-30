using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReflectGov.Application.DTOs;
using ReflectGov.Application.Services;
using ReflectGov.Domain.Enums;

namespace ReflectGov.Api.Controllers;

[ApiController]
[Route("api/admin/feedbacks")]
public class AdminFeedbacksController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public AdminFeedbacksController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    /// <summary>
    /// Lấy danh sách phản ánh cho Cán bộ & Admin (Admin, Dispatcher, Officer)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Dispatcher,Officer")]
    [ProducesResponseType(typeof(PagedResult<FeedbackDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeedbacks([FromQuery] FeedbackFilterRequest filter)
    {
        var roleStr = User.FindFirstValue(ClaimTypes.Role);
        var deptIdStr = User.FindFirstValue("DepartmentId");

        UserRole? role = null;
        if (Enum.TryParse<UserRole>(roleStr, out var parsedRole))
            role = parsedRole;

        Guid? deptId = null;
        if (Guid.TryParse(deptIdStr, out var parsedDeptId))
            deptId = parsedDeptId;

        var result = await _feedbackService.GetFeedbacksPagedAsync(filter, role, deptId);
        return Ok(result);
    }

    /// <summary>
    /// Thẩm tra tiếp nhận: Chỉ dành cho Cán bộ Tiếp nhận Một Cửa (Dispatcher) và Quản trị viên (Admin)
    /// </summary>
    [HttpPost("{id:guid}/verify")]
    [Authorize(Roles = "Admin,Dispatcher")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Verify(Guid id, [FromBody] VerifyFeedbackRequest request)
    {
        var (name, role) = GetActorInfo();
        try
        {
            var result = await _feedbackService.VerifyFeedbackAsync(id, request, name, role);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Phân công xử lý: Giao đơn vị, chỉ định cán bộ, thiết lập SLA (Dispatcher & Admin)
    /// </summary>
    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Admin,Dispatcher")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignFeedbackRequest request)
    {
        var (name, role) = GetActorInfo();
        try
        {
            var result = await _feedbackService.AssignFeedbackAsync(id, request, name, role);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cán bộ cập nhật tiến độ hiện trường (Officer & Admin)
    /// </summary>
    [HttpPost("{id:guid}/progress")]
    [Authorize(Roles = "Admin,Officer")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromForm] UpdateProgressRequest request)
    {
        var (name, role) = GetActorInfo();
        try
        {
            var result = await _feedbackService.UpdateProgressAsync(id, request, name, role);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cán bộ báo cáo hoàn thành hiện trường và nộp ảnh nghiệm thu (Officer & Admin)
    /// </summary>
    [HttpPost("{id:guid}/resolve")]
    [Authorize(Roles = "Admin,Officer")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Resolve(Guid id, [FromForm] ResolveFeedbackRequest request)
    {
        var (name, role) = GetActorInfo();
        try
        {
            var result = await _feedbackService.ResolveFeedbackAsync(id, request, name, role);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lãnh đạo / Admin phê duyệt kết quả xử lý để công khai hoặc yêu cầu xử lý lại (Chỉ Admin)
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveFeedbackRequest request)
    {
        var (name, role) = GetActorInfo();
        try
        {
            var result = await _feedbackService.ApproveFeedbackAsync(id, request, name, role);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private (string Name, string Role) GetActorInfo()
    {
        var name = User.FindFirstValue("FullName") ?? User.Identity?.Name ?? "Cán bộ";
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Officer";
        return (name, role);
    }
}