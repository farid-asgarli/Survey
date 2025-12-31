# analyze-codebase.ps1
# Complete codebase analysis for M3 Expressive compliance

param(
    [string]$OutputPath = "../analysis",
    [switch]$ExportToFile
)

# Create output directory if it doesn't exist
if ($ExportToFile) {
    New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  M3 Expressive Compliance Scan  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Component counts
Write-Host "📊 Component Inventory" -ForegroundColor Green
Write-Host "----------------------" -ForegroundColor Green
$uiCount = (Get-ChildItem -Path components/ui -Recurse -Include *.tsx -ErrorAction SilentlyContinue).Count
$featureCount = (Get-ChildItem -Path components/features -Recurse -Include *.tsx -ErrorAction SilentlyContinue).Count
$layoutCount = (Get-ChildItem -Path components/layout -Recurse -Include *.tsx -ErrorAction SilentlyContinue).Count
$pageCount = (Get-ChildItem -Path pages -Recurse -Include *.tsx -ErrorAction SilentlyContinue).Count

Write-Host "UI Components:      $uiCount"
Write-Host "Feature Components: $featureCount"
Write-Host "Layout Components:  $layoutCount"
Write-Host "Pages:              $pageCount"
Write-Host ""

# Initialize violation counters
$violations = @{
    Shadows = @()
    WrongRadius = @()
    ArbitraryColors = @()
    NativeElements = @()
    CustomButtons = @()
    InlineStyles = @()
    Gradients = @()
}

# Find violations
Write-Host "🔍 Scanning for violations..." -ForegroundColor Yellow
Write-Host ""

# Shadows
$violations.Shadows = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "shadow-" | 
    Where-Object { $_.Path -notmatch "Toast" }

# Wrong button shapes
$violations.WrongRadius = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "rounded-(sm|md|lg|xl)" | 
    Where-Object { $_.Line -match "button|Button" }

# Arbitrary colors
$violations.ArbitraryColors = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "bg-\[#|text-\[#|bg-blue-|bg-gray-|bg-purple-|bg-green-|bg-red-"

# Native form elements
$violations.NativeElements = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "<input|<select|<textarea"

# Custom buttons
$violations.CustomButtons = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern '<button className'

# Inline styles
$violations.InlineStyles = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "style={{"

# Gradients
$violations.Gradients = Get-ChildItem -Path components -Recurse -Include *.tsx,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "bg-gradient-"

# Display results
Write-Host "🚨 Violation Summary" -ForegroundColor Red
Write-Host "--------------------" -ForegroundColor Red
Write-Host "Shadows (Critical):          $($violations.Shadows.Count)" -ForegroundColor $(if ($violations.Shadows.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Wrong Button Shapes (High):  $($violations.WrongRadius.Count)" -ForegroundColor $(if ($violations.WrongRadius.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Arbitrary Colors (High):     $($violations.ArbitraryColors.Count)" -ForegroundColor $(if ($violations.ArbitraryColors.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Native Form Elements (Med):  $($violations.NativeElements.Count)" -ForegroundColor $(if ($violations.NativeElements.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Custom Buttons (Medium):     $($violations.CustomButtons.Count)" -ForegroundColor $(if ($violations.CustomButtons.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Inline Styles (Low):         $($violations.InlineStyles.Count)" -ForegroundColor $(if ($violations.InlineStyles.Count -gt 0) { "Gray" } else { "Green" })
Write-Host "Gradients (Critical):        $($violations.Gradients.Count)" -ForegroundColor $(if ($violations.Gradients.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

# Calculate priority
$totalViolations = $violations.Shadows.Count + $violations.WrongRadius.Count + $violations.ArbitraryColors.Count + 
                   $violations.NativeElements.Count + $violations.CustomButtons.Count + $violations.Gradients.Count

Write-Host "📈 Total Violations: $totalViolations" -ForegroundColor Cyan
Write-Host ""

# Find files with most violations
Write-Host "🎯 High Priority Files (Top 10)" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

$fileViolations = @{}
foreach ($category in $violations.Keys) {
    foreach ($violation in $violations[$category]) {
        $file = $violation.Path
        if (-not $fileViolations.ContainsKey($file)) {
            $fileViolations[$file] = 0
        }
        $fileViolations[$file]++
    }
}

$topFiles = $fileViolations.GetEnumerator() | 
    Sort-Object Value -Descending | 
    Select-Object -First 10

foreach ($file in $topFiles) {
    $relativePath = $file.Key -replace [regex]::Escape($PWD.Path), "."
    Write-Host "$($file.Value) violations - $relativePath" -ForegroundColor Yellow
}
Write-Host ""

# Export details if requested
if ($ExportToFile) {
    Write-Host "💾 Exporting detailed reports..." -ForegroundColor Cyan
    
    # Export shadows
    if ($violations.Shadows.Count -gt 0) {
        $violations.Shadows | Select-Object Path, LineNumber, Line | 
            Export-Csv -Path "$OutputPath/violations-shadows.csv" -NoTypeInformation
        Write-Host "  ✓ Exported shadows to violations-shadows.csv"
    }
    
    # Export wrong radius
    if ($violations.WrongRadius.Count -gt 0) {
        $violations.WrongRadius | Select-Object Path, LineNumber, Line | 
            Export-Csv -Path "$OutputPath/violations-wrong-radius.csv" -NoTypeInformation
        Write-Host "  ✓ Exported wrong radius to violations-wrong-radius.csv"
    }
    
    # Export arbitrary colors
    if ($violations.ArbitraryColors.Count -gt 0) {
        $violations.ArbitraryColors | Select-Object Path, LineNumber, Line -First 100 | 
            Export-Csv -Path "$OutputPath/violations-arbitrary-colors.csv" -NoTypeInformation
        Write-Host "  ✓ Exported arbitrary colors to violations-arbitrary-colors.csv"
    }
    
    # Export native elements
    if ($violations.NativeElements.Count -gt 0) {
        $violations.NativeElements | Select-Object Path, LineNumber, Line -First 100 | 
            Export-Csv -Path "$OutputPath/violations-native-elements.csv" -NoTypeInformation
        Write-Host "  ✓ Exported native elements to violations-native-elements.csv"
    }
    
    # Export custom buttons
    if ($violations.CustomButtons.Count -gt 0) {
        $violations.CustomButtons | Select-Object Path, LineNumber, Line -First 100 | 
            Export-Csv -Path "$OutputPath/violations-custom-buttons.csv" -NoTypeInformation
        Write-Host "  ✓ Exported custom buttons to violations-custom-buttons.csv"
    }
    
    Write-Host ""
    Write-Host "Reports saved to: $OutputPath" -ForegroundColor Green
}

# Recommendations
Write-Host ""
Write-Host "💡 Recommendations" -ForegroundColor Green
Write-Host "------------------" -ForegroundColor Green

if ($violations.Shadows.Count -gt 0 -or $violations.Gradients.Count -gt 0) {
    Write-Host "🔴 CRITICAL: Remove all shadows and gradients immediately" -ForegroundColor Red
}

if ($violations.WrongRadius.Count -gt 0) {
    Write-Host "🟡 HIGH: Fix button border radius (must be rounded-full)" -ForegroundColor Yellow
}

if ($violations.ArbitraryColors.Count -gt 0) {
    Write-Host "🟡 HIGH: Replace arbitrary colors with semantic tokens" -ForegroundColor Yellow
}

if ($violations.CustomButtons.Count -gt 0) {
    Write-Host "🟠 MEDIUM: Replace custom buttons with Button component" -ForegroundColor DarkYellow
}

if ($violations.NativeElements.Count -gt 0) {
    Write-Host "🟠 MEDIUM: Replace native inputs with Input/Select/Textarea components" -ForegroundColor DarkYellow
}

if ($totalViolations -eq 0) {
    Write-Host "✅ No violations found! Codebase is M3 Expressive compliant." -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Analysis Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan