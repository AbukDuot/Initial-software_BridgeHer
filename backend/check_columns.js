import pool from './config/db.js';

const checkColumns = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== Users Table Columns ===');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    const hasPhone = result.rows.some(row => row.column_name === 'phone');
    const hasBio = result.rows.some(row => row.column_name === 'bio');
    const hasLocation = result.rows.some(row => row.column_name === 'location');
    
    console.log('\n=== Missing Columns ===');
    if (!hasPhone) console.log('❌ phone column is MISSING');
    if (!hasBio) console.log('❌ bio column is MISSING');
    if (!hasLocation) console.log('❌ location column is MISSING');
    
    if (hasPhone && hasBio && hasLocation) {
      console.log('✅ All profile columns exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkColumns();
