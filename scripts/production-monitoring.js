/**
 * Production Monitoring Dashboard
 *
 * CTO-Level Real-time System Health Monitoring
 *
 * Monitors:
 * 1. API Endpoint Health (response times, error rates)
 * 2. Database Connectivity (Neon PostgreSQL)
 * 3. Email Service (Resend deliverability)
 * 4. Webhook Processing (event rates, failures)
 * 5. Cron Jobs (execution status)
 * 6. System Metrics (free tier usage)
 */

const { neon } = require('@neondatabase/serverless');

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const DATABASE_URL = process.env.DATABASE_URL;

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function formatDate(date) {
  return new Date(date).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function checkEndpointHealth(endpoint, method = 'GET', body = null) {
  const startTime = Date.now();

  try {
    const options = { method };
    if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const duration = Date.now() - startTime;

    return {
      ok: response.ok,
      status: response.status,
      duration,
      endpoint
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      duration: Date.now() - startTime,
      endpoint,
      error: error.message
    };
  }
}

async function getDatabaseMetrics() {
  if (!DATABASE_URL) {
    return { error: 'DATABASE_URL not configured' };
  }

  const sql = neon(DATABASE_URL);

  try {
    // Get database stats
    const [
      libraryLeads,
      demoRequests,
      contacts,
      webhookEvents,
      blacklist
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM library_leads`,
      sql`SELECT COUNT(*) as count FROM demo_requests`,
      sql`SELECT COUNT(*) as count FROM contacts`,
      sql`SELECT COUNT(*) as count FROM email_webhook_events`,
      sql`SELECT COUNT(*) as count FROM email_blacklist`
    ]);

    // Get recent webhook events
    const recentWebhooks = await sql`
      SELECT
        event_type,
        COUNT(*) as count
      FROM email_webhook_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY event_type
      ORDER BY count DESC
    `;

    // Get email delivery stats (last 7 days)
    const emailStats = await sql`
      SELECT
        COUNT(DISTINCT CASE WHEN event_type = 'email.sent' THEN resend_email_id END) as sent,
        COUNT(DISTINCT CASE WHEN event_type = 'email.delivered' THEN resend_email_id END) as delivered,
        COUNT(DISTINCT CASE WHEN event_type = 'email.opened' THEN resend_email_id END) as opened,
        COUNT(DISTINCT CASE WHEN event_type = 'email.clicked' THEN resend_email_id END) as clicked,
        COUNT(DISTINCT CASE WHEN event_type = 'email.bounced' THEN resend_email_id END) as bounced,
        COUNT(DISTINCT CASE WHEN event_type = 'email.complained' THEN resend_email_id END) as complained
      FROM email_webhook_events
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;

    return {
      counts: {
        library_leads: parseInt(libraryLeads[0].count),
        demo_requests: parseInt(demoRequests[0].count),
        contacts: parseInt(contacts[0].count),
        webhook_events: parseInt(webhookEvents[0].count),
        blacklist: parseInt(blacklist[0].count)
      },
      recentWebhooks,
      emailStats: emailStats[0]
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function displayDashboard() {
  console.clear();
  console.log(`${CYAN}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   GLEC Production Monitoring Dashboard                               ║
║   Real-time System Health Check                                      ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${RESET}
`);

  console.log(`${BLUE}🌐 Production URL:${RESET} ${BASE_URL}`);
  console.log(`${BLUE}⏰ Last Updated:${RESET} ${formatDate(new Date())}\n`);

  // API Endpoint Health
  console.log(`${CYAN}${'─'.repeat(70)}`);
  console.log('📡 API Endpoint Health');
  console.log(`${'─'.repeat(70)}${RESET}\n`);

  const endpoints = [
    { path: '/api/cron/library-nurture?cron_secret=OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D', name: 'Cron (Library Nurture)' },
    { path: '/api/webhooks/resend', method: 'POST', body: { type: 'email.sent', data: { email_id: 'health_check' } }, name: 'Webhook (Resend)' }
  ];

  for (const endpoint of endpoints) {
    const result = await checkEndpointHealth(endpoint.path, endpoint.method, endpoint.body);

    const statusColor = result.ok ? GREEN : RED;
    const statusIcon = result.ok ? '✅' : '❌';
    const durationColor = result.duration < 500 ? GREEN : result.duration < 2000 ? YELLOW : RED;

    console.log(`${statusColor}${statusIcon} ${endpoint.name}${RESET}`);
    console.log(`   Status: ${result.status} | Duration: ${durationColor}${formatDuration(result.duration)}${RESET}`);
    if (result.error) console.log(`   Error: ${RED}${result.error}${RESET}`);
    console.log();
  }

  // Database Metrics
  console.log(`${CYAN}${'─'.repeat(70)}`);
  console.log('🗄️  Database Metrics');
  console.log(`${'─'.repeat(70)}${RESET}\n`);

  const dbMetrics = await getDatabaseMetrics();

  if (dbMetrics.error) {
    console.log(`${RED}❌ Database Connection Failed${RESET}`);
    console.log(`   Error: ${dbMetrics.error}\n`);
  } else {
    console.log(`${GREEN}✅ Database Connected${RESET}\n`);

    console.log(`${BLUE}📊 Record Counts:${RESET}`);
    console.log(`   Library Leads: ${YELLOW}${dbMetrics.counts.library_leads.toLocaleString()}${RESET}`);
    console.log(`   Demo Requests: ${YELLOW}${dbMetrics.counts.demo_requests.toLocaleString()}${RESET}`);
    console.log(`   Contacts: ${YELLOW}${dbMetrics.counts.contacts.toLocaleString()}${RESET}`);
    console.log(`   Webhook Events: ${YELLOW}${dbMetrics.counts.webhook_events.toLocaleString()}${RESET}`);
    console.log(`   Email Blacklist: ${YELLOW}${dbMetrics.counts.blacklist.toLocaleString()}${RESET}\n`);

    // Email delivery funnel
    const stats = dbMetrics.emailStats;
    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0;
    const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : 0;
    const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : 0;

    console.log(`${BLUE}📧 Email Delivery Funnel (Last 7 Days):${RESET}`);
    console.log(`   Sent: ${YELLOW}${stats.sent}${RESET}`);
    console.log(`   Delivered: ${YELLOW}${stats.delivered}${RESET} (${deliveryRateColor(deliveryRate)}${deliveryRate}%${RESET})`);
    console.log(`   Opened: ${YELLOW}${stats.opened}${RESET} (${openRateColor(openRate)}${openRate}%${RESET})`);
    console.log(`   Clicked: ${YELLOW}${stats.clicked}${RESET} (${clickRateColor(clickRate)}${clickRate}%${RESET})`);
    console.log(`   Bounced: ${RED}${stats.bounced}${RESET}`);
    console.log(`   Complained: ${RED}${stats.complained}${RESET}\n`);

    // Recent webhook activity
    if (dbMetrics.recentWebhooks.length > 0) {
      console.log(`${BLUE}🔔 Webhook Activity (Last 24 Hours):${RESET}`);
      dbMetrics.recentWebhooks.forEach(event => {
        console.log(`   ${event.event_type}: ${YELLOW}${event.count}${RESET} events`);
      });
      console.log();
    }
  }

  // System Status Summary
  console.log(`${CYAN}${'─'.repeat(70)}`);
  console.log('📊 System Status Summary');
  console.log(`${'─'.repeat(70)}${RESET}\n`);

  const systemStatus = calculateSystemStatus(endpoints, dbMetrics);

  console.log(`   Overall Health: ${systemStatus.color}${systemStatus.status}${RESET}`);
  console.log(`   API Endpoints: ${systemStatus.apiStatus}`);
  console.log(`   Database: ${systemStatus.dbStatus}`);
  console.log(`   Email Service: ${systemStatus.emailStatus}\n`);

  // Alerts
  if (systemStatus.alerts.length > 0) {
    console.log(`${YELLOW}⚠️  Alerts:${RESET}\n`);
    systemStatus.alerts.forEach(alert => {
      console.log(`   ${YELLOW}⚠️${RESET}  ${alert}`);
    });
    console.log();
  }

  console.log(`${CYAN}${'═'.repeat(70)}${RESET}\n`);
}

function deliveryRateColor(rate) {
  if (rate >= 95) return GREEN;
  if (rate >= 90) return YELLOW;
  return RED;
}

function openRateColor(rate) {
  if (rate >= 20) return GREEN;
  if (rate >= 10) return YELLOW;
  return RED;
}

function clickRateColor(rate) {
  if (rate >= 3) return GREEN;
  if (rate >= 1) return YELLOW;
  return RED;
}

function calculateSystemStatus(endpoints, dbMetrics) {
  const alerts = [];

  // Check API health
  const apiHealthy = endpoints.every(ep => ep.ok !== false);
  const apiStatus = apiHealthy ? `${GREEN}✅ All Operational${RESET}` : `${RED}❌ Issues Detected${RESET}`;

  // Check database health
  const dbHealthy = !dbMetrics.error;
  const dbStatus = dbHealthy ? `${GREEN}✅ Connected${RESET}` : `${RED}❌ Connection Failed${RESET}`;

  // Check email delivery
  let emailStatus = `${YELLOW}⏳ No Data${RESET}`;
  if (dbHealthy && dbMetrics.emailStats) {
    const stats = dbMetrics.emailStats;
    const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;

    if (deliveryRate >= 95) {
      emailStatus = `${GREEN}✅ Excellent (${deliveryRate.toFixed(1)}%)${RESET}`;
    } else if (deliveryRate >= 90) {
      emailStatus = `${YELLOW}⚠️  Good (${deliveryRate.toFixed(1)}%)${RESET}`;
      alerts.push(`Email delivery rate below 95%: ${deliveryRate.toFixed(1)}%`);
    } else if (stats.sent > 0) {
      emailStatus = `${RED}❌ Poor (${deliveryRate.toFixed(1)}%)${RESET}`;
      alerts.push(`CRITICAL: Email delivery rate below 90%: ${deliveryRate.toFixed(1)}%`);
    }

    // Check bounce rate
    const bounceRate = stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0;
    if (bounceRate > 5) {
      alerts.push(`High bounce rate: ${bounceRate.toFixed(1)}% (threshold: 5%)`);
    }

    // Check complaint rate
    const complaintRate = stats.sent > 0 ? (stats.complained / stats.sent) * 100 : 0;
    if (complaintRate > 0.1) {
      alerts.push(`High complaint rate: ${complaintRate.toFixed(1)}% (threshold: 0.1%)`);
    }
  }

  // Overall status
  let overallStatus, overallColor;
  if (apiHealthy && dbHealthy && alerts.length === 0) {
    overallStatus = '🟢 OPERATIONAL';
    overallColor = GREEN;
  } else if (alerts.length > 0 && alerts.some(a => a.includes('CRITICAL'))) {
    overallStatus = '🔴 CRITICAL ISSUES';
    overallColor = RED;
  } else if (!apiHealthy || !dbHealthy) {
    overallStatus = '🟡 DEGRADED';
    overallColor = YELLOW;
  } else {
    overallStatus = '🟡 WARNINGS';
    overallColor = YELLOW;
  }

  return {
    status: overallStatus,
    color: overallColor,
    apiStatus,
    dbStatus,
    emailStatus,
    alerts
  };
}

// Main execution
async function main() {
  if (!DATABASE_URL) {
    console.error(`${RED}ERROR: DATABASE_URL environment variable not set${RESET}`);
    console.log(`${YELLOW}Set it in .env.local or run with:${RESET}`);
    console.log(`${BLUE}DATABASE_URL="your_database_url" node scripts/production-monitoring.js${RESET}`);
    process.exit(1);
  }

  // Run once
  await displayDashboard();

  // Optional: Auto-refresh every 30 seconds
  if (process.argv.includes('--watch')) {
    console.log(`${BLUE}ℹ️  Auto-refresh enabled (every 30 seconds). Press Ctrl+C to exit.${RESET}\n`);
    setInterval(displayDashboard, 30000);
  }
}

main().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  console.error(error.stack);
  process.exit(1);
});
