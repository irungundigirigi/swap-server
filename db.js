import pg from 'pg';
const {Pool} = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL,   idleTimeoutMillis: 30000,
    keepAlive: true });

export default pool;
