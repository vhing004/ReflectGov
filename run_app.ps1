# ReflectGov One-Click Launcher for Windows PowerShell
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   🏛️ REFLECTGOV - HỆ THỐNG PHẢN ÁNH ĐÔ THỊ (GOV-TECH IOC PLATFORM)   " -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Đang khởi chạy Backend API (.NET 9 + PostgreSQL)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend\ReflectGov.Api`" && dotnet run --launch-profile http"

Start-Sleep -Seconds 2

Write-Host "[2/2] Đang khởi chạy Frontend (ReactJS 19 + Vite)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  ✅ HỆ THỐNG ĐÃ ĐƯỢC KHỞI CHẠY THÀNH CÔNG!" -ForegroundColor Green
Write-Host ""
Write-Host "  👉 Cổng Người Dân:        http://localhost:5173" -ForegroundColor White
Write-Host "  👉 Cổng Cán Bộ Nội Bộ:    http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "  👉 Mã PIN Công Vụ:        GOV-2026" -ForegroundColor Yellow
Write-Host "  👉 Swagger API Backend:   http://localhost:5000/swagger" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Đang tự động mở trình duyệt sau 3 giây..."
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
