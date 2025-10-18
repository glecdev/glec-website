import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const articles = await sql\;

console.log('Total articles:', articles.length);
articles.forEach((a, i) => console.log(\));
