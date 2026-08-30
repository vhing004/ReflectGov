using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReflectGov.Application.DTOs;
using ReflectGov.Application.Services;

namespace ReflectGov.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IStatsService _statsService;

    public StatsController(IStatsService statsService)
    {
        _statsService = statsService;
    }

    /// <summary>
    /// Lấy toàn bộ dữ liệu phục vụ Stitch Admin Dashboard (KPIs, Phân bổ lĩnh vực, Xu hướng hàng tuần, Cảnh báo SLA và Báo cáo mới)
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(AdminDashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _statsService.GetDashboardAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy thống kê tổng quan (Tổng hồ sơ, Đã xử lý, Đang xử lý, Quá hạn, Đánh giá trung bình, Tỉ lệ SLA)
    /// </summary>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(OverviewStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverview()
    {
        var result = await _statsService.GetOverviewAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách cảnh báo SLA: Quá hạn (OVERDUE) và Sắp hết hạn (AT RISK)
    /// </summary>
    [HttpGet("sla-alerts")]
    [ProducesResponseType(typeof(List<SlaAlertItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSlaAlerts()
    {
        var result = await _statsService.GetSlaAlertsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy dữ liệu khối lượng tiếp nhận vs hoàn thành theo tuần (Weekly Resolution Volume)
    /// </summary>
    [HttpGet("weekly-trends")]
    [ProducesResponseType(typeof(List<WeeklyTrendDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWeeklyTrends()
    {
        var result = await _statsService.GetWeeklyTrendsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách phản ánh mới gửi gần nhất
    /// </summary>
    [HttpGet("latest-reports")]
    [ProducesResponseType(typeof(List<LatestReportItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLatestReports([FromQuery] int limit = 10)
    {
        var result = await _statsService.GetLatestReportsAsync(limit);
        return Ok(result);
    }
}