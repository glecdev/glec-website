@echo off
REM ============================================================
REM POST-REBOOT AUTOMATION SCRIPT
REM Purpose: Clean environment and run E2E tests
REM Author: Claude AI (CTO Mode)
REM Date: 2025-10-06
REM ============================================================

echo.
echo ============================================================
echo   GLEC WEBSITE - POST-REBOOT AUTOMATION
echo ============================================================
echo.

REM Change to project directory
cd /d "D:\GLEC-Website\glec-website"

REM Step 1: Delete webpack cache
echo [Step 1/4] Deleting webpack cache...
if exist .next (
    rmdir /s /q .next
    echo   [OK] .next folder deleted
) else (
    echo   [OK] .next folder does not exist
)
echo.

REM Step 2: Start dev server
echo [Step 2/4] Starting development server...
echo   Please wait for "Ready in 2-3s" message...
echo.
start "GLEC Dev Server" cmd /c "npm run dev"

REM Step 3: Wait 60 seconds for compilation
echo [Step 3/4] Waiting 60 seconds for server compilation...
timeout /t 60 /nobreak >nul
echo   [OK] Server should be ready now
echo.

REM Step 4: Run E2E tests
echo [Step 4/4] Running E2E tests...
echo.
npx playwright test tests/e2e/admin-demo-requests.spec.ts --project=chromium --reporter=list --timeout=60000

echo.
echo ============================================================
echo   AUTOMATION COMPLETE
echo ============================================================
echo.
echo Check the test results above.
echo Expected: "11 passed"
echo.
echo If tests passed:
echo   - Infinite loop is FIXED
echo   - Ready to commit and deploy
echo.
echo If tests failed:
echo   - Check POST-REBOOT-COMMANDS.md for troubleshooting
echo.

pause
