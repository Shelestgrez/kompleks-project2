@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
cd /d "%ROOT%"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "VENV=%BACKEND%\.venv"
set "VPY=%VENV%\Scripts\python.exe"
set "PYTHON_CMD="

where python >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=python"
if not defined PYTHON_CMD (
  where py >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=py -3"
)
if not defined PYTHON_CMD (
  echo Не найден Python 3.11+.
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo Не найден Node.js 20+.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo Не найден npm. Переустановите Node.js LTS.
  pause
  exit /b 1
)

if not exist "%VPY%" (
  echo Создаю виртуальное окружение backend\.venv...
  call %PYTHON_CMD% -m venv "%VENV%"
  if errorlevel 1 goto :fail
)

echo Backend: pip...
call "%VPY%" -m pip install --upgrade pip
if errorlevel 1 goto :fail
call "%VPY%" -m pip install -r "%BACKEND%\requirements.txt"
if errorlevel 1 goto :fail

echo Frontend: npm install...
pushd "%FRONTEND%"
if exist package-lock.json (
  call npm ci
) else (
  call npm install
)
if errorlevel 1 popd & goto :fail
popd

echo Запуск без полной сборки: Vite dev + API.
start "Комплекс-проект — API :8000" cmd /k "cd /d ""%BACKEND%"" && ""%VPY%"" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak >nul
start "Комплекс-проект — Vite :5173" cmd /k "cd /d ""%FRONTEND%"" && npm run dev"

start "" "http://127.0.0.1:5173"
exit /b 0

:fail
pause
exit /b 1
