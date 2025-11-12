import bcrypt from 'bcryptjs';
import pool from './config/db.js';

const resetPasswords = async () => {
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await pool.query(
    `UPDATE users SET password = $1 WHERE email IN ('aguilsolomaajang@gmail.com', 'mayenduot2@gmail.com')`,
    [hashedPassword]
  );
  
  console.log('✅ Passwords reset to: 123456');
  process.exit(0);
};

resetPasswords();
