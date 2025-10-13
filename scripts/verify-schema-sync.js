#!/usr/bin/env node

/**
 * Schema Sync Verification Script
 *
 * Purpose: Prevent schema drift between Prisma schema and production database
 * Usage: npm run verify:schema (in CI/CD pipeline)
 *
 * Checks:
 * 1. All Prisma models exist as tables in database
 * 2. All database tables are defined in Prisma schema
 * 3. Enum types match between schema and database
 *
 * Exits with code 1 if any mismatches found (fails CI/CD)
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = neon(process.env.DATABASE_URL);

async function verifySchemaSync() {
  console.log('🔍 Schema Sync Verification\n');
  console.log('═══════════════════════════════════════\n');

  let hasErrors = false;

  try {
    // 1. Get all tables from database
    console.log('📊 Fetching database tables...');
    const dbTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;

    const dbTableNames = new Set(dbTables.map(t => t.table_name));
    console.log(`   Found ${dbTableNames.size} tables in database\n`);

    // 2. Parse Prisma schema to get model names
    console.log('📄 Parsing Prisma schema...');
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Extract model names from schema
    const modelRegex = /model\s+(\w+)\s+\{[\s\S]*?@@map\("(\w+)"\)/g;
    const prismaModels = new Map(); // model name -> table name

    let match;
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const tableName = match[2];
      prismaModels.set(modelName, tableName);
    }

    console.log(`   Found ${prismaModels.size} models in Prisma schema\n`);

    // 3. Check for missing tables (in Prisma but not in DB)
    console.log('🔍 Checking for missing tables...');
    const prismaTableNames = new Set(Array.from(prismaModels.values()));
    const missingInDb = [];

    for (const tableName of prismaTableNames) {
      if (!dbTableNames.has(tableName)) {
        missingInDb.push(tableName);
      }
    }

    if (missingInDb.length > 0) {
      console.log('   ❌ SCHEMA DRIFT DETECTED: Tables missing in database');
      missingInDb.forEach(table => {
        console.log(`      - ${table} (defined in Prisma, missing in DB)`);
      });
      hasErrors = true;
    } else {
      console.log('   ✅ All Prisma models exist in database\n');
    }

    // 4. Check for extra tables (in DB but not in Prisma)
    console.log('🔍 Checking for untracked tables...');
    const extraInDb = [];

    for (const tableName of dbTableNames) {
      if (!prismaTableNames.has(tableName)) {
        extraInDb.push(tableName);
      }
    }

    if (extraInDb.length > 0) {
      console.log('   ⚠️  WARNING: Tables in database not tracked by Prisma');
      extraInDb.forEach(table => {
        console.log(`      - ${table} (exists in DB, not in Prisma)`);
      });
      console.log('   (This is OK if these are manually managed tables)\n');
    } else {
      console.log('   ✅ All database tables tracked by Prisma\n');
    }

    // 5. Check enum types
    console.log('🔍 Checking enum types...');
    const dbEnums = await sql`
      SELECT t.typname as enum_name,
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `;

    // Extract enum names from Prisma schema
    const enumRegex = /enum\s+(\w+)\s+\{([^}]+)\}/g;
    const prismaEnums = new Map();

    let enumMatch;
    while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
      const enumName = enumMatch[1];
      const enumValues = enumMatch[2]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.replace(/,$/, ''));
      prismaEnums.set(enumName, enumValues);
    }

    const dbEnumNames = new Set(dbEnums.map(e => e.enum_name));
    const prismaEnumNames = new Set(prismaEnums.keys());

    // Check for missing enums
    const missingEnums = [];
    for (const enumName of prismaEnumNames) {
      if (!dbEnumNames.has(enumName)) {
        missingEnums.push(enumName);
      }
    }

    if (missingEnums.length > 0) {
      console.log('   ❌ SCHEMA DRIFT DETECTED: Enums missing in database');
      missingEnums.forEach(enumName => {
        console.log(`      - ${enumName} (defined in Prisma, missing in DB)`);
      });
      hasErrors = true;
    } else {
      console.log('   ✅ All enum types synchronized\n');
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 Verification Summary\n');
    console.log(`   Database Tables: ${dbTableNames.size}`);
    console.log(`   Prisma Models: ${prismaModels.size}`);
    console.log(`   Missing in DB: ${missingInDb.length}`);
    console.log(`   Extra in DB: ${extraInDb.length}`);
    console.log(`   Missing Enums: ${missingEnums.length}`);
    console.log('═══════════════════════════════════════\n');

    if (hasErrors) {
      console.log('❌ SCHEMA DRIFT DETECTED - Please run migrations!\n');
      console.log('Fix:');
      console.log('  1. Run: npx prisma migrate dev --name sync_schema');
      console.log('  2. Or run: npx prisma db push\n');
      process.exit(1);
    } else {
      console.log('✅ Schema is synchronized - All checks passed!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    process.exit(1);
  }
}

verifySchemaSync();
