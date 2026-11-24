@echo off
title GitHub ga Push Qilish - Dungeon Escape
echo ========================================================
echo         DUNGEON ESCAPE - GITHUB GA PUSH QILISH
echo ========================================================
echo.
echo Repozitoriy: https://github.com/ganiyevahadjon/Yangi-o-yin.git
echo Branch: main
echo.
echo GitHubga yuklanmoqda...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   TABRIKLAYMIZ! BARCHA FAYLLAR MUVAFFAQIYATLI PUSH BO'LDI!
    echo ========================================================
) else (
    echo ========================================================
    echo   Agar brauzerda GitHub kirish oynasi chiqqan bo'lsa,
    echo   iltimos "Authorize" tugmasini bosing va qayta urinib ko'ring.
    echo ========================================================
)
echo.
pause
