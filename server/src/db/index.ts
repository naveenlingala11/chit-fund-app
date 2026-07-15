import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent/current dir .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = () => {
  return pool.connect();
};

export default pool;
