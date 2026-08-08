const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = requiredEnv.filter((k) => !process.env[k]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")} (or set DATABASE_URL)`
        );
    }
}

const isLocalHost = (host) =>
    !host || host === "localhost" || host === "127.0.0.1" || host === "::1";

const pool = new Pool(
    connectionString
        ? {
              connectionString,
              ssl: isLocalHost(new URL(connectionString).hostname)
                  ? undefined
                  : { rejectUnauthorized: false },
          }
        : {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              ssl: isLocalHost(process.env.DB_HOST)
                  ? undefined
                  : { rejectUnauthorized: false },
          }
);

module.exports = pool;