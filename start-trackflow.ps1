$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"
$venvPython = Join-Path $serverDir "venv\Scripts\python.exe"
$pythonExe = if (Test-Path $venvPython) { $venvPython } else { "python" }

$backendOut = Join-Path $serverDir "uvicorn.out.log"
$backendErr = Join-Path $serverDir "uvicorn.err.log"

Write-Host "Starting TrackFlow backend on http://127.0.0.1:8000 ..."
$backend = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000") `
  -WorkingDirectory $serverDir `
  -RedirectStandardOutput $backendOut `
  -RedirectStandardError $backendErr `
  -PassThru

try {
  Start-Sleep -Seconds 2

  if ($backend.HasExited) {
    Write-Host "Backend failed to start. Check server\uvicorn.err.log for details."
    exit $backend.ExitCode
  }

  Write-Host "Starting TrackFlow frontend on http://127.0.0.1:5173 ..."
  Write-Host "Open http://127.0.0.1:5173 in your browser."
  Write-Host "Press Ctrl+C here to stop TrackFlow."

  Push-Location $clientDir
  npm run dev -- --host 127.0.0.1 --port 5173
}
finally {
  Pop-Location -ErrorAction SilentlyContinue

  if ($backend -and -not $backend.HasExited) {
    Write-Host "Stopping TrackFlow backend ..."
    Stop-Process -Id $backend.Id -Force
  }
}
