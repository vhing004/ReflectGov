@echo off
setlocal
cd /d "%~dp0"

echo =====================================================================
echo    REFLECTGOV LAUNCHER - REACTJS + .NET 9 + POSTGRESQL
echo =====================================================================
echo.
echo [1/2] Khoi chay Backend API (.NET 9) tai http://localhost:5000...
start "ReflectGov Backend" cmd /k "cd /d "%~dp0backend\ReflectGov.Api" && dotnet run --launch-profile http"

echo [2/2] Khoi chay Frontend (Vite React) tai http://localhost:5173...
start "ReflectGov Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =====================================================================
echo  HE THONG DA DUOC KHOI CHAY THANH CONG!
echo.
echo  - Cong Nguoi Dan:        http://localhost:5173
echo  - Cong Can Bo Noi Bo:    http://localhost:5173/admin/login
echo  - Ma PIN Cong Vu:        GOV-2026
echo  - Swagger API Backend:   http://localhost:5000/swagger
echo =====================================================================
echo.
timeout /t 5
