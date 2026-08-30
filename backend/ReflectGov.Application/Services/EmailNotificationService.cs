using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ReflectGov.Application.Services;

public interface IEmailNotificationService
{
    Task SendFeedbackSubmittedEmailAsync(string toEmail, string citizenName, string trackingCode, string title);
    Task SendFeedbackResolvedEmailAsync(string toEmail, string citizenName, string trackingCode, string title, string resolutionSummary);
    Task SendAssignmentNoticeEmailAsync(string toEmail, string officerName, string trackingCode, string title, string departmentName);
}

public class EmailNotificationService : IEmailNotificationService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(IConfiguration config, ILogger<EmailNotificationService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public Task SendFeedbackSubmittedEmailAsync(string toEmail, string citizenName, string trackingCode, string title)
    {
        if (string.IsNullOrWhiteSpace(toEmail)) return Task.CompletedTask;
        var subject = $"[ReflectGov] Tiếp nhận thành công - Mã: {trackingCode}";
        var body = $@"<div style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px"">
<h2 style=""color:#1e40af"">CỔNG TIẾP NHẬN PHẢN ÁNH REFLECTGOV</h2>
<p>Kính gửi <strong>{citizenName}</strong>,</p>
<p>Hệ thống đã tiếp nhận phản ánh của bạn:</p>
<div style=""background:#f8fafc;padding:15px;border-radius:8px;margin:15px 0"">
  <p><strong>Tiêu đề:</strong> {title}</p>
  <p><strong>Mã tra cứu:</strong> <span style=""font-size:18px;font-weight:bold;color:#1e40af"">{trackingCode}</span></p>
  <p><strong>Thời gian:</strong> {DateTime.UtcNow.AddHours(7):dd/MM/yyyy HH:mm} (Giờ VN)</p>
</div>
<p><a href=""http://localhost:5173/track?code={trackingCode}"" style=""background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block"">Tra Cứu Tiến Độ</a></p>
</div>";
        return SendEmailAsync(toEmail, subject, body);
    }

    public Task SendFeedbackResolvedEmailAsync(string toEmail, string citizenName, string trackingCode, string title, string resolutionSummary)
    {
        if (string.IsNullOrWhiteSpace(toEmail)) return Task.CompletedTask;
        var subject = $"[ReflectGov] Kết quả xử lý phản ánh: {trackingCode}";
        var body = $@"<div style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px"">
<h2 style=""color:#059669"">THÔNG BÁO KẾT QUẢ XỬ LÝ PHẢN ÁNH</h2>
<p>Kính gửi <strong>{citizenName}</strong>,</p>
<div style=""background:#ecfdf5;border:1px solid #a7f3d0;padding:15px;border-radius:8px;margin:15px 0"">
  <p><strong>Mã:</strong> {trackingCode} | <strong>Tiêu đề:</strong> {title}</p>
  <p><strong>Kết quả:</strong> {resolutionSummary}</p>
</div>
<p><a href=""http://localhost:5173/track?code={trackingCode}"" style=""background:#059669;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block"">Xem chi tiết & Đánh giá ⭐</a></p>
</div>";
        return SendEmailAsync(toEmail, subject, body);
    }

    public Task SendAssignmentNoticeEmailAsync(string toEmail, string officerName, string trackingCode, string title, string departmentName)
    {
        if (string.IsNullOrWhiteSpace(toEmail)) return Task.CompletedTask;
        var subject = $"[ReflectGov] Giao việc xử lý: {trackingCode}";
        var body = $@"<div style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px"">
<h2 style=""color:#4f46e5"">LỆNH ĐIỀU PHỐI XỬ LÝ PHẢN ÁNH</h2>
<p>Kính gửi Đồng chí <strong>{officerName}</strong> ({departmentName}),</p>
<div style=""background:#eef2ff;padding:15px;border-radius:8px;margin:15px 0"">
  <p><strong>Mã phản ánh:</strong> {trackingCode}</p>
  <p><strong>Tiêu đề:</strong> {title}</p>
</div>
<p><a href=""http://localhost:5173/admin/feedbacks"" style=""background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block"">Mở Cổng Cán Bộ</a></p>
</div>";
        return SendEmailAsync(toEmail, subject, body);
    }

    private Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var host = _config["Smtp:Host"];
            var port = _config.GetValue<int>("Smtp:Port", 587);
            var username = _config["Smtp:Username"];
            var password = _config["Smtp:Password"];
            var from = _config["Smtp:From"] ?? "no-reply@reflectgov.gov.vn";

            if (!string.IsNullOrEmpty(host) && !string.IsNullOrEmpty(username))
            {
                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = _config.GetValue<bool>("Smtp:EnableSsl", true)
                };
                var msg = new MailMessage { From = new MailAddress(from, "ReflectGov"), Subject = subject, Body = htmlBody, IsBodyHtml = true };
                msg.To.Add(toEmail);
                client.Send(msg);
                _logger.LogInformation("[Email] Đã gửi tới {Email}", toEmail);
            }
            else
            {
                _logger.LogInformation("[Email Simulation] To: {Email} | Subject: {Subject}", toEmail, subject);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("[Email Error] {Email}: {Err}", toEmail, ex.Message);
        }
        return Task.CompletedTask;
    }
}
