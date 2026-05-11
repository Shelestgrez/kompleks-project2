# Запустите один раз: правый клик → "Выполнить с помощью PowerShell"
# Создаёт ярлык на рабочем столе на файл Комплекс-проект-Запуск.bat

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$bat = Join-Path $here 'Комплекс-проект-Запуск.bat'
if (-not (Test-Path -LiteralPath $bat)) {
  Write-Host "Не найден: $bat" -ForegroundColor Red
  exit 1
}

$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop 'Комплекс-проект.lnk'

$w = New-Object -ComObject WScript.Shell
$s = $w.CreateShortcut($lnkPath)
$s.TargetPath = $bat
$s.WorkingDirectory = $here
$s.WindowStyle = 1
$s.Description = 'Сборка и запуск Комплекс-проект (API + сайт)'
$s.Save()

Write-Host "Ярлык создан: $lnkPath" -ForegroundColor Green
