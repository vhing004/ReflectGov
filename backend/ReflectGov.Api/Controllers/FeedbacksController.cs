using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReflectGov.Application.DTOs;
using ReflectGov.Application.Services;

namespace ReflectGov.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbacksController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbacksController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    /// <summary>
    /// Công dân gửi phản ánh kiến nghị mới (kèm tệp đính kèm hình ảnh/video hiện trường)
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitFeedback([FromForm] CreateFeedbackRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        Guid? citizenUserId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(idClaim, out var parsedId))
            {
                citizenUserId = parsedId;
            }
        }

        try
        {
            var result = await _feedbackService.SubmitFeedbackAsync(request, citizenUserId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lưu phản ánh: " + ex.Message });
        }
    }

    /// <summary>
    /// Tra cứu tiến độ phản ánh theo mã theo dõi (Hỗ trợ định dạng #RPT-xxxx hoặc PA-yyyy-xxxx)
    /// </summary>
    [HttpGet("track/{trackingCode}")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TrackFeedback(string trackingCode)
    {
        if (string.IsNullOrWhiteSpace(trackingCode))
            return BadRequest(new { message = "Vui lòng cung cấp mã phản ánh." });

        var feedback = await _feedbackService.TrackByCodeAsync(trackingCode);
        if (feedback == null)
            return NotFound(new { message = $"Không tìm thấy hồ sơ phản ánh với mã '{trackingCode}'." });

        return Ok(feedback);
    }

    /// <summary>
    /// Lấy danh sách phản ánh công khai hiển thị trên Cổng công dân & Bản đồ số
    /// </summary>
    [HttpGet("public")]
    [ProducesResponseType(typeof(List<FeedbackPublicDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicFeedbacks([FromQuery] Guid? categoryId, [FromQuery] string? search)
    {
        var result = await _feedbackService.GetPublicFeedbacksAsync(categoryId, search);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết phản ánh theo ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var feedback = await _feedbackService.GetFeedbackByIdAsync(id);
        if (feedback == null)
            return NotFound(new { message = "Không tìm thấy phản ánh." });

        return Ok(feedback);
    }

    /// <summary>
    /// Công dân đánh giá chất lượng xử lý (1-5 sao và nhận xét)
    /// </summary>
    [HttpPost("{id:guid}/rate")]
    [ProducesResponseType(typeof(FeedbackRatingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RateFeedback(Guid id, [FromBody] RateFeedbackRequest request)
    {
        if (request.Score < 1 || request.Score > 5)
            return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5 sao." });

        try
        {
            var result = await _feedbackService.RateFeedbackAsync(id, request);
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
}