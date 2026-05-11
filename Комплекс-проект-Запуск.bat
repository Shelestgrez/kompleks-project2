@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
cd /d "%ROOT%"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "VENV=%BACKEND%\.venv"
set "VPY=%VENV%\Scripts\python.exe"
set "PYTHON_CMD="

echo.
echo === Комплекс-проект: установка зависимостей, сборка, запуск ===
echo.

where python >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=python"
if not defined PYTHON_CMD (
  where py >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=py -3"
)
if not defined PYTHON_CMD (
  echo Не найден Python. Установите Python 3.11+ с python.org и отметьте "Add to PATH".
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Не найден Node.js. Установите Node.js 20+ LTS с nodejs.org.
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
  echo [0/4] Backend: создаю virtualenv...
  call %PYTHON_CMD% -m venv "%VENV%"
  if errorlevel 1 goto :fail
)

echo [1/4] Backend: pip install...
call "%VPY%" -m pip install --upgrade pip
if errorlevel 1 goto :fail
call "%VPY%" -m pip install -r "%BACKEND%\requirements.txt"
if errorlevel 1 goto :fail

echo.
echo [2/4] Frontend: npm install...
pushd "%FRONTEND%"
if exist package-lock.json (
  call npm ci
) else (
  call npm install
)
if errorlevel 1 popd & goto :fail

echo.
echo [3/4] Frontend: сборка...
call npm run build
if errorlevel 1 popd & goto :fail
popd

echo.
echo [4/4] Запуск API ^(порт 8000^) и интерфейса ^(порт 5173^)...
start "Комплекс-проект — API :8000" cmd /k "cd /d ""%BACKEND%"" && ""%VPY%"" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak >nul
start "Комплекс-проект — сайт :5173" cmd /k "cd /d ""%FRONTEND%"" && npm run preview"

echo.
echo Готово. Откройте в браузере: http://127.0.0.1:5173
echo Закройте окна "API" и "сайт", чтобы остановить серверы.
echo.
start "" "http://127.0.0.1:5173"
exit /b 0

:fail
echo.
echo Ошибка на одном из шагов. Проверьте сообщения выше.
pause
exit /b 1
