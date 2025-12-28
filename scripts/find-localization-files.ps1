#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Finds hardcoded strings in .NET applications for localization.

.DESCRIPTION
    Scans C# files in a .NET project to identify hardcoded strings that should be localized.
    Generates both JSON and CSV reports with categorization and layer breakdown.

.PARAMETER SourcePath
    Path to the source directory to scan. Defaults to ./src

.PARAMETER OutputPath
    Path for output reports. Defaults to current directory.

.PARAMETER MinLength
    Minimum string length to consider. Defaults to 3.

.EXAMPLE
    .\Find-LocalizableStrings.ps1 -SourcePath ./src
    .\Find-LocalizableStrings.ps1 -SourcePath ./src -MinLength 5
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$SourcePath = "./src",
    
    [Parameter()]
    [string]$OutputPath = ".",
    
    [Parameter()]
    [int]$MinLength = 3
)

# Configuration
$Config = @{
    SkipDirectories = @('bin', 'obj', 'Migrations', 'node_modules', '.git', '.vs', 'Properties', 'packages')
    FileExtensions = @('.cs')
    MinLength = $MinLength
    MaxLength = 500
}

# Exclude patterns for lines
$ExcludeLinePatterns = @(
    '^\s*using\s+',
    '^\s*namespace\s+',
    '^\s*//',
    '^\s*\*',
    '^\s*\[',
    'LogLevel\.',
    'typeof\(',
    'nameof\(',
    'throw new\s+\w+Exception',
    '\.Add\("|\.Contains\("|\.StartsWith\(',
    '\.UseRouting\(|\.UseAuthorization\(',
    '\.AddPolicy\(',
    '\.RequireRole\(',
    'builder\.|services\.|app\.',
    'Request\.Headers\[',
    'Response\.ContentType\s*=',
    'new HeaderApiVersionReader',
    'new QueryStringApiVersionReader',
    'SwaggerEndpoint\(',
    'ContentType\s*=',
    'MapHealthChecks\(',
    'Extensions\[',
    'problemDetails\.Extensions',
    'Type\\s*=\\s*\"https://tools\\.ietf\\.org',
    '=> \"https://tools\\.ietf\\.org'
)

# Exclude patterns for strings
$ExcludeStringPatterns = @(
    '^[A-Z_][A-Z0-9_]*$',                   # ALL_CAPS
    '^[a-z][a-zA-Z0-9]*$',                  # camelCase
    '^[A-Z][a-zA-Z0-9]*$',                  # PascalCase (single word)
    '^https?://',                            # URLs
    '^[/\\]|[/\\]$',                        # Paths
    '^/',                                    # URL paths like /health
    '^\{.*\}$',                             # JSON-like
    '^[0-9.,\-:/\s]+$',                     # Numbers/dates
    '^[\w\.]+@[\w\.]+$',                    # Emails
    '^application/',                         # MIME types
    '^text/',                                # Text MIME types
    '^image/',                               # Image MIME types
    '^[A-Z][a-z]+:[A-Z]',                   # Policy names
    'Connection|ConnectionString',           # Connection strings
    'appsettings|launchSettings',           # Config files
    '\.(json|xml|txt|csv|gif|png|jpg)$',   # File extensions
    '^v\d+',                                # Version strings
    '^[a-f0-9]{8}-[a-f0-9]{4}',            # GUIDs
    '^Bearer$|^Basic$|^Digest$',            # Auth schemes
    '^X-[A-Za-z-]+$',                       # HTTP headers starting with X-
    '^api-',                                 # API-related technical terms
    "^'v'V+$",                               # Version format patterns
    '^(fixed|anonymous|per-namespace|auth|default)$', # Technical single-word identifiers
    '^[A-Z0-9+/]{20,}={0,2}$',              # Base64 encoded data
    '^(db|sql|postgresql)$',                # Database-related keywords
    '^(errors?|exception|stackTrace|traceId|exceptionType|innerException)$', # Error extension keys
    '^Authorization$',                       # HTTP header names
    '^Namespace$',                           # Technical namespace identifier
    '^(AllowAll|Production)$',              # Policy/environment names
    '^(Bad Request|Unauthorized|Forbidden|Not Found|Conflict|Internal Server Error|An error occurred)$', # HTTP status text
    '^(Surveys|Templates|Themes)$',         # Single-word controller names
    '^https://tools\.ietf\.org/',          # RFC URLs
    'https://tools\.ietf\.org/html/rfc'    # RFC URLs (anywhere in string)
)

# Results structure
$Results = @{
    Files = @()
    ByLayer = @{
        API = @{ Files = 0; Strings = 0; UniqueStrings = [System.Collections.Generic.HashSet[string]]::new() }
        Application = @{ Files = 0; Strings = 0; UniqueStrings = [System.Collections.Generic.HashSet[string]]::new() }
        Domain = @{ Files = 0; Strings = 0; UniqueStrings = [System.Collections.Generic.HashSet[string]]::new() }
        Infrastructure = @{ Files = 0; Strings = 0; UniqueStrings = [System.Collections.Generic.HashSet[string]]::new() }
    }
    Summary = @{
        TotalFiles = 0
        TotalStrings = 0
        UniqueStrings = [System.Collections.Generic.HashSet[string]]::new()
    }
    Categories = @{}
}

function Get-Layer {
    param([string]$FilePath)
    
    switch -Regex ($FilePath) {
        '\.API\\' { return 'API' }
        '\.Application\\' { return 'Application' }
        '\.Domain\\' { return 'Domain' }
        '\.Infrastructure\\' { return 'Infrastructure' }
        default { return $null }
    }
}

function Test-ShouldExcludeString {
    param(
        [string]$String,
        [string]$Context = ''
    )
    
    if ($String.Length -lt $Config.MinLength -or $String.Length -gt $Config.MaxLength) {
        return $true
    }
    
    # Exclude short strings without spaces (likely identifiers)
    if ($String.Length -lt 20 -and $String -notmatch '\s') {
        return $true
    }
    
    foreach ($pattern in $ExcludeStringPatterns) {
        if ($String -match $pattern) {
            return $true
        }
    }
    
    # Context-based exclusions
    if ($Context) {
        # Strings in header/parameter contexts
        if ($Context -match '(Headers|Parameters|QueryString|HeaderApiVersionReader|partitionKey|tags\s*[:=])' -and $String.Length -lt 30) {
            return $true
        }
        
        # Strings in configuration contexts
        if ($Context -match '(name\s*[:=]|Name\s*=|Id\s*=|Type\s*=|Title\s*=|Version\s*=|Scheme\s*=)' -and $String.Length -lt 25) {
            return $true
        }
    }
    
    return $false
}

function Get-StringCategory {
    param(
        [string]$String,
        [string]$Context
    )
    
    $lowerStr = $String.ToLower()
    $lowerContext = $Context.ToLower()
    
    # RFC URLs and technical documentation links
    if ($String -match '^https://tools\.ietf\.org/') {
        return 'technical_reference'
    }
    
    # Problem Details fields (Title, Type, Detail)
    if ($lowerContext -match 'problemdetails|type\s*=|title\s*=|detail\s*=' -and
        $String -match '^(https://|[A-Z][a-z]+ |not found|unauthorized|forbidden|bad request)') {
        return 'problem_details'
    }
    
    # HTTP status messages
    if ($String -match '^(Bad Request|Unauthorized|Forbidden|Not Found|Conflict|Internal Server Error)$') {
        return 'http_status'
    }
    
    # Error messages
    if ($lowerContext -match 'throw |exception' -or 
        $String -match 'cannot|invalid|error|failed' -and $String.Length > 20) {
        return 'error_message'
    }
    
    # Validation messages
    if ($lowerContext -match 'validator|ruleof|rulefor' -or 
        $lowerStr -match 'required|must be|should|cannot be empty') {
        return 'validation_message'
    }
    
    # Log messages
    if ($lowerContext -match '\blog\b|logger|log\.') {
        return 'log_message'
    }
    
    # API responses (but not problem details)
    if ($lowerContext -match 'return |ok\(|badrequest|notfound|statuscode' -and
        $lowerContext -notmatch 'problemdetails') {
        return 'api_response'
    }
    
    # Email/notifications
    if ($lowerContext -match 'email|subject|body|message|notification') {
        return 'notification_content'
    }
    
    # UI text (short strings without dots, but exclude single words)
    if ($String.Length -ge 10 -and $String.Length -lt 30 -and $String -notmatch '\.' -and $String -match '\s') {
        return 'ui_text'
    }
    
    return 'general'
}

function Get-StringsFromFile {
    param(
        [string]$FilePath,
        [string]$Content
    )
    
    $strings = @()
    $lines = $Content -split "`n"
    
    # Regex for C# string literals (regular, verbatim, interpolated)
    $stringPattern = '(?:@)?"(?:[^"\\]|\\.)*"|(?:\$@?|@\$)"(?:[^"\\]|\\.|\{[^}]*\})*"'
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Skip excluded lines
        $shouldSkip = $false
        foreach ($pattern in $ExcludeLinePatterns) {
            if ($line -match $pattern) {
                $shouldSkip = $true
                break
            }
        }
        
        if ($shouldSkip -or $line.Trim().Length -lt 5) {
            continue
        }
        
        # Find all string matches
        $matches = [regex]::Matches($line, $stringPattern)
        
        foreach ($match in $matches) {
            $stringValue = $match.Value
            $isInterpolated = $stringValue -match '^\$' -or $stringValue -match '\$\{'
            
            # Clean the string - handle @$, $@, @, $ prefixes
            $stringValue = $stringValue -replace '^[\$@]+"', '' -replace '"$', ''
            
            # Handle interpolated strings
            if ($isInterpolated) {
                $stringValue = $stringValue -replace '\{[^}]*\}', '{...}'
            }
            
            # Unescape
            $stringValue = $stringValue -replace '\\n', "`n" `
                                         -replace '\\t', "`t" `
                                         -replace '\\r', "`r" `
                                         -replace '\\"', '"' `
                                         -replace '\\\\', '\'
            
            # Skip if excluded (with context)
            if (Test-ShouldExcludeString -String $stringValue -Context $line) {
                continue
            }
            
            # Additional context filtering
            if ($line -match 'connectionstring|configuration\[|\.getvalue\(|\.getsection\(|headers\[|contenttype|mimetype|swagger|healthcheck|tags\s*=|name\s*:|endpoint') {
                continue
            }
            
            # Skip if string looks like a constant or identifier
            if ($stringValue -match '^[a-z-]+$' -and $stringValue.Length -lt 15) {
                continue
            }
            
            # Skip technical constants (UPPER_CASE_WITH_UNDERSCORES)
            if ($stringValue -match '^[A-Z][A-Z_]+[A-Z]$') {
                continue
            }
            
            # Skip strings that are primarily placeholder templates
            if (($stringValue -match '\{[A-Za-z]+\}') -and 
                (($stringValue -split '\{[A-Za-z]+\}').Where({ $_.Trim().Length -gt 0 }).Count -le 2)) {
                continue
            }
            
            # Skip developer-facing technical messages
            if ($stringValue -match '^Cannot convert|^Invalid response type|should only be used with') {
                continue
            }
            
            $category = Get-StringCategory -String $stringValue -Context $line
            
            $strings += @{
                Value = $stringValue
                Line = $i + 1
                Context = $line.Trim().Substring(0, [Math]::Min(200, $line.Trim().Length))
                IsInterpolated = $isInterpolated
                Category = $category
            }
            
            # Track unique strings
            [void]$Results.Summary.UniqueStrings.Add($stringValue)
            
            # Track by layer
            $layer = Get-Layer -FilePath $FilePath
            if ($layer -and $Results.ByLayer.ContainsKey($layer)) {
                [void]$Results.ByLayer[$layer].UniqueStrings.Add($stringValue)
            }
            
            # Track by category
            if (-not $Results.Categories.ContainsKey($category)) {
                $Results.Categories[$category] = @{
                    Count = 0
                    Examples = @()
                }
            }
            $Results.Categories[$category].Count++
            if ($Results.Categories[$category].Examples.Count -lt 5) {
                $Results.Categories[$category].Examples += $stringValue
            }
        }
    }
    
    return $strings
}

function Find-LocalizableStrings {
    param([string]$Path)
    
    Write-Host "🔍 Scanning for localizable strings..." -ForegroundColor Cyan
    
    Get-ChildItem -Path $Path -Recurse -File | Where-Object {
        $file = $_
        $shouldInclude = $file.Extension -in $Config.FileExtensions
        
        # Check if file is in any skip directory
        if ($shouldInclude) {
            foreach ($skipDir in $Config.SkipDirectories) {
                if ($file.FullName -match "[\\/]$skipDir[\\/]") {
                    $shouldInclude = $false
                    break
                }
            }
        }
        
        return $shouldInclude
    } | ForEach-Object {
        $file = $_
        $Results.Summary.TotalFiles++
        
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
            $strings = Get-StringsFromFile -FilePath $file.FullName -Content $content
            
            if ($strings.Count -gt 0) {
                # Properly calculate relative path
                $relativePath = $file.FullName.Replace([regex]::Escape($SourcePath), "").TrimStart([char[]]@('\', '/'))
                $layer = Get-Layer -FilePath $file.FullName
                
                $Results.Files += @{
                    Path = $relativePath
                    FullPath = $file.FullName
                    StringCount = $strings.Count
                    Strings = $strings
                    Layer = $layer
                }
                
                $Results.Summary.TotalStrings += $strings.Count
                
                # Update layer stats
                if ($layer -and $Results.ByLayer.ContainsKey($layer)) {
                    $Results.ByLayer[$layer].Files++
                    $Results.ByLayer[$layer].Strings += $strings.Count
                }
            }
        }
        catch {
            Write-Warning "Error processing $($file.FullName): $_"
        }
    }
}

function Export-Reports {
    param([string]$OutputDir)
    
    $jsonPath = Join-Path $OutputDir "localization-report.json"
    $csvPath = Join-Path $OutputDir "localization-report.csv"
    
    # Prepare layer breakdown
    $layerBreakdown = @{}
    foreach ($layer in $Results.ByLayer.Keys) {
        $layerBreakdown[$layer] = @{
            Files = $Results.ByLayer[$layer].Files
            TotalStrings = $Results.ByLayer[$layer].Strings
            UniqueStrings = $Results.ByLayer[$layer].UniqueStrings.Count
        }
    }
    
    # Create JSON report
    $report = @{
        GeneratedAt = (Get-Date).ToString("o")
        SourceDirectory = $SourcePath
        Summary = @{
            TotalFiles = $Results.Summary.TotalFiles
            FilesWithStrings = $Results.Files.Count
            TotalStrings = $Results.Summary.TotalStrings
            UniqueCount = $Results.Summary.UniqueStrings.Count
            UniqueStrings = @($Results.Summary.UniqueStrings | Sort-Object)
        }
        LayerBreakdown = $layerBreakdown
        CategoryBreakdown = $Results.Categories
        Files = @($Results.Files | Sort-Object -Property StringCount -Descending)
        SuggestedResourceStructure = @{
            Description = "Suggested JSON resource file structure for localization"
            Example = @{
                Errors = @{
                    ValidationFailed = "Validation failed"
                    NotFound = "Resource not found"
                }
                Validation = @{
                    Required = "This field is required"
                    InvalidEmail = "Invalid email format"
                }
                Messages = @{
                    Success = "Operation completed successfully"
                }
            }
        }
    }
    
    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
    
    # Create CSV report
    $csvData = @()
    foreach ($file in $Results.Files) {
        foreach ($str in $file.Strings) {
            $csvData += [PSCustomObject]@{
                File = $file.Path
                Line = $str.Line
                Category = $str.Category
                StringValue = $str.Value
                Context = $str.Context
                IsInterpolated = $str.IsInterpolated
                Layer = $file.Layer
            }
        }
    }
    $csvData | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    
    return @{
        JsonPath = $jsonPath
        CsvPath = $csvPath
    }
}

function Show-Summary {
    param($OutputPaths)
    
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║         Localization String Finder - Report Summary        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📁 Source Directory: " -NoNewline
    Write-Host $SourcePath -ForegroundColor Yellow
    
    Write-Host "📊 Files Scanned: " -NoNewline
    Write-Host $Results.Summary.TotalFiles -ForegroundColor Cyan
    
    Write-Host "📄 Files with Localizable Strings: " -NoNewline
    Write-Host $Results.Files.Count -ForegroundColor Cyan
    
    Write-Host "🔤 Total String Instances: " -NoNewline
    Write-Host $Results.Summary.TotalStrings -ForegroundColor Cyan
    
    Write-Host "✨ Unique Strings: " -NoNewline
    Write-Host $Results.Summary.UniqueStrings.Count -ForegroundColor Cyan
    
    Write-Host "`n📚 Breakdown by Layer:" -ForegroundColor Magenta
    foreach ($layer in $Results.ByLayer.Keys | Sort-Object) {
        $data = $Results.ByLayer[$layer]
        if ($data.Files -gt 0) {
            Write-Host ("   {0,-20} - {1} files, {2} instances, {3} unique" -f `
                $layer, $data.Files, $data.Strings, $data.UniqueStrings.Count) -ForegroundColor White
        }
    }
    
    Write-Host "`n🏷️  Breakdown by Category:" -ForegroundColor Magenta
    $Results.Categories.GetEnumerator() | Sort-Object -Property { $_.Value.Count } -Descending | ForEach-Object {
        Write-Host ("   {0,-25} - {1} strings" -f $_.Key, $_.Value.Count) -ForegroundColor White
    }
    
    Write-Host "`n📋 Top 10 Files with Most Localizable Strings:" -ForegroundColor Magenta
    $Results.Files | Sort-Object -Property StringCount -Descending | Select-Object -First 10 | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host ("   {0,2}. {1,-60} ({2} strings)" -f $i, $_.Path, $_.StringCount) -ForegroundColor White
        $i++
    }
    
    Write-Host "`n💾 Output Files:" -ForegroundColor Green
    Write-Host "   JSON Report: " -NoNewline
    Write-Host $OutputPaths.JsonPath -ForegroundColor Yellow
    Write-Host "   CSV Report:  " -NoNewline
    Write-Host $OutputPaths.CsvPath -ForegroundColor Yellow
    
    Write-Host "`n✅ Scan complete!`n" -ForegroundColor Green
}

# Main execution
try {
    if (-not (Test-Path $SourcePath)) {
        Write-Error "Source path '$SourcePath' not found!"
        exit 1
    }
    
    $SourcePath = Resolve-Path $SourcePath
    $OutputPath = Resolve-Path $OutputPath
    
    Find-LocalizableStrings -Path $SourcePath
    $outputPaths = Export-Reports -OutputDir $OutputPath
    Show-Summary -OutputPaths $outputPaths
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}