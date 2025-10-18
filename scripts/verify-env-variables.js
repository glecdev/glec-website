#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 *
 * Verifies all required environment variables exist
 */

console.log('🔍 Verifying Environment Variables...\n');

const requiredVars = {
  DATABASE_URL: {
    description: 'Neon PostgreSQL connection string',
    pattern: /^postgresql:\/\/.+/,
    required: true,
  },
  JWT_SECRET: {
    description: 'JWT signing secret (32+ chars)',
    minLength: 32,
    required: true,
  },
  RESEND_API_KEY: {
    description: 'Resend email API key',
    pattern: /^re_[a-zA-Z0-9]+/,
    required: true,
  },
  RESEND_FROM_EMAIL: {
    description: 'Sender email address',
    pattern: /^.+@.+\..+/,
    required: true,
  },
  CRON_SECRET: {
    description: 'Cron job authentication secret',
    minLength: 20,
    required: true,
  },
  RESEND_WEBHOOK_SECRET: {
    description: 'Resend webhook signature secret',
    pattern: /^whsec_/,
    required: false, // Optional
  },
};

const checks = {};
let allPassed = true;

console.log('Required Environment Variables:');
console.log('================================\n');

Object.entries(requiredVars).forEach(([key, config]) => {
  const value = process.env[key];
  const exists = !!value;

  let status = '✅';
  let message = 'OK';

  if (!exists) {
    if (config.required) {
      status = '❌';
      message = 'MISSING (REQUIRED)';
      allPassed = false;
    } else {
      status = '⚠️ ';
      message = 'MISSING (OPTIONAL)';
    }
  } else {
    // Validate pattern
    if (config.pattern && !config.pattern.test(value)) {
      status = '❌';
      message = 'INVALID PATTERN';
      allPassed = false;
    }

    // Validate length
    if (config.minLength && value.length < config.minLength) {
      status = '❌';
      message = `TOO SHORT (min: ${config.minLength} chars)`;
      allPassed = false;
    }
  }

  checks[key] = { exists, valid: status === '✅', message };

  // Print result
  console.log(`${status} ${key.padEnd(25)} : ${message}`);
  if (exists && (status === '✅' || status === '⚠️ ')) {
    // Show truncated value for security
    const displayValue =
      value.length > 40
        ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
        : value;
    console.log(`   ${config.description}`);
    console.log(`   Value: ${displayValue}`);
  }
  console.log();
});

console.log('\n📊 Summary:');
console.log('================================');

if (allPassed) {
  console.log('✅ All required environment variables are set correctly!');
  console.log('✅ System is ready for deployment.');

  // Additional checks
  console.log('\n🔒 Security Checks:');
  console.log('================================');

  // JWT_SECRET entropy check
  if (process.env.JWT_SECRET) {
    const entropy = new Set(process.env.JWT_SECRET).size;
    if (entropy > 20) {
      console.log('✅ JWT_SECRET has good entropy');
    } else {
      console.log('⚠️  JWT_SECRET may have low entropy (consider regenerating)');
    }
  }

  // CRON_SECRET check
  if (process.env.CRON_SECRET) {
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(process.env.CRON_SECRET);
    if (isBase64) {
      console.log('✅ CRON_SECRET appears to be base64 encoded');
    } else {
      console.log('⚠️  CRON_SECRET not base64 encoded (consider encoding)');
    }
  }

  console.log('\n✅ Environment is ready for production!');
  process.exit(0);
} else {
  console.log('❌ Some environment variables are missing or invalid.');

  console.log('\n🔧 Missing/Invalid Variables:');
  Object.entries(checks).forEach(([key, { valid, message }]) => {
    if (!valid) {
      console.log(`   - ${key}: ${message}`);
    }
  });

  console.log('\n💡 How to fix:');
  console.log('   1. Create .env.local file (for local development)');
  console.log('   2. Add missing variables to Vercel (for production)');
  console.log('   3. Use: vercel env add <VAR_NAME> production');

  process.exit(1);
}
