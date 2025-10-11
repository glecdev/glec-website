/**
 * Verify Popups System Working
 *
 * Purpose: Quick verification that 3 popups exist and are active
 * - Checks database for active popups
 * - Tests API endpoint
 * - Provides summary report
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function verifyPopups() {
  console.log('🔍 Verifying Popup System\n');

  try {
    // Step 1: Check database
    console.log('📊 Step 1: Checking database...');
    const now = new Date().toISOString();

    const popups = await sql`
      SELECT
        id, title, display_type, is_active,
        start_date, end_date, background_color, position, size
      FROM popups
      WHERE
        is_active = true
        AND deleted_at IS NULL
        AND (start_date IS NULL OR start_date <= ${now})
        AND (end_date IS NULL OR end_date >= ${now})
      ORDER BY z_index DESC
    `;

    console.log(`   ✅ Active popups in database: ${popups.length}\n`);

    if (popups.length === 0) {
      console.log('   ⚠️  No active popups found in database!');
      console.log('   💡 Run: node scripts/create-launch-popups.js\n');
      return;
    }

    // Show popup details
    console.log('📋 Popup Details:\n');
    popups.forEach((popup, index) => {
      console.log(`${index + 1}. ${popup.title}`);
      console.log(`   - Type: ${popup.display_type}`);
      console.log(`   - Active: ${popup.is_active}`);
      console.log(`   - Background: ${popup.background_color || 'default'}`);
      console.log(`   - Start: ${popup.start_date}`);
      console.log(`   - End: ${popup.end_date}\n`);
    });

    // Step 2: Test API endpoint
    console.log('📡 Step 2: Testing API endpoint...');

    const response = await fetch('http://localhost:3000/api/popups');
    const apiData = await response.json();

    console.log(`   ✅ API Status: ${response.status}`);
    console.log(`   ✅ API Success: ${apiData.success}`);
    console.log(`   ✅ Popups returned: ${apiData.data.length}\n`);

    if (!apiData.success) {
      console.log('   ❌ API returned error:', apiData.error);
      return;
    }

    // Count by type
    const banner = apiData.data.filter((p) => p.displayType === 'banner');
    const modal = apiData.data.filter((p) => p.displayType === 'modal');
    const corner = apiData.data.filter((p) => p.displayType === 'corner');

    console.log('📊 Popup Types:');
    console.log(`   - Banner: ${banner.length}`);
    console.log(`   - Modal: ${modal.length}`);
    console.log(`   - Corner: ${corner.length}\n`);

    // Step 3: Verify popup managers
    console.log('🔧 Step 3: Checking popup components...');

    const fs = await import('fs');

    // Check BannerPopupManager
    const bannerManager = fs.readFileSync('./components/BannerPopupManager.tsx', 'utf-8');
    const hasBackgroundColor = bannerManager.includes('popup.backgroundColor');
    const hasShowOncePerDay = bannerManager.includes('popup.showOncePerDay');

    console.log(`   ✅ BannerPopupManager exists`);
    console.log(`   ${hasBackgroundColor ? '✅' : '❌'} Dynamic backgroundColor support`);
    console.log(`   ${hasShowOncePerDay ? '✅' : '❌'} showOncePerDay support\n`);

    // Check PopupManager
    const popupManager = fs.readFileSync('./components/PopupManager.tsx', 'utf-8');
    const hasPremiumGradient = popupManager.includes('bg-gradient-to-br from-primary-500');
    const hasAnimatedBlur = popupManager.includes('animate-pulse');
    const hasEscKey = popupManager.includes("e.key === 'Escape'");
    const hasBodyScrollLock = popupManager.includes("document.body.style.overflow = 'hidden'");

    console.log(`   ✅ PopupManager exists`);
    console.log(`   ${hasPremiumGradient ? '✅' : '❌'} Premium gradient design`);
    console.log(`   ${hasAnimatedBlur ? '✅' : '❌'} Animated blur pattern`);
    console.log(`   ${hasEscKey ? '✅' : '❌'} ESC key support`);
    console.log(`   ${hasBodyScrollLock ? '✅' : '❌'} Body scroll lock\n`);

    // Step 4: Check RootLayoutClient
    console.log('🏗️  Step 4: Checking layout integration...');

    const layout = fs.readFileSync('./components/RootLayoutClient.tsx', 'utf-8');
    const hasBannerManager = layout.includes('<BannerPopupManager />');
    const hasPopupManager = layout.includes('<PopupManager />');

    console.log(`   ${hasBannerManager ? '✅' : '❌'} BannerPopupManager in layout`);
    console.log(`   ${hasPopupManager ? '✅' : '❌'} PopupManager in layout\n`);

    // Final summary
    console.log('═'.repeat(60));
    console.log('✅ POPUP SYSTEM VERIFICATION COMPLETE');
    console.log('═'.repeat(60));
    console.log(`Total Active Popups: ${popups.length}`);
    console.log(`API Endpoint: ${response.ok ? 'WORKING' : 'FAILED'}`);
    console.log(`Premium Design: ${hasPremiumGradient && hasAnimatedBlur ? 'ACTIVE' : 'MISSING'}`);
    console.log(`Layout Integration: ${hasBannerManager && hasPopupManager ? 'COMPLETE' : 'INCOMPLETE'}`);
    console.log('═'.repeat(60));

    console.log('\n💡 Next Steps:');
    console.log('1. Open http://localhost:3000 in a browser');
    console.log('2. You should see:');
    console.log(`   - ${banner.length} banner popup(s) at the top`);
    console.log(`   - ${modal.length} modal popup(s) in the center`);
    console.log(`   - ${corner.length} corner popup(s) at bottom-right`);
    console.log('3. Test close buttons, ESC key, and "오늘 하루 보지 않기"\n');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyPopups();
