@echo off
title Day PlayVerse len GitHub
cd /d "c:\Users\hoang\Downloads\playverse"
echo ============================================================
echo   DANG DAY MA NGUON PLAYVERSE LEN GITHUB...
echo   Repository: hbminh2508-design/playverse-powered-by-SenExam
echo ============================================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [THANH CONG] Da day toan bo ma nguon len GitHub thanh cong!
) else (
    echo [LUU Y] Neu chua dang nhap GitHub, trinh duyet se mo ra de ban xac thuc.
    echo Hoac ban co the dung Personal Access Token de push.
)
echo.
pause
