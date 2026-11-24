#!/usr/bin/env bash
# Dungeon Escape - Linux Launcher

echo "========================================================"
echo "              DUNGEON ESCAPE - ISHGA TUSHIRISH          "
echo "========================================================"
echo ""
echo "1) Desktop Ilova sifatida ochish (Electron)"
echo "2) Brauzerda ochish (HTML5)"
echo "3) Chiqish"
echo ""
read -p "Tanlovingiz (1/2/3): " choice

case $choice in
    1)
        echo "Desktop ilovasi ochilmoqda..."
        npx electron .
        ;;
    2)
        echo "Brauzer ochilmoqda..."
        xdg-open index.html || sensible-browser index.html
        ;;
    *)
        exit 0
        ;;
esac
