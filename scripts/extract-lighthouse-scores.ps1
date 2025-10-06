# Extract Lighthouse Scores
$json = Get-Content 'D:\GLEC-Website\glec-website\.lighthouseci\lhr-*.json' -Raw | ConvertFrom-Json

Write-Host '🎯 Lighthouse Performance Report' -ForegroundColor Cyan
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Category Scores:' -ForegroundColor White
Write-Host "Performance:    $([math]::Round($json.categories.performance.score * 100))%" -ForegroundColor $(if($json.categories.performance.score -ge 0.9){'Green'}elseif($json.categories.performance.score -ge 0.5){'Yellow'}else{'Red'})
Write-Host "Accessibility:  $([math]::Round($json.categories.accessibility.score * 100))%" -ForegroundColor $(if($json.categories.accessibility.score -ge 0.9){'Green'}elseif($json.categories.accessibility.score -ge 0.5){'Yellow'}else{'Red'})
Write-Host "Best Practices: $([math]::Round($json.categories.'best-practices'.score * 100))%" -ForegroundColor $(if($json.categories.'best-practices'.score -ge 0.9){'Green'}elseif($json.categories.'best-practices'.score -ge 0.5){'Yellow'}else{'Red'})
Write-Host "SEO:            $([math]::Round($json.categories.seo.score * 100))%" -ForegroundColor $(if($json.categories.seo.score -ge 0.9){'Green'}elseif($json.categories.seo.score -ge 0.5){'Yellow'}else{'Red'})

Write-Host ''
Write-Host 'Core Web Vitals:' -ForegroundColor White
Write-Host "  FCP (First Contentful Paint):    $($json.audits.'first-contentful-paint'.displayValue)"
Write-Host "  LCP (Largest Contentful Paint):  $($json.audits.'largest-contentful-paint'.displayValue)"
Write-Host "  SI (Speed Index):                 $($json.audits.'speed-index'.displayValue)"
Write-Host "  TBT (Total Blocking Time):        $($json.audits.'total-blocking-time'.displayValue)"
Write-Host "  CLS (Cumulative Layout Shift):    $($json.audits.'cumulative-layout-shift'.displayValue)"

Write-Host ''
Write-Host '❌ Failed Audits:' -ForegroundColor Red
$failedAudits = $json.audits.PSObject.Properties | Where-Object { $_.Value.score -ne $null -and $_.Value.score -lt 0.9 -and $_.Value.scoreDisplayMode -ne 'informative' } | Select-Object -First 10
foreach ($audit in $failedAudits) {
    Write-Host "  - $($audit.Value.title) (Score: $([math]::Round($audit.Value.score * 100))%)"
}
