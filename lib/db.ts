import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// During build time, DATABASE_URL might not be available
// This is fine since we're just building the code, not running it
const connectionString = process.env.DATABASE_URL || 'postgresql://user:pass@localhost/db';

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
