require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'Gishoma',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
};

async function init() {
  let conn;
  try {
    conn = await mysql.createConnection({
      ...config,
      database: undefined,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await conn.query(`USE \`${config.database}\``);

    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      if (stmt) await conn.query(stmt);
    }
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Init failed:', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

init();
