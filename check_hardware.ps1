# Get hardware & memory stats
$os = Get-CimInstance Win32_OperatingSystem
$totalRAM_GB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRAM_GB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedRAM_GB = [math]::Round($totalRAM_GB - $freeRAM_GB, 2)
$pctUsed = [math]::Round(($usedRAM_GB / $totalRAM_GB) * 100, 1)

Write-Host "TOTAL_RAM_GB: $totalRAM_GB"
Write-Host "FREE_RAM_GB: $freeRAM_GB"
Write-Host "USED_RAM_GB: $usedRAM_GB"
Write-Host "PERCENT_USED: $pctUsed%"

Write-Host "`n--- GPU INFO ---"
$gpus = Get-CimInstance Win32_VideoController
foreach ($gpu in $gpus) {
    $vramMB = [math]::Round($gpu.AdapterRAM / 1MB, 2)
    Write-Host "GPU Name: $($gpu.Name)"
    Write-Host "VRAM (MB): $vramMB"
    Write-Host "Driver: $($gpu.DriverVersion)"
}

Write-Host "`n--- NVIDIA SMI ---"
try {
    $nvsmi = nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free --format=csv,noheader
    Write-Host "NVIDIA SMI: $nvsmi"
} catch {
    Write-Host "NVIDIA SMI: Not available / no dedicated NVIDIA card"
}

Write-Host "`n--- PROSES TERKAIT PROYEK ---"
$procs = Get-Process | Where-Object { $_.ProcessName -match 'postgres|backend|node|ollama' }
foreach ($p in $procs) {
    $wsMB = [math]::Round($p.WorkingSet / 1MB, 2)
    Write-Host "$($p.ProcessName) (PID: $($p.Id)) -> RAM: $wsMB MB"
}
