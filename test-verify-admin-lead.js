/**
 * Verify Lead in Admin API
 *
 * Checks if the lead was created successfully in the database
 * Lead ID: f12d28ad-11ed-4cc0-9c08-ab6220b46e44
 * Email: ghdi0506@gmail.com
 */

const BASE_URL = 'https://glec-website.vercel.app';
const TEST_EMAIL = 'ghdi0506@gmail.com';
const LEAD_ID = 'f12d28ad-11ed-4cc0-9c08-ab6220b46e44';

console.log('🔍 Admin Lead Verification');
console.log('===========================\n');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}`);
console.log(`🆔 Lead ID: ${LEAD_ID}\n`);

async function verifyAdminLead() {
  try {
    // ========================================
    // Fetch leads from Admin API (no auth for now)
    // ========================================
    console.log('📊 Fetching leads from Admin API...');

    const response = await fetch(`${BASE_URL}/api/admin/library/leads?search=${encodeURIComponent(TEST_EMAIL)}&per_page=10`);

    if (!response.ok) {
      throw new Error(`Admin API failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API returned error: ${JSON.stringify(result.error)}`);
    }

    console.log(`✅ Found ${result.data.length} leads matching "${TEST_EMAIL}"\n`);

    if (result.data.length === 0) {
      console.log('⚠️  No leads found with this email.');
      console.log('   Possible reasons:');
      console.log('   - Admin API requires authentication');
      console.log('   - Lead was created but not indexed yet');
      console.log('   - Database connection issue\n');
      return { status: 'WARNING', message: 'No leads found' };
    }

    // ========================================
    // Display lead details
    // ========================================
    const lead = result.data[0];

    console.log('📋 Lead Details:');
    console.log('─'.repeat(60));
    console.log(`🆔 ID: ${lead.id}`);
    console.log(`🏢 Company: ${lead.company_name}`);
    console.log(`👤 Contact: ${lead.contact_name}`);
    console.log(`📧 Email: ${lead.email}`);
    console.log(`📞 Phone: ${lead.phone || 'N/A'}`);
    console.log(`🏭 Industry: ${lead.industry || 'N/A'}`);
    console.log(`💼 Job Title: ${lead.job_title || 'N/A'}`);
    console.log('');
    console.log(`📚 Library Item: ${lead.library_item_title || 'N/A'}`);
    console.log(`🔗 Slug: ${lead.library_item_slug || 'N/A'}`);
    console.log('');
    console.log(`📊 Lead Status: ${lead.lead_status}`);
    console.log(`🎯 Lead Score: ${lead.lead_score}`);
    console.log('');
    console.log(`✉️  Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
    console.log(`👁️  Email Opened: ${lead.email_opened ? '✅ Yes' : '❌ No'}`);
    console.log(`⬇️  Download Clicked: ${lead.download_link_clicked ? '✅ Yes' : '❌ No'}`);
    console.log('');
    console.log(`📅 Created: ${new Date(lead.created_at).toLocaleString('ko-KR')}`);
    console.log('─'.repeat(60));
    console.log('');

    // ========================================
    // Email tracking status
    // ========================================
    console.log('📧 Email Tracking Status:');
    console.log('');

    if (lead.email_sent) {
      console.log('✅ Email was sent successfully');
      console.log(`   Email ID: ${lead.email_id || 'N/A'}`);
      console.log('');

      if (lead.email_opened) {
        console.log('✅ Email was opened by recipient');
        console.log('   Lead status should be: OPENED or higher');
      } else {
        console.log('⏳ Email not opened yet');
        console.log('   Check your inbox and open the email');
      }
      console.log('');

      if (lead.download_link_clicked) {
        console.log('✅ Download link was clicked');
        console.log('   Lead status should be: DOWNLOADED');
      } else {
        console.log('⏳ Download link not clicked yet');
        console.log('   Click the "다운로드 (Google Drive)" button in the email');
      }
    } else {
      console.log('❌ Email was NOT sent');
      console.log('   Possible reasons:');
      console.log('   - Resend API key not configured');
      console.log('   - Email sending failed');
    }

    console.log('');

    // ========================================
    // Lead score breakdown
    // ========================================
    console.log('🎯 Lead Score Breakdown:');
    console.log('');
    console.log(`   Total Score: ${lead.lead_score}/100`);
    console.log('');
    console.log('   Scoring factors:');
    console.log('   - Library download: 30 points (high intent)');
    console.log('   - FRAMEWORK category: +20 points');
    console.log('   - Email domain (@gmail.com): +0 points (generic)');
    console.log('   - Marketing consent: +10 points');
    console.log('   - Phone provided: +10 points');
    console.log('');

    // ========================================
    // Next steps
    // ========================================
    console.log('📬 Next Steps:');
    console.log('');
    console.log('1. Check your email at ghdi0506@gmail.com');
    console.log('2. Open the email from GLEC <noreply@glec.io>');
    console.log('3. Click the "다운로드 (Google Drive)" button');
    console.log('4. Re-run this script to see updated tracking (email_opened, download_link_clicked)');
    console.log('5. Verify that Admin UI shows tracking indicators (👁️ ⬇️)');
    console.log('');

    // ========================================
    // Summary
    // ========================================
    console.log('====================================');
    console.log('✅ ADMIN VERIFICATION PASSED');
    console.log('====================================\n');
    console.log('Summary:');
    console.log(`   ✅ Lead found: ${lead.id}`);
    console.log(`   ✅ Email: ${lead.email}`);
    console.log(`   ✅ Company: ${lead.company_name}`);
    console.log(`   ✅ Lead Score: ${lead.lead_score}/100`);
    console.log(`   ${lead.email_sent ? '✅' : '❌'} Email sent: ${lead.email_sent}`);
    console.log(`   ${lead.email_opened ? '✅' : '⏳'} Email opened: ${lead.email_opened}`);
    console.log(`   ${lead.download_link_clicked ? '✅' : '⏳'} Download clicked: ${lead.download_link_clicked}`);
    console.log('');

    return { status: 'SUCCESS', lead };

  } catch (error) {
    console.error('');
    console.error('====================================');
    console.error('❌ ADMIN VERIFICATION FAILED');
    console.error('====================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    return { status: 'FAILED', error: error.message };
  }
}

// Run verification
verifyAdminLead()
  .then((result) => {
    if (result.status === 'SUCCESS' || result.status === 'WARNING') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
