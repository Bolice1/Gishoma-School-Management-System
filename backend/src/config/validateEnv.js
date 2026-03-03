/**
 * Environment Variable Validation
 * Runs at startup to ensure all required security configurations are present
 */

function validateEnv() {
  const required = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
    'NODE_ENV',
  ];

  const optional = [
    'ENCRYPTION_KEY',
    'DB_SSL',
    'BCRYPT_ROUNDS',
    'MAX_LOGIN_ATTEMPTS',
    'LOCKOUT_DURATION_MINUTES',
    'LOG_DIR',
  ];

  // Check required variables
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('🚨 FATAL: Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Validate JWT secret lengths
  const jwtAccessLength = (process.env.JWT_ACCESS_SECRET || '').length;
  const jwtRefreshLength = (process.env.JWT_REFRESH_SECRET || '').length;

  if (jwtAccessLength < 64) {
    console.error('🚨 FATAL: JWT_ACCESS_SECRET must be at least 64 characters. Current length:', jwtAccessLength);
    process.exit(1);
  }
  if (jwtRefreshLength < 64) {
    console.error('🚨 FATAL: JWT_REFRESH_SECRET must be at least 64 characters. Current length:', jwtRefreshLength);
    process.exit(1);
  }

  // Check bcrypt rounds
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  if (bcryptRounds < 12) {
    console.warn('⚠️  WARNING: BCRYPT_ROUNDS should be >= 12. Current:', bcryptRounds);
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    const weakPasswords = ['12345', 'password', 'root', 'admin', 'test', '1234', 'postgres'];
    if (weakPasswords.includes(process.env.DB_PASSWORD)) {
      console.error('🚨 FATAL: Weak database password in production! Change DB_PASSWORD immediately.');
      process.exit(1);
    }

    if (!process.env.DB_SSL || process.env.DB_SSL !== 'true') {
      console.warn('⚠️  WARNING: Database SSL not enabled in production. Set DB_SSL=true');
    }

    if (!process.env.ENCRYPTION_KEY) {
      console.warn('⚠️  WARNING: ENCRYPTION_KEY not set. Student data will not be encrypted at rest.');
    }
  }

  console.log('✅ Environment validation passed');
}

module.exports = validateEnv;
