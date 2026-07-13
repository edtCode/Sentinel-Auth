const { Pool } = require('pg');

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
    );
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports = pool;
