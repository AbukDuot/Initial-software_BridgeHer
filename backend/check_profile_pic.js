import pool from './config/db.js';

const checkProfilePic = async () => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, profile_pic 
      FROM users 
      ORDER BY id;
    `);
    
    console.log('\n=== Users Profile Pictures ===');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email}`);
      console.log(`Profile Pic: ${user.profile_pic || 'NULL'}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkProfilePic();
