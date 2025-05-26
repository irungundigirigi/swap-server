import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const {Pool} = pg;

console.log('Connecting with:', process.env.DATABASE_URL);

const pool = new Pool({ connectionString: process.env.DATABASE_URL,   idleTimeoutMillis: 30000,
    keepAlive: true });

export default pool;
