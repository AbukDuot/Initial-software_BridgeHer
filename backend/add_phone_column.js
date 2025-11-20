import pool from './config/db.js';

const addPhoneColumn = async () => {
  try {
    console.log('Adding phone column to users table...');
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);
    
    console.log('✅ Phone column added successfully');
    
    // Verify
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: phone column exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addPhoneColumn();
