namespace ReflectGov.Application.DTOs;

public class OverviewStatsDto
{
    public int TotalFeedbacks { get; set; }
    public int Submitted { get; set; }
    public int Processing { get; set; }
    public int InProgress { get; set; }
    public int ResolvedPendingApproval { get; set; }
    public int Published { get; set; }
    public int Rejected { get; set; }
    public int Overdue { get; set; }
    public double AverageRating { get; set; }
    public double SlaComplianceRate { get; set; }  // % giải quyết đúng hạn
}

public class CategoryStatsDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int Total { get; set; }
    public int Resolved { get; set; }
    public double SlaRate { get; set; }
    public double Percentage { get; set; } // % trong tổng số phản ánh (phục vụ Pie chart)
}

public class DepartmentStatsDto
{
    public string DepartmentName { get; set; } = string.Empty;
    public int Assigned { get; set; }
    public int InProgress { get; set; }
    public int Resolved { get; set; }
    public int Overdue { get; set; }
    public double SlaRate { get; set; }
    public double AverageRating { get; set; }
}

public class WeeklyTrendDto
{
    public string WeekLabel { get; set; } = string.Empty; // "W1", "W2", "W3", "W4"
    public int ReceivedCount { get; set; }
    public int ResolvedCount { get; set; }
}

public class SlaAlertItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty; // "OVERDUE" hoặc "AT RISK"
    public string DueMessage { get; set; } = string.Empty; // "Due: 24h ago", "Due: in 2h"
    public double HoursRemaining { get; set; }
    public DateTime? SlaDeadline { get; set; }
}

public class LatestReportItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SubmittedRelativeTime { get; set; } = string.Empty; // "10 min ago", "2 hrs ago"
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DashboardKpiSummaryDto
{
    public int TotalReports { get; set; }
    public string TotalReportsGrowth { get; set; } = "+14.5%";
    public double SlaComplianceRate { get; set; }
    public string SlaTargetComparison { get; set; } = "+2.1% vs target (92%)";
    public double AvgResolutionTimeDays { get; set; }
    public string AvgResolutionTimeGrowth { get; set; } = "-0.5d vs last month";
    public int ActiveAlertsCount { get; set; }
}

public class AdminDashboardDto
{
    public DashboardKpiSummaryDto KpiSummary { get; set; } = new();
    public OverviewStatsDto Overview { get; set; } = new();
    public List<CategoryStatsDto> ByCategory { get; set; } = new();
    public List<DepartmentStatsDto> ByDepartment { get; set; } = new();
    public List<WeeklyTrendDto> WeeklyTrends { get; set; } = new();
    public List<SlaAlertItemDto> SlaAlerts { get; set; } = new();
    public List<LatestReportItemDto> LatestIncomingReports { get; set; } = new();
}
