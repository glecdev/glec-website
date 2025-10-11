import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });
const sql = neon(process.env.DATABASE_URL);

const users = await sql`SELECT id, email, role FROM users LIMIT 5`;
console.log(JSON.stringify(users, null, 2));
