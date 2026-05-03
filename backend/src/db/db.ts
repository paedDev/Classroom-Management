import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js'
if (!process.env.DATABASE_URL) {
  throw new Error("Database URL is required");
}
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql,{schema});