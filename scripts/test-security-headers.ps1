# Test Security Headers on Production Site

Write-Host '🔒 Testing Security Headers on Vercel Production...' -ForegroundColor Cyan
Write-Host ''

# Wait for deployment
Write-Host '⏳ Waiting 30 seconds for Vercel deployment...' -ForegroundColor Yellow
Start-Sleep -Seconds 30

try {
    $response = Invoke-WebRequest -Uri 'https://glec-website.vercel.app' -Method Head -ErrorAction Stop

    Write-Host '✅ Site is accessible' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Security Headers:' -ForegroundColor White
    Write-Host '==================' -ForegroundColor White

    $headers = @(
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy'
    )

    foreach ($header in $headers) {
        if ($response.Headers[$header]) {
            Write-Host "✅ $header" -ForegroundColor Green
            Write-Host "   Value: $($response.Headers[$header])" -ForegroundColor Gray
        } else {
            Write-Host "❌ $header - NOT FOUND" -ForegroundColor Red
        }
        Write-Host ''
    }

    Write-Host ''
    Write-Host '🎉 Security header test complete!' -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
