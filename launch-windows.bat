@echo off
title Dungeon Escape - 2D Platformer
echo ========================================================
echo               DUNGEON ESCAPE - ISHGA TUSHIRISH
echo ========================================================
echo.
echo 1. Desktop Ilova sifatida ochish (Electron)
echo 2. Veb Brauzerda ochish (HTML5 / Web)
echo 3. Chiqish
echo.
set /p choice="Tanlovingizni kiriting (1/2/3): "

if "%choice%"=="1" (
    echo Desktop ilovasi ochilmoqda...
    npx electron .
) else if "%choice%"=="2" (
    echo Brauzerda ishga tushirilmoqda...
    start "" "index.html"
) else (
    exit
)
