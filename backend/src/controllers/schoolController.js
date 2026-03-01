const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let where = '';
    const params = [];
    if (isActive !== undefined) {
      where = 'WHERE is_active = ?';
      params.push(isActive === 'true');
    }

    const countRows = await query(
      `SELECT COUNT(*) as total FROM schools ${where}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const schools = await query(
      `SELECT * FROM schools ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({ schools, total });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM schools WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'School not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, phone, address, region, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;
    const id = uuidv4();
    let slug = slugify(name);
    const existing = await query('SELECT id FROM schools WHERE slug = ?', [slug]);
    if (existing.length) slug = `${slug}-${Date.now()}`;

    await query(
      `INSERT INTO schools (id, name, slug, email, phone, address, region) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, email, phone || null, address || null, region || null]
    );

    if (adminEmail && adminPassword && adminFirstName && adminLastName) {
      const userId = uuidv4();
      const hash = await authService.hashPassword(adminPassword);
      await query(
        `INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, 'school_admin')`,
        [userId, id, adminEmail, hash, adminFirstName, adminLastName]
      );
    }

    const school = await query('SELECT * FROM schools WHERE id = ?', [id]);
    res.status(201).json(school[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowed = ['name', 'email', 'phone', 'address', 'region', 'is_active', 'subscription_tier', 'subscription_expires_at'];
    const set = [];
    const vals = [];
    for (const k of allowed) {
      if (updates[k] !== undefined) {
        set.push(`${k} = ?`);
        vals.push(updates[k]);
      }
    }
    if (set.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    vals.push(id);
    await query(`UPDATE schools SET ${set.join(', ')} WHERE id = ?`, vals);
    const rows = await query('SELECT * FROM schools WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };
