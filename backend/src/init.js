import { pool } from './db.js';
import bcrypt from 'bcryptjs';

export async function initDatabase() {
  console.log('▶ Initializing database...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      telegram VARCHAR(255),
      avatar TEXT,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS topics (
      id SERIAL PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      name VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      mode VARCHAR(20) DEFAULT 'auto',
      question_ids INTEGER[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS interims (
      id SERIAL PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      mode VARCHAR(20) DEFAULT 'auto',
      question_ids INTEGER[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS vazifalar (
      id SERIAL PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      name VARCHAR(500) NOT NULL,
      mode VARCHAR(20) DEFAULT 'topics',
      topic_ids INTEGER[] DEFAULT '{}',
      question_ids INTEGER[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      text_kr TEXT,
      options JSONB NOT NULL,
      options_kr JSONB,
      correct_answer VARCHAR(10) NOT NULL,
      image TEXT,
      explanation TEXT,
      explanation_kr TEXT,
      topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mistakes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      number INTEGER UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS premium (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS premium_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user_name VARCHAR(255),
      user_phone VARCHAR(20),
      amount VARCHAR(50),
      plan_label VARCHAR(50),
      receipt TEXT,
      comment TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS read_notifications (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
      read_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_id, notification_id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      new_password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT
    );
  `);

  // Default admin
  const adminPhone = '+998916850336';
  const adminPass = '916850336';
  const { rows: existAdmin } = await pool.query('SELECT id FROM users WHERE phone = $1', [adminPhone]);
  if (existAdmin.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    await pool.query(
      'INSERT INTO users (phone, password_hash, name, role) VALUES ($1, $2, $3, $4)',
      [adminPhone, hash, 'Admin', 'admin']
    );
    console.log('✓ Default admin created:', adminPhone);
  }

  // Default settings
  const defaultSettings = [
    ['app_name', 'PlusAvto.Uz'],
    ['qa_group_link', 'https://t.me/plusavtouz'],
    ['admin_telegram', 'https://t.me/plusavtouz_admin'],
    ['card_number', '9860 1266 7183 6719'],
    ['card_owner', 'Valiyev Kamron'],
    ['price_week', '15000'],
    ['price_month', '49000'],
    ['price_year', '350000'],
  ];
  for (const [key, value] of defaultSettings) {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, value]
    );
  }

  console.log('✓ Database initialized');
}
