$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$venvDir = Join-Path $backendDir ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

function Get-PythonCommand {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    return "py -3"
  }
  if (Get-Command python -ErrorAction SilentlyContinue) {
    return "python"
  }
  throw "Python 3.11+ не найден. Установите Python и добавьте его в PATH."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 20+ не найден. Установите Node.js LTS и добавьте его в PATH."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm не найден. Переустановите Node.js LTS."
}

$pythonCmd = Get-PythonCommand

if (-not (Test-Path -LiteralPath $venvPython)) {
  Write-Host "Создаю виртуальное окружение backend\.venv..." -ForegroundColor Cyan
  Invoke-Expression "$pythonCmd -m venv `"$venvDir`""
}

Write-Host "Устанавливаю backend-зависимости..." -ForegroundColor Cyan
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r (Join-Path $backendDir "requirements.txt")

Write-Host "Устанавливаю frontend-зависимости..." -ForegroundColor Cyan
Set-Location $frontendDir
if (Test-Path -LiteralPath (Join-Path $frontendDir "package-lock.json")) {
  npm ci
} else {
  npm install
}

Write-Host "Запускаю API в отдельном окне..." -ForegroundColor Cyan
$backendCommand = "& `"$venvPython`" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -WorkingDirectory $backendDir -ArgumentList @("-NoExit", "-Command", $backendCommand)

Start-Sleep -Seconds 2
Write-Host "Запускаю frontend dev-сервер..." -ForegroundColor Cyan
npm run dev
