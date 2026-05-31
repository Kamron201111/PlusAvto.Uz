import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool, testConnection } from './db.js';
import { initDatabase } from './init.js';
import { generateToken, authRequired, adminRequired } from './auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// ========== AUTH ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;
    if (!phone || !password || !name) return res.status(400).json({ error: 'Maydonlar to\'liq emas' });
    if (!/^\+998\d{9}$/.test(phone)) return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });

    const { rows: exists } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (exists.length) return res.status(400).json({ error: 'Bu telefon bilan foydalanuvchi mavjud' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (phone, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [phone, hash, name]
    );
    const u = rows[0];
    delete u.password_hash;
    const token = generateToken(u);
    res.json({ user: u, token });
  } catch (e) {
    console.error('register error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (rows.length === 0) return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' });

    delete u.password_hash;
    const token = generateToken(u);
    res.json({ user: u, token });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

// Parol tiklash - telefon + yangi parol, hech kim tasdiqlamasdan
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !newPassword) return res.status(400).json({ error: 'Maydonlar to\'liq emas' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Parol kamida 4 belgi' });

    const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bu telefon bilan foydalanuvchi topilmadi' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE phone = $2', [hash, phone]);
    res.json({ ok: true, message: 'Parol o\'zgartirildi' });
  } catch (e) {
    console.error('reset error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT id, phone, name, email, telegram, avatar, role, created_at FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ user: rows[0] });
});

app.put('/api/auth/profile', authRequired, async (req, res) => {
  try {
    const { name, email, telegram, avatar } = req.body;
    await pool.query(
      'UPDATE users SET name = $1, email = $2, telegram = $3, avatar = $4 WHERE id = $5',
      [name, email || null, telegram || null, avatar || null, req.user.id]
    );
    const { rows } = await pool.query('SELECT id, phone, name, email, telegram, avatar, role FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: rows[0] });
  } catch (e) {
    console.error('profile update error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.put('/api/auth/change-password', authRequired, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Maydonlar to\'liq emas' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Yangi parol kamida 4 belgi' });

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const ok = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Eski parol noto\'g\'ri' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('change password error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

// Telefon raqamni o'zgartirish - parolni tasdiqlash bilan
app.put('/api/auth/change-phone', authRequired, async (req, res) => {
  try {
    const { password, newPhone } = req.body;
    if (!password || !newPhone) return res.status(400).json({ error: 'Maydonlar to\'liq emas' });
    if (!/^\+998\d{9}$/.test(newPhone)) return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });

    const { rows } = await pool.query('SELECT password_hash, phone FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Parol noto\'g\'ri' });

    if (rows[0].phone === newPhone) return res.status(400).json({ error: 'Yangi raqam eskisi bilan bir xil' });

    // Boshqa user bunday raqam bilan mavjudligini tekshirish
    const { rows: exists } = await pool.query('SELECT id FROM users WHERE phone = $1 AND id != $2', [newPhone, req.user.id]);
    if (exists.length) return res.status(400).json({ error: 'Bu telefon raqam allaqachon band' });

    await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [newPhone, req.user.id]);

    // Yangilangan user va yangi token
    const { rows: updated } = await pool.query('SELECT id, phone, name, email, telegram, avatar, role FROM users WHERE id = $1', [req.user.id]);
    const newToken = generateToken(updated[0]);
    res.json({ ok: true, user: updated[0], token: newToken });
  } catch (e) {
    console.error('change phone error:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

// ========== TOPICS ==========
app.get('/api/topics', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM topics ORDER BY number');
  res.json(rows);
});

app.post('/api/topics', adminRequired, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom kerak' });
    const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM topics');
    const num = maxRow[0].next;
    const { rows } = await pool.query(
      'INSERT INTO topics (number, name) VALUES ($1, $2) RETURNING *',
      [num, name]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('add topic:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.put('/api/topics/:id', adminRequired, async (req, res) => {
  const { name, number } = req.body;
  await pool.query('UPDATE topics SET name = $1, number = $2 WHERE id = $3', [name, number, req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/topics/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM topics WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== TICKETS ==========
app.get('/api/tickets', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tickets ORDER BY number');
  res.json(rows);
});

app.post('/api/tickets', adminRequired, async (req, res) => {
  const { mode, question_ids } = req.body;
  const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM tickets');
  const num = maxRow[0].next;
  const { rows } = await pool.query(
    'INSERT INTO tickets (number, name, mode, question_ids) VALUES ($1, $2, $3, $4) RETURNING *',
    [num, `Bilet ${num}`, mode || 'auto', question_ids || []]
  );
  res.json(rows[0]);
});

app.put('/api/tickets/:id', adminRequired, async (req, res) => {
  const { name, number, mode, question_ids } = req.body;
  await pool.query(
    'UPDATE tickets SET name = $1, number = $2, mode = $3, question_ids = $4 WHERE id = $5',
    [name, number, mode, question_ids || [], req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/tickets/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== INTERIMS ==========
app.get('/api/interims', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM interims ORDER BY number');
  res.json(rows);
});

app.post('/api/interims', adminRequired, async (req, res) => {
  const { name, mode, question_ids } = req.body;
  const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM interims');
  const num = maxRow[0].next;
  const { rows } = await pool.query(
    'INSERT INTO interims (number, name, mode, question_ids) VALUES ($1, $2, $3, $4) RETURNING *',
    [num, name || `Oraliq nazorat ${num}`, mode || 'auto', question_ids || []]
  );
  res.json(rows[0]);
});

app.put('/api/interims/:id', adminRequired, async (req, res) => {
  const { name, number, mode, question_ids } = req.body;
  await pool.query(
    'UPDATE interims SET name = $1, number = $2, mode = $3, question_ids = $4 WHERE id = $5',
    [name, number, mode, question_ids || [], req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/interims/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM interims WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== VAZIFALAR ==========
app.get('/api/vazifalar', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM vazifalar ORDER BY number');
  res.json(rows);
});

app.post('/api/vazifalar', adminRequired, async (req, res) => {
  const { name, mode, topic_ids, question_ids, ticket_ids } = req.body;
  const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM vazifalar');
  const num = maxRow[0].next;
  const { rows } = await pool.query(
    'INSERT INTO vazifalar (number, name, mode, topic_ids, question_ids, ticket_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [num, name || `Vazifa ${num}`, mode || 'topics', topic_ids || [], question_ids || [], ticket_ids || []]
  );
  res.json(rows[0]);
});

app.put('/api/vazifalar/:id', adminRequired, async (req, res) => {
  const { name, number, mode, topic_ids, question_ids, ticket_ids } = req.body;
  await pool.query(
    'UPDATE vazifalar SET name = $1, number = $2, mode = $3, topic_ids = $4, question_ids = $5, ticket_ids = $6 WHERE id = $7',
    [name, number, mode, topic_ids || [], question_ids || [], ticket_ids || [], req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/vazifalar/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM vazifalar WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Vazifa savollarini olish (mavzulardan, biletdan yoki qo'lda tanlangan)
app.get('/api/vazifalar/:id/questions', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM vazifalar WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const v = rows[0];

  let questions;
  if (v.mode === 'manual' && v.question_ids && v.question_ids.length) {
    const { rows: qs } = await pool.query('SELECT * FROM questions WHERE id = ANY($1)', [v.question_ids]);
    questions = qs;
  } else if (v.mode === 'topics' && v.topic_ids && v.topic_ids.length) {
    const { rows: qs } = await pool.query('SELECT * FROM questions WHERE topic_id = ANY($1)', [v.topic_ids]);
    questions = qs;
  } else if (v.mode === 'tickets' && v.ticket_ids && v.ticket_ids.length) {
    // Tanlangan biletlarning hamma savollarini yig'amiz
    const { rows: tks } = await pool.query('SELECT * FROM tickets WHERE id = ANY($1)', [v.ticket_ids]);
    const allQIds = new Set();
    // Manual biletlardagi question_ids ni yig'amiz
    for (const tk of tks) {
      if (tk.mode === 'manual' && tk.question_ids && tk.question_ids.length) {
        tk.question_ids.forEach(id => allQIds.add(id));
      }
    }
    // Agar manual'lardan id chiqsa - faqat o'shalarni olamiz; bo'lmasa bo'sh
    // Auto biletlar bo'lsa - bazadagi hamma savol qo'shiladi (bilet o'zi tanlamagani uchun)
    const hasAuto = tks.some(t => t.mode === 'auto');
    if (hasAuto) {
      const { rows: allQs } = await pool.query('SELECT * FROM questions');
      questions = allQs;
    } else if (allQIds.size > 0) {
      const { rows: qs } = await pool.query('SELECT * FROM questions WHERE id = ANY($1)', [Array.from(allQIds)]);
      questions = qs;
    } else {
      questions = [];
    }
  } else {
    questions = [];
  }
  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  res.json(questions);
});

// ========== QUESTIONS ==========
app.get('/api/questions', authRequired, async (req, res) => {
  const { topic_id, ticket_id, interim_id } = req.query;
  let q = 'SELECT * FROM questions';
  let params = [];
  if (topic_id) {
    q += ' WHERE topic_id = $1';
    params.push(topic_id);
  }
  q += ' ORDER BY id ASC';
  const { rows } = await pool.query(q, params);

  // Ticket modes
  if (ticket_id) {
    const { rows: t } = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticket_id]);
    if (t.length === 0) return res.json([]);
    // Qo'lda tanlangan savollar - admin tanlagan tartibda (chalkashtirilmaydi)
    if (t[0].mode === 'manual' && t[0].question_ids?.length) {
      const ids = t[0].question_ids;
      const { rows: qs } = await pool.query('SELECT * FROM questions WHERE id = ANY($1)', [ids]);
      // Admin tanlagan tartibni saqlash
      const ordered = ids.map(id => qs.find(q => q.id === id)).filter(Boolean);
      return res.json(ordered);
    }
    // Auto - bazadagi hamma savol id tartibida (chalkashtirilmaydi)
    return res.json(rows);
  }
  if (interim_id) {
    const { rows: t } = await pool.query('SELECT * FROM interims WHERE id = $1', [interim_id]);
    if (t.length === 0) return res.json([]);
    // Qo'lda tanlangan savollar - admin tanlagan tartibda (chalkashtirilmaydi)
    if (t[0].mode === 'manual' && t[0].question_ids?.length) {
      const ids = t[0].question_ids;
      const { rows: qs } = await pool.query('SELECT * FROM questions WHERE id = ANY($1)', [ids]);
      const ordered = ids.map(id => qs.find(q => q.id === id)).filter(Boolean);
      return res.json(ordered);
    }
    // Auto - bazadagi hamma savol id tartibida (chalkashtirilmaydi)
    return res.json(rows);
  }

  res.json(rows);
});

app.get('/api/questions/random', authRequired, async (req, res) => {
  const count = parseInt(req.query.count) || 20;
  const { rows } = await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT $1', [count]);
  res.json(rows);
});

app.post('/api/questions', adminRequired, async (req, res) => {
  try {
    const { text, options, correct_answer, image, explanation, topic_id, text_kr, options_kr, explanation_kr } = req.body;
    if (!text || !options || !correct_answer) return res.status(400).json({ error: 'Maydonlar to\'liq emas' });

    const { rows } = await pool.query(
      `INSERT INTO questions (text, text_kr, options, options_kr, correct_answer, image, explanation, explanation_kr, topic_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [text, text_kr || null, JSON.stringify(options), options_kr ? JSON.stringify(options_kr) : null,
       correct_answer, image || null, explanation || null, explanation_kr || null, topic_id || null]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('add question:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.post('/api/questions/bulk', adminRequired, async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'Massiv kerak' });
    let count = 0;
    for (const q of questions) {
      if (!q.text || !q.options || !q.correct_answer) continue;
      await pool.query(
        `INSERT INTO questions (text, text_kr, options, options_kr, correct_answer, image, explanation, explanation_kr, topic_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [q.text, q.text_kr || null, JSON.stringify(q.options), q.options_kr ? JSON.stringify(q.options_kr) : null,
         q.correct_answer, q.image || null, q.explanation || null, q.explanation_kr || null, q.topic_id || null]
      );
      count++;
    }
    res.json({ ok: true, count });
  } catch (e) {
    console.error('bulk:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.put('/api/questions/:id', adminRequired, async (req, res) => {
  const { text, options, correct_answer, image, explanation, topic_id, text_kr, options_kr, explanation_kr } = req.body;
  await pool.query(
    `UPDATE questions SET text=$1, text_kr=$2, options=$3, options_kr=$4, correct_answer=$5, image=$6, explanation=$7, explanation_kr=$8, topic_id=$9
     WHERE id=$10`,
    [text, text_kr || null, JSON.stringify(options), options_kr ? JSON.stringify(options_kr) : null,
     correct_answer, image || null, explanation || null, explanation_kr || null, topic_id || null, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/questions/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== MISTAKES ==========
app.get('/api/mistakes', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT q.* FROM mistakes m JOIN questions q ON m.question_id = q.id WHERE m.user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

app.post('/api/mistakes', authRequired, async (req, res) => {
  const { question_id } = req.body;
  await pool.query(
    'INSERT INTO mistakes (user_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, question_id]
  );
  res.json({ ok: true });
});

app.delete('/api/mistakes/:question_id', authRequired, async (req, res) => {
  await pool.query('DELETE FROM mistakes WHERE user_id = $1 AND question_id = $2', [req.user.id, req.params.question_id]);
  res.json({ ok: true });
});

// ========== FAVORITES ==========
app.get('/api/favorites', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT q.* FROM favorites f JOIN questions q ON f.question_id = q.id WHERE f.user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

app.post('/api/favorites/toggle', authRequired, async (req, res) => {
  const { question_id } = req.body;
  const { rows } = await pool.query(
    'SELECT id FROM favorites WHERE user_id = $1 AND question_id = $2',
    [req.user.id, question_id]
  );
  if (rows.length) {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND question_id = $2', [req.user.id, question_id]);
    res.json({ favorited: false });
  } else {
    await pool.query('INSERT INTO favorites (user_id, question_id) VALUES ($1, $2)', [req.user.id, question_id]);
    res.json({ favorited: true });
  }
});

// ========== COURSES ==========
app.get('/api/courses', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM courses ORDER BY number');
  res.json(rows);
});

app.post('/api/courses', adminRequired, async (req, res) => {
  const { title, description, video_url } = req.body;
  const { rows: maxRow } = await pool.query('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM courses');
  const num = maxRow[0].next;
  const { rows } = await pool.query(
    'INSERT INTO courses (number, title, description, video_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [num, title, description || null, video_url]
  );
  res.json(rows[0]);
});

app.put('/api/courses/:id', adminRequired, async (req, res) => {
  const { title, description, video_url, number } = req.body;
  await pool.query(
    'UPDATE courses SET title = $1, description = $2, video_url = $3, number = $4 WHERE id = $5',
    [title, description, video_url, number, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/courses/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== PREMIUM ==========
app.get('/api/premium/status', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM premium WHERE user_id = $1', [req.user.id]);
  if (rows.length === 0) return res.json({ active: false });
  const p = rows[0];
  const active = new Date(p.expires_at) > new Date();
  res.json({ active, expires_at: p.expires_at });
});

app.post('/api/premium/request', authRequired, async (req, res) => {
  try {
    const { amount, plan_label, receipt, comment } = req.body;
    const { rows: u } = await pool.query('SELECT name, phone FROM users WHERE id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `INSERT INTO premium_requests (user_id, user_name, user_phone, amount, plan_label, receipt, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, u[0].name, u[0].phone, amount, plan_label, receipt || null, comment || null]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('premium request:', e);
    res.status(500).json({ error: 'Server xato' });
  }
});

app.get('/api/premium/requests', adminRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM premium_requests ORDER BY created_at DESC');
  res.json(rows);
});

app.put('/api/premium/requests/:id/approve', adminRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM premium_requests WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const r = rows[0];
  let days = 30;
  if (r.plan_label?.toLowerCase().includes('hafta') || r.plan_label?.includes('Ҳафта')) days = 7;
  else if (r.plan_label?.toLowerCase().includes('yil') || r.plan_label?.includes('Йил')) days = 365;
  const exp = new Date(Date.now() + days * 86400000).toISOString();
  await pool.query(
    `INSERT INTO premium (user_id, expires_at) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET expires_at = $2`,
    [r.user_id, exp]
  );
  await pool.query('UPDATE premium_requests SET status = $1 WHERE id = $2', ['approved', req.params.id]);
  res.json({ ok: true });
});

app.put('/api/premium/requests/:id/reject', adminRequired, async (req, res) => {
  await pool.query('UPDATE premium_requests SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/premium/requests/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM premium_requests WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/premium/grant', adminRequired, async (req, res) => {
  const { user_id, days } = req.body;
  const exp = new Date(Date.now() + (days || 30) * 86400000).toISOString();
  await pool.query(
    `INSERT INTO premium (user_id, expires_at) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET expires_at = $2`,
    [user_id, exp]
  );
  res.json({ ok: true });
});

app.post('/api/premium/revoke', adminRequired, async (req, res) => {
  const { user_id } = req.body;
  await pool.query('DELETE FROM premium WHERE user_id = $1', [user_id]);
  res.json({ ok: true });
});

// ========== USERS (admin) ==========
app.get('/api/users', adminRequired, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.phone, u.name, u.email, u.telegram, u.avatar, u.role, u.created_at,
           p.expires_at AS premium_expires_at
    FROM users u
    LEFT JOIN premium p ON u.id = p.user_id
    ORDER BY u.created_at DESC
  `);
  res.json(rows);
});

app.delete('/api/users/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1 AND role != $2', [req.params.id, 'admin']);
  res.json({ ok: true });
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/api/notifications/unread-count', authRequired, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT COUNT(*) AS cnt FROM notifications n
    WHERE NOT EXISTS (
      SELECT 1 FROM read_notifications r WHERE r.notification_id = n.id AND r.user_id = $1
    )
  `, [req.user.id]);
  res.json({ count: parseInt(rows[0].cnt) });
});

app.post('/api/notifications/mark-read', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM notifications');
  for (const r of rows) {
    await pool.query(
      'INSERT INTO read_notifications (user_id, notification_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, r.id]
    );
  }
  res.json({ ok: true });
});

app.post('/api/notifications', adminRequired, async (req, res) => {
  const { title, message } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO notifications (title, message) VALUES ($1, $2) RETURNING *',
    [title, message]
  );
  res.json(rows[0]);
});

app.delete('/api/notifications/:id', adminRequired, async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ========== SETTINGS ==========
app.get('/api/settings', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM settings');
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});

app.put('/api/settings', adminRequired, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [key, value]
    );
  }
  res.json({ ok: true });
});

// ========== START ==========
const PORT = process.env.PORT || 3001;

(async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot start without database');
    process.exit(1);
  }
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
  });
})();
