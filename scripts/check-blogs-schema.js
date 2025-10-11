import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'blogs'
  ORDER BY ordinal_position
`;

console.log('=== blogs 테이블 스키마 ===\n');
result.forEach(col => {
  console.log(`${col.column_name}: ${col.data_type}`);
});
