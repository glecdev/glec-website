# Fix Factual Content Script
# Purpose: Replace DHL GoGreen and incorrect certification claims with factual content

Write-Host "🔧 Starting Factual Content Correction..." -ForegroundColor Cyan
Write-Host ""

$replacements = @(
    @{
        Pattern = "DHL GoGreen 파트너십 기반"
        Replacement = "ISO-14083 국제표준 기반"
    },
    @{
        Pattern = "DHL GoGreen 파트너십으로"
        Replacement = "ISO-14083 국제표준으로"
    },
    @{
        Pattern = "DHL GoGreen 파트너"
        Replacement = "Cloudflare Technology 파트너"
    },
    @{
        Pattern = "ISO-14083:2023 인증"
        Replacement = "ISO-14083:2023 기반"
    },
    @{
        Pattern = "ISO-14083 인증"
        Replacement = "ISO-14083 기반 솔루션"
    },
    @{
        Pattern = "Smart Freight Centre 인증"
        Replacement = "Smart Freight Centre GLEC Tool 인증 진행 중"
    },
    @{
        Pattern = "DHL GoGreen"
        Replacement = "ISO-14083"
    }
)

$files = @(
    "app\about\partners\layout.tsx",
    "app\about\company\layout.tsx",
    "app\dtg\layout.tsx",
    "app\solutions\api\layout.tsx"
)

$count = 0

foreach ($file in $files) {
    $fullPath = "D:\GLEC-Website\glec-website\$file"

    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        $content = Get-Content $fullPath -Raw
        $modified = $false

        foreach ($rep in $replacements) {
            if ($content -match [regex]::Escape($rep.Pattern)) {
                $content = $content -replace [regex]::Escape($rep.Pattern), $rep.Replacement
                $modified = $true
                $count++
                Write-Host "  ✓ Replaced: $($rep.Pattern)" -ForegroundColor Green
            }
        }

        if ($modified) {
            $content | Set-Content $fullPath -NoNewline
            Write-Host "  ✅ File updated" -ForegroundColor Green
        } else {
            Write-Host "  ⚪ No changes needed" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "  ❌ File not found: $file" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "🎉 Completion Summary:" -ForegroundColor Cyan
Write-Host "  Total replacements made: $count" -ForegroundColor White
Write-Host "  Files processed: $($files.Count)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
