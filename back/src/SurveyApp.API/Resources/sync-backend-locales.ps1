# Backend Locale Sync Script
# Syncs az.json and ru.json with en.json structure for .NET backend localization
# - Removes keys not present in en.json
# - Adds missing keys with "TODO_TRANSLATE:" placeholder
# - Maintains flat key structure (e.g., "Errors.SurveyNotFound")

param(
    [string]$LocalesPath = "C:\Users\CyberDream\Desktop\projects\Work\survey_new\back\src\SurveyApp.API\Resources"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Backend Locale Sync Script     " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Resolve full path
$localesDir = Resolve-Path $LocalesPath -ErrorAction SilentlyContinue
if (-not $localesDir) {
    Write-Host "Error: Locales directory not found at: $LocalesPath" -ForegroundColor Red
    Write-Host "Please specify correct path with -LocalesPath parameter" -ForegroundColor Yellow
    exit 1
}

Write-Host "Locales directory: $localesDir" -ForegroundColor Gray
Write-Host ""

$enPath = Join-Path $localesDir "en.json"
$azPath = Join-Path $localesDir "az.json"
$ruPath = Join-Path $localesDir "ru.json"

# Verify en.json exists
if (-not (Test-Path $enPath)) {
    Write-Host "Error: en.json not found at: $enPath" -ForegroundColor Red
    exit 1
}

# Create target files if they don't exist
if (-not (Test-Path $azPath)) {
    Write-Host "Creating az.json..." -ForegroundColor Yellow
    '{}' | Out-File $azPath -Encoding UTF8
}

if (-not (Test-Path $ruPath)) {
    Write-Host "Creating ru.json..." -ForegroundColor Yellow
    '{}' | Out-File $ruPath -Encoding UTF8
}

Write-Host "Reading locale files..." -ForegroundColor Gray

# Read JSON files as hashtables (flat structure)
try {
    $enJson = Get-Content $enPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
    $azJson = Get-Content $azPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
    $ruJson = Get-Content $ruPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
    Write-Host "Error reading JSON files: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Files loaded successfully." -ForegroundColor Green
Write-Host ""

function Sync-LocaleFile {
    param (
        [hashtable]$sourceJson,
        [hashtable]$targetJson,
        [string]$targetName,
        [string]$languageCode
    )
    
    Write-Host "=== Processing $targetName ===" -ForegroundColor Cyan
    
    $sourceKeys = $sourceJson.Keys | Sort-Object
    $targetKeys = $targetJson.Keys | Sort-Object
    
    # Find keys to remove (in target but not in source)
    $keysToRemove = $targetKeys | Where-Object { $_ -notin $sourceKeys }
    
    # Find keys to add (in source but not in target)
    $keysToAdd = $sourceKeys | Where-Object { $_ -notin $targetKeys }
    
    Write-Host "Source keys (en.json): $($sourceKeys.Count)" -ForegroundColor Gray
    Write-Host "Target keys ($targetName): $($targetKeys.Count)" -ForegroundColor Gray
    Write-Host "Keys to remove: $($keysToRemove.Count)" -ForegroundColor $(if ($keysToRemove.Count -gt 0) { "Yellow" } else { "Gray" })
    Write-Host "Keys to add: $($keysToAdd.Count)" -ForegroundColor $(if ($keysToAdd.Count -gt 0) { "Green" } else { "Gray" })
    Write-Host ""
    
    # Remove extra keys
    if ($keysToRemove.Count -gt 0) {
        Write-Host "Removing obsolete keys:" -ForegroundColor Red
        foreach ($key in $keysToRemove) {
            Write-Host "  - $key" -ForegroundColor Red
            $targetJson.Remove($key)
        }
        Write-Host ""
    }
    
    # Add missing keys with TODO_TRANSLATE placeholder
    if ($keysToAdd.Count -gt 0) {
        Write-Host "Adding missing keys:" -ForegroundColor Green
        foreach ($key in $keysToAdd) {
            $sourceValue = $sourceJson[$key]
            $placeholder = "TODO_TRANSLATE: $sourceValue"
            Write-Host "  + $key" -ForegroundColor Green
            $targetJson[$key] = $placeholder
        }
        Write-Host ""
    }
    
    if ($keysToRemove.Count -eq 0 -and $keysToAdd.Count -eq 0) {
        Write-Host "✓ $targetName is already in sync with en.json" -ForegroundColor Green
        Write-Host ""
    }
    
    return $targetJson
}

function ConvertTo-SortedJson {
    param (
        [hashtable]$obj,
        [int]$indent = 0
    )
    
    $indentStr = "  " * $indent
    $innerIndent = "  " * ($indent + 1)
    $result = "{"
    $first = $true
    
    # Sort keys alphabetically for consistent output
    $sortedKeys = $obj.Keys | Sort-Object
    
    foreach ($key in $sortedKeys) {
        if (-not $first) {
            $result += ","
        }
        $first = $false
        $result += "`n$innerIndent`"$key`": "
        
        $value = $obj[$key]
        
        # Escape special characters in strings
        $escaped = $value -replace '\\', '\\' -replace '"', '\"' -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'
        $result += "`"$escaped`""
    }
    
    $result += "`n$indentStr}"
    return $result
}

function Count-TodoTranslations {
    param (
        [hashtable]$json
    )
    
    $count = 0
    foreach ($value in $json.Values) {
        if ($value -match "^TODO_TRANSLATE:") {
            $count++
        }
    }
    return $count
}

# Backup original files before syncing
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $localesDir "backups"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Creating backups..." -ForegroundColor Gray
Copy-Item $azPath -Destination (Join-Path $backupDir "az_$timestamp.json") -Force
Copy-Item $ruPath -Destination (Join-Path $backupDir "ru_$timestamp.json") -Force
Write-Host "Backups created in: $backupDir" -ForegroundColor Gray
Write-Host ""

# Sync az.json
$syncedAz = Sync-LocaleFile -sourceJson $enJson -targetJson $azJson -targetName "az.json" -languageCode "az"
$azOutput = ConvertTo-SortedJson -obj $syncedAz
[System.IO.File]::WriteAllText($azPath, $azOutput, [System.Text.Encoding]::UTF8)
$azTodoCount = Count-TodoTranslations -json $syncedAz
Write-Host "✓ Saved: $azPath" -ForegroundColor Cyan
Write-Host "  TODO translations: $azTodoCount" -ForegroundColor $(if ($azTodoCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# Sync ru.json
$syncedRu = Sync-LocaleFile -sourceJson $enJson -targetJson $ruJson -targetName "ru.json" -languageCode "ru"
$ruOutput = ConvertTo-SortedJson -obj $syncedRu
[System.IO.File]::WriteAllText($ruPath, $ruOutput, [System.Text.Encoding]::UTF8)
$ruTodoCount = Count-TodoTranslations -json $syncedRu
Write-Host "✓ Saved: $ruPath" -ForegroundColor Cyan
Write-Host "  TODO translations: $ruTodoCount" -ForegroundColor $(if ($ruTodoCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Sync Complete!                 " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$totalTodo = $azTodoCount + $ruTodoCount
if ($totalTodo -gt 0) {
    Write-Host "⚠ Action Required:" -ForegroundColor Yellow
    Write-Host "  Search for 'TODO_TRANSLATE:' in az.json and ru.json" -ForegroundColor Yellow
    Write-Host "  Replace with actual translations" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Total pending translations: $totalTodo" -ForegroundColor Yellow
    Write-Host "    - az.json: $azTodoCount" -ForegroundColor Yellow
    Write-Host "    - ru.json: $ruTodoCount" -ForegroundColor Yellow
} else {
    Write-Host "✓ All translations are complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backups available at: $backupDir" -ForegroundColor Gray