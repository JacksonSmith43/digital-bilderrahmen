# Digital Bilderrahmen - VS Code PowerShell Startup Script
param([string]$Command = "start")

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Error($msg) { Write-Host $msg -ForegroundColor Red }
function Write-Warning($msg) { Write-Host $msg -ForegroundColor Yellow }

function Start-Services {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Magenta
    Write-Host "  Digital Bilderrahmen - VS Code Development" -ForegroundColor Magenta  
    Write-Host "====================================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Step 1: Docker
    Write-Info "[1/3] Starting Docker Services..."
    try {
        docker version | Out-Null
        Write-Success "[OK] Docker Desktop is running"
    } catch {
        Write-Error "[ERROR] Docker Desktop is not running!"
        Write-Warning "Please start Docker Desktop and try again."
        return
    }
    
    Write-Info "Starting PostgreSQL and pgAdmin... with docker-compose up -d"
    docker-compose up -d
    Write-Success "[OK] Docker services started"
    Write-Info "  - pgAdmin: http://localhost:8081"
    Write-Info "  - PostgreSQL: localhost:5432"
    Write-Host ""
    
    Start-Sleep -Seconds 5
    
    # Step 2: Spring Boot
    Write-Info "[2/3] Starting Spring Boot Backend..."
    
    if (-not $env:JAVA_HOME) {
        $env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
        if (-not $env:JAVA_HOME) {
            Write-Error "[ERROR] JAVA_HOME not found!"
            return
        }
    }
    Write-Success "[OK] JAVA_HOME: $env:JAVA_HOME"
    
    if (-not (Test-Path "backend\mvnw.cmd")) {
        Write-Error "[ERROR] Maven wrapper not found"
        return
    }
    Write-Success "[OK] Maven wrapper found"
    
    Write-Info "Starting Spring Boot in background... with .\mvnw.cmd spring-boot:run"
    $BackendJob = Start-Job -ScriptBlock {
        Set-Location "backend"
        & ".\mvnw.cmd" spring-boot:run 2>&1 | Out-File "..\spring-boot.log" -Append # 2>&1 = Fehler und normale Ausgabe werden zusammen ausgegeben. stdin ist 0, stdout ist 1 und stderr ist 2. 
    }
    
    Write-Success "[OK] Spring Boot starting (Job ID: $($BackendJob.Id))"
    Write-Info "  - Backend API: http://localhost:8080"
    Write-Info "  - Logs: spring-boot.log"
    Write-Host ""
    
    # Step 3: Angular
    Write-Info "[3/3] Starting Angular Frontend..."
    
    try {
        $nodeVersion = node --version
        Write-Success "[OK] Node.js: $nodeVersion"
    } catch {
        Write-Error "[ERROR] Node.js not installed!"
        return
    }
    
    if (-not (Test-Path "frontend\package.json")) {
        Write-Error "[ERROR] package.json not found"
        return
    }
    
    if (-not (Test-Path "frontend\node_modules")) {
        Write-Info "Installing npm dependencies..."
        Set-Location "frontend"
        npm install
        Set-Location ".."
        Write-Success "[OK] Dependencies installed"
    } else {
        Write-Success "[OK] Dependencies ready"
    }
    
    Write-Info "Starting Angular in background... with npm start"
    
    # Clear old log file
    if (Test-Path "angular.log") {
        Remove-Item "angular.log" -Force
    }
    
    # Use Start-Process instead of Start-Job for better file output
    $angularProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile", "-Command", "cd frontend; npm start 2>&1 | Tee-Object -FilePath ..\angular.log" `
        -WorkingDirectory $PWD `
        -WindowStyle Hidden `
        -PassThru
    
    Write-Success "[OK] Angular starting (Process ID: $($angularProcess.Id))"
    Write-Info "  - Frontend: http://localhost:4200"
    Write-Info "  - Logs: angular.log"
    Write-Host ""
    
    # Wait for Angular to compile and check for errors
    Write-Info "Checking Angular compilation..."
    
    $maxWait = 30
    $waited = 0
    $compiled = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        
        if (Test-Path "angular.log") {
            $angularLog = Get-Content "angular.log" -Raw -ErrorAction SilentlyContinue
            
            # Check for compilation failure
            if ($angularLog -match "Application bundle generation failed") {
                Write-Error "[ERROR] Angular compilation FAILED!"
                Write-Host ""
                Write-Host "Recent errors:" -ForegroundColor Yellow
                Get-Content "angular.log" | Select-String "\[ERROR\]" | Select-Object -First 10 | ForEach-Object { 
                    Write-Warning "  $_" 
                }
                Write-Host ""
                Write-Warning "Full log: angular.log | Fix TypeScript errors!"
                $compiled = $true
                break
            }
            
            # Check for successful compilation
            if ($angularLog -match "Application bundle generation complete") {
                Write-Success "[OK] Angular compiled successfully"
                $compiled = $true
                break
            }
            
            # Check for TypeScript errors
            if ($angularLog -match "\[ERROR\]") {
                Write-Error "[ERROR] TypeScript errors detected!"
                Write-Host ""
                Get-Content "angular.log" | Select-String "\[ERROR\]" | Select-Object -First 5 | ForEach-Object { 
                    Write-Warning "  $_" 
                }
                Write-Host ""
                Write-Warning "Check angular.log for details"
            }
        }
        
        Write-Host "." -NoNewline
    }
    
    if (-not $compiled) {
        Write-Warning "`n[WARN] Angular still compiling... check angular.log"
    }
    Write-Host ""
    
    # Summary
    Write-Host ">>> Development Environment Started! <<<" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs:"
    Write-Host "   Frontend:  http://localhost:4200"
    Write-Host "   Backend:   http://localhost:8080"
    Write-Host "   API Docs:  http://localhost:8080/swagger-ui.html"
    Write-Host "   pgAdmin:   http://localhost:8081"
    Write-Host ""
    Write-Host "Logs: spring-boot.log, angular.log"
    Write-Host "Stop: .\quick-start.ps1 stop"
    Write-Host ""
    
    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 15
    
    Write-Info "Health Check:"
    try {
        Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method Head -TimeoutSec 3 | Out-Null
        Write-Success "   Backend: Running"
    } catch {
        Write-Warning "   Backend: Starting..."
    }
    
    try {
        Invoke-WebRequest -Uri "http://localhost:4200" -Method Head -TimeoutSec 3 | Out-Null
        Write-Success "   Frontend: Running"
    } catch {
        Write-Warning "   Frontend: Starting..."
    }
    
    Write-Host ""
    Write-Success "Ready to develop! Check the URLs above."
}

function Stop-Services {
    Write-Host ""
    Write-Host "Stopping Services..." -ForegroundColor Red
    
    # Stop jobs (for Spring Boot)
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -ErrorAction SilentlyContinue
    Write-Success "[OK] Background jobs stopped"
    
    # Stop Docker
    docker-compose down
    Write-Success "[OK] Docker services stopped"
    
    # Kill processes
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "ng" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Success "[OK] Java, Node, and Angular processes stopped"
    
    Write-Host ""
    Write-Success "All services stopped"
}

function Show-Status {
    Write-Host ""
    Write-Host "Service Status" -ForegroundColor Cyan
    Write-Host ""
    
    # Docker
    try {
        docker version | Out-Null
        Write-Success "Docker: Running"
        docker-compose ps
    } catch {
        Write-Error "Docker: Not Running"
    }
    
    Write-Host ""
    Write-Host "URLs:"
    Write-Host "  Frontend:  http://localhost:4200"
    Write-Host "  Backend:   http://localhost:8080"
    Write-Host "  pgAdmin:   http://localhost:8081"
    Write-Host ""
    
    # Jobs
    $jobs = Get-Job -ErrorAction SilentlyContinue
    if ($jobs) {
        Write-Host "Background Jobs:"
        $jobs | Format-Table Name, State, Id -AutoSize
    }
}

function Show-Logs {
    Write-Host ""
    Write-Host "Application Logs" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "spring-boot.log") {
        Write-Host "=== Spring Boot (last 20 lines) ===" -ForegroundColor Yellow
        Get-Content "spring-boot.log" -Tail 20
        Write-Host ""
    }
    
    if (Test-Path "angular.log") {
        Write-Host "=== Angular (last 20 lines) ===" -ForegroundColor Yellow
        Get-Content "angular.log" -Tail 20
        Write-Host ""
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "Digital Bilderrahmen - VS Code Startup" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\quick-start.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     Start all services (default)"
    Write-Host "  stop      Stop all services"
    Write-Host "  status    Show service status"
    Write-Host "  logs      Show recent logs"
    Write-Host "  help      Show this help"
    Write-Host ""
}

# Main execution
switch ($Command.ToLower()) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "help" { Show-Help }
    default { Show-Help }
}