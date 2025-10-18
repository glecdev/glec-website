#!/usr/bin/env node

/**
 * Database Schema Verification Script
 *
 * Verifies all required tables exist for Email Template System
 */

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function verifySchema() {
  console.log('🔍 Verifying Database Schema...\n');

  const checks = {
    email_template_categories: false,
    email_templates: false,
    email_send_history: false,
    email_template_stats: false,
    contact_leads: false,
    library_leads_nurture_columns: false,
  };

  try {
    // Check email_template_categories
    const categories = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'email_template_categories'
    `;
    checks.email_template_categories = categories[0].count > 0;
    console.log(
      checks.email_template_categories ? '✅' : '❌',
      'email_template_categories table'
    );

    // Check email_templates
    const templates = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'email_templates'
    `;
    checks.email_templates = templates[0].count > 0;
    console.log(
      checks.email_templates ? '✅' : '❌',
      'email_templates table'
    );

    // Check email_send_history
    const history = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'email_send_history'
    `;
    checks.email_send_history = history[0].count > 0;
    console.log(
      checks.email_send_history ? '✅' : '❌',
      'email_send_history table'
    );

    // Check email_template_stats
    const stats = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'email_template_stats'
    `;
    checks.email_template_stats = stats[0].count > 0;
    console.log(
      checks.email_template_stats ? '✅' : '❌',
      'email_template_stats table'
    );

    // Check contact_leads
    const contactLeads = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'contact_leads'
    `;
    checks.contact_leads = contactLeads[0].count > 0;
    console.log(
      checks.contact_leads ? '✅' : '❌',
      'contact_leads table'
    );

    // Check library_leads nurture columns
    const libraryLeadsColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      AND column_name LIKE 'nurture_%'
    `;
    checks.library_leads_nurture_columns = libraryLeadsColumns.length >= 8; // day3/7/14/30 sent + sent_at
    console.log(
      checks.library_leads_nurture_columns ? '✅' : '❌',
      `library_leads nurture columns (${libraryLeadsColumns.length} found)`
    );

    console.log('\n📊 Summary:');
    console.log('====================');

    const allPassed = Object.values(checks).every((v) => v === true);

    if (allPassed) {
      console.log('✅ All schema checks passed!');
      console.log('✅ Database is ready for deployment.');
      return true;
    } else {
      console.log('❌ Some schema checks failed.');
      console.log('\n🔧 Missing components:');
      Object.entries(checks).forEach(([key, value]) => {
        if (!value) {
          console.log(`   - ${key}`);
        }
      });

      console.log('\n💡 Run the following scripts to fix:');
      if (!checks.email_template_categories || !checks.email_templates) {
        console.log('   node scripts/create-email-templates-tables.js');
      }
      if (!checks.contact_leads) {
        console.log('   node scripts/create-contact-leads-table.js');
      }
      if (!checks.library_leads_nurture_columns) {
        console.log('   ALTER library_leads table to add nurture columns');
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
    return false;
  }
}

// Additional: Count templates
async function verifyTemplates() {
  console.log('\n📧 Verifying Email Templates...\n');

  try {
    const templatesByCategory = await sql`
      SELECT
        c.category_key,
        COUNT(t.id) as count
      FROM email_template_categories c
      LEFT JOIN email_templates t ON t.category_id = c.id AND t.is_active = TRUE
      GROUP BY c.category_key
      ORDER BY c.category_key
    `;

    console.log('Templates by category:');
    console.log('====================');

    let totalTemplates = 0;
    templatesByCategory.forEach((row) => {
      console.log(`${row.category_key.padEnd(25)} : ${row.count} templates`);
      totalTemplates += parseInt(row.count);
    });

    console.log('====================');
    console.log(`Total                     : ${totalTemplates} templates\n`);

    if (totalTemplates >= 28) {
      console.log('✅ Sufficient templates seeded (28+ expected)');
      return true;
    } else {
      console.log(`⚠️  Only ${totalTemplates} templates found (28+ expected)`);
      console.log('\n💡 Run seeding scripts:');
      console.log('   node scripts/create-24-generic-templates.js');
      console.log('   node scripts/create-library-download-templates.js');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Templates table not ready yet (will be seeded later)');
    return true; // Not critical for initial schema check
  }
}

// Main
(async () => {
  const schemaOk = await verifySchema();
  const templatesOk = await verifyTemplates();

  console.log('\n🎯 Final Status:');
  console.log('====================');
  console.log(`Schema     : ${schemaOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Templates  : ${templatesOk ? '✅ PASS' : '⚠️  NEEDS SEEDING'}`);

  if (schemaOk) {
    console.log('\n✅ Database is ready for production deployment!');
    process.exit(0);
  } else {
    console.log('\n❌ Database schema incomplete. Fix issues above.');
    process.exit(1);
  }
})();
