/**
 * Check Recent Library Leads
 * Purpose: Investigate 번역본 email issue
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkRecentLeads() {
  console.log('🔍 Checking Recent Library Leads');
  console.log('==========================================\n');

  try {
    // Check recent leads (last 24 hours)
    console.log('📋 Step 1: Recent leads (last 24 hours)...\n');

    const recentLeads = await sql`
      SELECT
        id,
        email,
        company_name,
        contact_name,
        library_item_id,
        email_sent,
        email_opened,
        download_link_clicked,
        lead_score,
        created_at,
        updated_at
      FROM library_leads
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    if (recentLeads.length === 0) {
      console.log('⚠️ No leads found in the last 24 hours\n');
    } else {
      console.log(`✅ Found ${recentLeads.length} leads:\n`);

      recentLeads.forEach((lead, index) => {
        console.log(`Lead #${index + 1}:`);
        console.log(`  ID: ${lead.id}`);
        console.log(`  Email: ${lead.email}`);
        console.log(`  Company: ${lead.company_name}`);
        console.log(`  Contact: ${lead.contact_name}`);
        console.log(`  Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
        console.log(`  Email Opened: ${lead.email_opened ? '👁️ Yes' : '⏳ No'}`);
        console.log(`  Download Clicked: ${lead.download_link_clicked ? '⬇️ Yes' : '⏳ No'}`);
        console.log(`  Lead Score: ${lead.lead_score}`);
        console.log(`  Created: ${lead.created_at}`);
        console.log(`  Updated: ${lead.updated_at}`);
        console.log('');
      });
    }

    // Check leads for oillex.co.kr@gmail.com
    console.log('📧 Step 2: Leads for oillex.co.kr@gmail.com...\n');

    const oillexLeads = await sql`
      SELECT
        id,
        email,
        company_name,
        email_sent,
        created_at
      FROM library_leads
      WHERE email = 'oillex.co.kr@gmail.com'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (oillexLeads.length === 0) {
      console.log('⚠️ No leads found for oillex.co.kr@gmail.com\n');
    } else {
      console.log(`✅ Found ${oillexLeads.length} leads:\n`);

      oillexLeads.forEach((lead, index) => {
        console.log(`Lead #${index + 1}:`);
        console.log(`  ID: ${lead.id}`);
        console.log(`  Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
        console.log(`  Created: ${lead.created_at}`);
        console.log('');
      });
    }

    // Check leads for admin@glec.io
    console.log('📧 Step 3: Leads for admin@glec.io...\n');

    const adminLeads = await sql`
      SELECT
        id,
        email,
        company_name,
        email_sent,
        created_at
      FROM library_leads
      WHERE email = 'admin@glec.io'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (adminLeads.length === 0) {
      console.log('⚠️ No leads found for admin@glec.io\n');
    } else {
      console.log(`✅ Found ${adminLeads.length} leads:\n`);

      adminLeads.forEach((lead, index) => {
        console.log(`Lead #${index + 1}:`);
        console.log(`  ID: ${lead.id}`);
        console.log(`  Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
        console.log(`  Created: ${lead.created_at}`);
        console.log('');
      });
    }

    // Check library items (to see what 번역본 might be)
    console.log('📚 Step 4: Available library items...\n');

    const libraryItems = await sql`
      SELECT
        id,
        title,
        slug,
        category,
        file_type,
        file_size,
        status
      FROM library_items
      WHERE status = 'PUBLISHED'
      ORDER BY created_at DESC
    `;

    console.log(`✅ Found ${libraryItems.length} published items:\n`);

    libraryItems.forEach((item, index) => {
      console.log(`Item #${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Slug: ${item.slug}`);
      console.log(`  Category: ${item.category}`);
      console.log(`  File Type: ${item.file_type}`);
      console.log(`  File Size: ${item.file_size ? `${Math.round(item.file_size / 1024)} KB` : 'N/A'}`);
      console.log('');
    });

    console.log('====================================');
    console.log('✅ INVESTIGATION COMPLETE');
    console.log('====================================\n');

    console.log('📊 Summary:');
    console.log(`  Total recent leads (24h): ${recentLeads.length}`);
    console.log(`  Leads for oillex.co.kr@gmail.com: ${oillexLeads.length}`);
    console.log(`  Leads for admin@glec.io: ${adminLeads.length}`);
    console.log(`  Published library items: ${libraryItems.length}`);
    console.log('');

    console.log('🔍 Next Steps:');
    if (recentLeads.length > 0) {
      const latestLead = recentLeads[0];
      console.log(`  1. Check Resend Dashboard: https://resend.com/emails`);
      console.log(`  2. Verify email sent to: ${latestLead.email}`);
      console.log(`  3. Check spam folder at: ${latestLead.email}`);
    } else {
      console.log('  1. No recent leads found - no email was sent');
      console.log('  2. User might be expecting email to different account');
      console.log('  3. Check if form submission failed');
    }

  } catch (error) {
    console.error('❌ Error checking leads:', error);
    throw error;
  }
}

// Run the check
checkRecentLeads()
  .then(() => {
    console.log('\n✅ Check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
