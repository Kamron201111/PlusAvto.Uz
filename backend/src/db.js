import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Railway DATABASE_URL ni avtomatik beradi
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

// Health check
export async function testConnection() {
  try {
    const r = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', r.rows[0].now);
    return true;
  } catch (e) {
    console.error('✗ Database connection failed:', e.message);
    return false;
  }
}
