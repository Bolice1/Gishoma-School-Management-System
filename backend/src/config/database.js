const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'Gishoma',
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  multipleStatements: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
  connectionAttributes: {
    _client_name: 'gishoma-backend',
  },
});

// Validate pool connection on startup
pool.on('error', (err) => {
  console.error('Database pool error:', err.code || err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('FATAL: Database connection lost. Exiting.');
    process.exit(1);
  }
});

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    // Log error safely without exposing sensitive data
    console.error('Query error:', {
      code: err.code,
      message: err.message,
      sqlLength: sql.length,
    });
    throw err;
  }
}

async function getConnection() {
  return pool.getConnection();
}

module.exports = { pool, query, getConnection };
