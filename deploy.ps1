# deploy.ps1
# Skript na automatické nasadenie zmien do oboch repozitárov (Zdrojový kód + EXE)

param (
    [string]$Message = "Aktualizacia aplikacie"
)

$ErrorActionPreference = "Stop"

Write-Host ">>> 1. NAHRÁVAM ZDROJOVÝ KÓD (Python) DO GITHUBU..." -ForegroundColor Cyan
git add .
try {
    git commit -m "$Message"
} catch {
    Write-Host "   (Žiadne zmeny na commitnutie, pokračujem...)"
}
git push origin main
Write-Host "   [OK] Zdrojový kód nahraný." -ForegroundColor Green

Write-Host "`n>>> 2. VYTVÁRAM NOVÝ BUILD (EXE SÚBOR)..." -ForegroundColor Cyan
# Spustenie PyInstaller (predpokladáme, že je nainštalovaný a v PATH)
pyinstaller FVE_Analyza.spec --noconfirm --clean

if ($LASTEXITCODE -ne 0) {
    Write-Error "Chyba pri vytváraní buildu!"
    exit
}
Write-Host "   [OK] Build vytvorený." -ForegroundColor Green

Write-Host "`n>>> 3. BALÍM APLIKÁCIU DO ZIP..." -ForegroundColor Cyan
$zipFile = "FVE_Analyza_v8.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }
Compress-Archive -Path 'dist\FVE_Analyza' -DestinationPath $zipFile -Force
Write-Host "   [OK] ZIP archív vytvorený." -ForegroundColor Green

Write-Host "`n>>> 4. NAHRÁVAM EXE DO DRUHÉHO GITHUB REPOZITÁRA..." -ForegroundColor Cyan
$releaseRepo = "release_repo"

# Ak zložka neexistuje, vytvoríme ju (re-klonovanie by bolo čistejšie, ale pre rýchlosť stačí copy ak už existuje git)
if (-not (Test-Path $releaseRepo)) {
    mkdir $releaseRepo
    cd $releaseRepo
    git init
    git remote add origin https://github.com/Neophite2023/skript-analyza-FVE-.exe.git
    cd ..
}

# Kopírovanie nového ZIPu
Copy-Item $zipFile -Destination "$releaseRepo\" -Force

# Pushnutie zmien v release repozitári
Push-Location $releaseRepo # cd do zložky
try {
    git add .
    git commit -m "$Message (Build)"
    git push origin main
    Write-Host "   [OK] Binary (EXE) nahrané." -ForegroundColor Green
} catch {
    Write-Host "   [INFO] Žiadna zmena v ZIP súbore alebo iná chyba pri commite: $_"
}
Pop-Location # návrat späť

Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host " HOTOVO! Aplikácia je aktualizovaná na oboch miestach." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow
