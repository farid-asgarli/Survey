# Locale Sync Script
# Syncs az.json and ru.json with en.json structure
# - Removes keys not present in en.json
# - Adds missing keys with placeholder values that cause syntax issues

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$localesDir = Join-Path $scriptDir "locales"

$enPath = Join-Path $localesDir "en.json"
$azPath = Join-Path $localesDir "az.json"
$ruPath = Join-Path $localesDir "ru.json"

# Read JSON files
$enJson = Get-Content $enPath -Raw | ConvertFrom-Json -AsHashtable
$azJson = Get-Content $azPath -Raw | ConvertFrom-Json -AsHashtable
$ruJson = Get-Content $ruPath -Raw | ConvertFrom-Json -AsHashtable

function Get-AllKeys {
    param (
        [hashtable]$obj,
        [string]$prefix = ""
    )
    
    $keys = @()
    
    foreach ($key in $obj.Keys) {
        $fullKey = if ($prefix) { "$prefix.$key" } else { $key }
        
        if ($obj[$key] -is [hashtable]) {
            $keys += Get-AllKeys -obj $obj[$key] -prefix $fullKey
        } else {
            $keys += $fullKey
        }
    }
    
    return $keys
}

function Get-Value {
    param (
        [hashtable]$obj,
        [string]$path
    )
    
    $parts = $path -split '\.'
    $current = $obj
    
    foreach ($part in $parts) {
        if ($current -is [hashtable] -and $current.ContainsKey($part)) {
            $current = $current[$part]
        } else {
            return $null
        }
    }
    
    return $current
}

function Set-Value {
    param (
        [hashtable]$obj,
        [string]$path,
        $value
    )
    
    $parts = $path -split '\.'
    $current = $obj
    
    for ($i = 0; $i -lt $parts.Count - 1; $i++) {
        $part = $parts[$i]
        if (-not $current.ContainsKey($part)) {
            $current[$part] = @{}
        }
        $current = $current[$part]
    }
    
    $current[$parts[-1]] = $value
}

function Remove-Value {
    param (
        [hashtable]$obj,
        [string]$path
    )
    
    $parts = $path -split '\.'
    $current = $obj
    
    for ($i = 0; $i -lt $parts.Count - 1; $i++) {
        $part = $parts[$i]
        if ($current -is [hashtable] -and $current.ContainsKey($part)) {
            $current = $current[$part]
        } else {
            return
        }
    }
    
    if ($current -is [hashtable]) {
        $current.Remove($parts[-1])
    }
}

function Remove-EmptyObjects {
    param (
        [hashtable]$obj
    )
    
    $keysToRemove = @()
    
    foreach ($key in $obj.Keys) {
        if ($obj[$key] -is [hashtable]) {
            Remove-EmptyObjects -obj $obj[$key]
            if ($obj[$key].Count -eq 0) {
                $keysToRemove += $key
            }
        }
    }
    
    foreach ($key in $keysToRemove) {
        $obj.Remove($key)
    }
}

function Sync-LocaleFile {
    param (
        [hashtable]$sourceJson,
        [hashtable]$targetJson,
        [string]$targetName
    )
    
    $sourceKeys = Get-AllKeys -obj $sourceJson
    $targetKeys = Get-AllKeys -obj $targetJson
    
    # Find keys to remove (in target but not in source)
    $keysToRemove = $targetKeys | Where-Object { $_ -notin $sourceKeys }
    
    # Find keys to add (in source but not in target)
    $keysToAdd = $sourceKeys | Where-Object { $_ -notin $targetKeys }
    
    Write-Host "`n=== Processing $targetName ===" -ForegroundColor Cyan
    Write-Host "Keys to remove: $($keysToRemove.Count)" -ForegroundColor Yellow
    Write-Host "Keys to add: $($keysToAdd.Count)" -ForegroundColor Green
    
    # Remove extra keys
    foreach ($key in $keysToRemove) {
        Write-Host "  Removing: $key" -ForegroundColor Red
        Remove-Value -obj $targetJson -path $key
    }
    
    # Clean up empty objects after removal
    Remove-EmptyObjects -obj $targetJson
    
    # Add missing keys with placeholder that causes syntax issues
    foreach ($key in $keysToAdd) {
        $placeholder = "TODO_TRANSLATE: " + (Get-Value -obj $sourceJson -path $key)
        Write-Host "  Adding: $key" -ForegroundColor Green
        Set-Value -obj $targetJson -path $key -value $placeholder
    }
    
    return $targetJson
}

function ConvertTo-OrderedJson {
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
        if ($value -is [hashtable]) {
            $result += ConvertTo-OrderedJson -obj $value -indent ($indent + 1)
        } elseif ($value -is [array]) {
            $result += ($value | ConvertTo-Json -Compress)
        } elseif ($value -is [bool]) {
            $result += if ($value) { "true" } else { "false" }
        } elseif ($value -is [int] -or $value -is [double]) {
            $result += $value
        } else {
            # Escape special characters in strings
            $escaped = $value -replace '\\', '\\' -replace '"', '\"' -replace "`n", '\n' -replace "`r", '\r' -replace "`t", '\t'
            $result += "`"$escaped`""
        }
    }
    
    $result += "`n$indentStr}"
    return $result
}

# Process az.json
$syncedAz = Sync-LocaleFile -sourceJson $enJson -targetJson $azJson -targetName "az.json"
$azOutput = ConvertTo-OrderedJson -obj $syncedAz
[System.IO.File]::WriteAllText($azPath, $azOutput, [System.Text.Encoding]::UTF8)
Write-Host "`nSaved: $azPath" -ForegroundColor Cyan

# Process ru.json
$syncedRu = Sync-LocaleFile -sourceJson $enJson -targetJson $ruJson -targetName "ru.json"
$ruOutput = ConvertTo-OrderedJson -obj $syncedRu
[System.IO.File]::WriteAllText($ruPath, $ruOutput, [System.Text.Encoding]::UTF8)
Write-Host "Saved: $ruPath" -ForegroundColor Cyan

Write-Host "`n=== Sync Complete ===" -ForegroundColor Green
Write-Host "Review the files for 'TODO_TRANSLATE:' placeholders" -ForegroundColor Yellow
