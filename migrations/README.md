# Database Migrations

This directory contains SQL migration files for the GLEC website database.

## Migration Naming Convention

```
<number>_<description>.sql
```

Example: `002_create_demo_requests_table.sql`

## How to Run Migrations

### Using Neon SQL Editor (Recommended)

1. Go to https://console.neon.tech
2. Select your project
3. Open SQL Editor
4. Copy and paste the migration SQL
5. Execute

### Using `psql` CLI

```bash
psql $DATABASE_URL -f migrations/002_create_demo_requests_table.sql
```

### Using Node.js Script

```javascript
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);
const migration = fs.readFileSync('./migrations/002_create_demo_requests_table.sql', 'utf-8');

await sql(migration);
console.log('Migration applied successfully');
```

## Migration List

| # | File | Description | Date |
|---|------|-------------|------|
| 001 | `001_initial_schema.sql` | Initial schema (users, notices, contacts, etc.) | 2025-10-01 |
| 002 | `002_create_demo_requests_table.sql` | Demo requests table | 2025-10-03 |

## Rollback

Each migration should include a corresponding rollback script if needed.

Example:
```sql
-- Rollback for 002_create_demo_requests_table.sql
DROP TRIGGER IF EXISTS trigger_demo_requests_updated_at ON demo_requests;
DROP FUNCTION IF EXISTS update_demo_requests_updated_at();
DROP TABLE IF EXISTS demo_requests;
```

## Best Practices

1. **Never modify existing migrations** - Create a new migration instead
2. **Test migrations locally first** - Use a development database
3. **Include rollback scripts** - For easy reverting if needed
4. **Use transactions** - Wrap migrations in BEGIN/COMMIT if possible
5. **Document changes** - Add comments explaining complex logic
