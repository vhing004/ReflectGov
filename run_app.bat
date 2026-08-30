@echo off
chcp 65001 > nul
title ReflectGov Launcher - ReactJS + .NET 9 + PostgreSQL

echo =====================================================================
echo    🏛️ HỆ THỐNG PHẢN ÁNH ĐÔ THỊ REFLECTGOV (GOV-TECH IOC PLATFORM)
echo =====================================================================
echo.
echo [1/3] Đang kiểm tra kết nối PostgreSQL...
echo [2/3] Đang khởi chạy Backend API (.NET 9) tại http://localhost:5000...
start "ReflectGov Backend API" cmd /k "cd /d %~dp0backend\ReflectGov.Api && dotnet run --launch-profile http"

echo [3/3] Đang khởi chạy Frontend (ReactJS Vite) tại http://localhost:5173...
start "ReflectGov Frontend Web" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo  ✅ HỆ THỐNG ĐÃ ĐƯỢC KHỞI CHẠY THÀNH CÔNG!
echo.
echo  👉 Cổng Người Dân:        http://localhost:5173
echo  👉 Cổng Cán Bộ Nội Bộ:    http://localhost:5173/admin/login (PIN: GOV-2026)
echo  👉 Swagger API Docs:      http://localhost:5000/swagger
echo =====================================================================
echo.
pause
