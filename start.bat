@echo off
chcp 65001 >nul
title 💗 Crush Quiz - Đang chạy...
color 0D

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗       ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  [1/2] Đang khởi động server...

:: Start the Node.js server in the background
start /B node "%~dp0server.js" > "%~dp0server.log" 2>&1

:: Wait 2 seconds for server to be ready
timeout /t 2 /nobreak >nul

echo  [1/2] Server đang chạy tại http://localhost:3000
echo.
echo  [2/2] Đang tạo đường link công khai...
echo        (Vui lòng chờ 10-15 giây...)
echo.

:: Run localtunnel and capture output
for /f "tokens=*" %%i in ('npx --yes localtunnel --port 3000 2^>^&1 ^| findstr "url is"') do (
    set "TUNNEL_LINE=%%i"
)

:: Extract just the URL
for /f "tokens=4" %%u in ("%TUNNEL_LINE%") do set "TUNNEL_URL=%%u"

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║  🔗 LINK GỬI CRUSH:                                     ║
echo  ║     %TUNNEL_URL%                                         ║
echo  ║                                                          ║
echo  ║  💡 Thêm tên vào link (tùy chọn):                      ║
echo  ║     %TUNNEL_URL%/?to=TênCrush^&from=TênBạn               ║
echo  ║                                                          ║
echo  ║  🔐 Xem kết quả bí mật tại:                             ║
echo  ║     %TUNNEL_URL%/admin  (PIN: 1314)                      ║
echo  ║                                                          ║
echo  ║  ⚠️  Giữ cửa sổ này MỞ trong khi crush làm bài!        ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: Open admin dashboard in browser for you
start "" "%TUNNEL_URL%/admin"

echo  Nhấn Ctrl+C để dừng khi crush đã làm xong.
echo.
pause >nul

