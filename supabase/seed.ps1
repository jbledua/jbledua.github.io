Param(
  [Parameter(Mandatory=$false)]
  [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
  Write-Error "DATABASE_URL is not set. Provide with -DatabaseUrl or set env: DATABASE_URL."
  exit 1
}

# Resolve script directory and run psql from there so relative includes work
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ScriptDir
try {
  $master = Join-Path $ScriptDir 'seed_master.sql'
  if (-not (Test-Path $master)) { Write-Error "seed_master.sql not found at $master"; exit 1 }

  # Run psql; rely on psql in PATH
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'psql'
  $psi.ArgumentList = @($DatabaseUrl, '-f', $master)
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false

  $p = [System.Diagnostics.Process]::Start($psi)
  $p.WaitForExit()
  Write-Output $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  if ($stderr) { Write-Error $stderr }
  exit $p.ExitCode
}
finally {
  Pop-Location
}
