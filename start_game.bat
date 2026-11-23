@echo off
title NumHunt 2.0 Dev Server
echo ==============================================
echo   STARTING NUMHUNT 2.0 SERVER (http://localhost:5173/)
echo ==============================================
cd /d "%~dp0"
call npm.cmd run dev -- --host 0.0.0.0 --port 5173
pause
