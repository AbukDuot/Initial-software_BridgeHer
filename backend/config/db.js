import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log(" Connected to PostgreSQL"))
  .catch(err => {
    console.error("Database connection error:", err.message);
    console.error("DATABASE_URL configured:", process.env.DATABASE_URL ? 'Yes' : 'No');
  });

export default pool;
