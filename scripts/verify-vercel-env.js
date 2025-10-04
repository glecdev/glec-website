#!/usr/bin/env node

/**
 * Vercel Environment Variable Validation Script
 *
 * 목적: Vercel production 환경에 설정된 환경 변수를 검증
 *
 * 실행: node scripts/verify-vercel-env.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 필수 환경 변수 정의
const REQUIRED_ENV_VARS = [
  {
    key: 'DATABASE_URL',
    required: true,
    description: 'Neon PostgreSQL pooled connection string'
  },
  {
    key: 'DIRECT_URL',
    required: true,
    description: 'Neon PostgreSQL direct connection string (for migrations)'
  },
  {
    key: 'NEXT_PUBLIC_STACK_PROJECT_ID',
    required: true,
    description: 'Stack Auth project ID'
  },
  {
    key: 'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    required: true,
    description: 'Stack Auth publishable client key'
  },
  {
    key: 'STACK_SECRET_SERVER_KEY',
    required: true,
    description: 'Stack Auth secret server key'
  },
  {
    key: 'JWT_SECRET',
    required: false,
    description: 'JWT secret key for session management (optional - Stack Auth handles this)'
  },
  {
    key: 'RESEND_API_KEY',
    required: false,
    description: 'Resend email service API key (optional - for contact form)'
  },
  {
    key: 'RESEND_FROM_EMAIL',
    required: false,
    description: 'Resend sender email address (optional - for contact form)'
  }
];

async function getVercelEnvVars() {
  try {
    const vercelToken = '4WjWFbv1BRjxABWdkzCI6jF0';
    const vercelPath = 'C:\\Users\\kangdeokho\\AppData\\Roaming\\npm\\node_modules\\vercel\\dist\\index.js';

    const { stdout } = await execAsync(
      `cd "d:\\GLEC-Website\\glec-website" && node "${vercelPath}" env ls production --token=${vercelToken}`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    // Parse Vercel CLI output
    const lines = stdout.split('\n').filter(line => line.trim());
    const envVars = [];

    for (const line of lines) {
      // Skip headers, footers, and non-data lines
      if (line.includes('name ') ||
          line.includes('Vercel CLI') ||
          line.includes('Retrieving') ||
          line.includes('Environment Variables found') ||
          line.includes('Common next commands') ||
          line.includes('vercel env') ||
          !line.trim()) {
        continue;
      }

      // Parse whitespace-separated columns: name value environments created
      const parts = line.trim().split(/\s{2,}/); // Split by 2+ spaces

      if (parts.length >= 3) {
        const [key, value, target] = parts;

        envVars.push({
          key: key.trim(),
          value: value.substring(0, 20) + (value.length > 20 ? '...' : ''), // Mask value
          target: [target.trim()]
        });
      }
    }

    return envVars;
  } catch (error) {
    console.error('Failed to fetch Vercel environment variables:', error);
    throw error;
  }
}

async function validateEnvironmentVariables() {
  console.log('🔍 Vercel Environment Variable Validation\n');
  console.log('━'.repeat(80));

  try {
    // Fetch Vercel env vars
    console.log('\n📥 Fetching Vercel production environment variables...\n');
    const vercelEnvVars = await getVercelEnvVars();

    const existingKeys = new Set(vercelEnvVars.map(v => v.key));

    // Validation results
    const results = {
      total: REQUIRED_ENV_VARS.filter(v => v.required).length,
      passed: 0,
      failed: 0,
      missing: [],
      present: []
    };

    console.log('✅ Environment Variable Status:\n');

    for (const check of REQUIRED_ENV_VARS) {
      const exists = existingKeys.has(check.key);
      const status = exists ? '✅ PRESENT' : '❌ MISSING';
      const emoji = exists ? '✅' : (check.required ? '❌' : '⚠️ ');

      console.log(`${emoji} ${check.key}`);
      console.log(`   Description: ${check.description}`);
      console.log(`   Required: ${check.required ? 'YES' : 'NO'}`);
      console.log(`   Status: ${status}`);
      console.log();

      if (exists) {
        results.passed++;
        results.present.push(check.key);
      } else if (check.required) {
        results.failed++;
        results.missing.push(check.key);
      }
    }

    console.log('━'.repeat(80));
    console.log('\n📊 Summary:\n');
    console.log(`Total Required: ${results.total}`);
    console.log(`✅ Present: ${results.passed} (${Math.round(results.passed / results.total * 100)}%)`);
    console.log(`❌ Missing: ${results.failed} (${Math.round(results.failed / results.total * 100)}%)`);

    if (results.missing.length > 0) {
      console.log('\n⚠️  Missing Required Environment Variables:\n');
      for (const key of results.missing) {
        const check = REQUIRED_ENV_VARS.find(c => c.key === key);
        console.log(`  - ${key}: ${check?.description}`);
      }
      console.log('\n❌ Validation FAILED - Missing required environment variables');
      process.exit(1);
    } else {
      console.log('\n✅ Validation PASSED - All required environment variables are present!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Validation FAILED:', error);
    process.exit(1);
  }
}

// Run validation
validateEnvironmentVariables();
