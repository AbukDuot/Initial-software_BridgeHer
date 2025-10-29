import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Harobed2023@localhost:5432/bridgeherdb'
});

async function insertArabic() {
  try {
    await pool.query(`UPDATE users SET expertise_ar = $1 WHERE name LIKE '%Priscilla%' AND role = 'Mentor'`, ['ريادة الأعمال، المهارات الرقمية']);
    await pool.query(`UPDATE users SET expertise_ar = $1 WHERE name LIKE '%Aguil%' AND role = 'Mentor'`, ['التمويل، تخطيط الأعمال']);
    await pool.query(`UPDATE users SET expertise_ar = $1 WHERE name LIKE '%Kuir%' AND role = 'Mentor'`, ['مسيرة مهنية في التكنولوجيا']);
    await pool.query(`UPDATE users SET expertise_ar = $1 WHERE name LIKE '%Abraham%' AND role = 'Mentor'`, ['كتابة السيرة الذاتية، التحضير للمقابلات']);
    
    const result = await pool.query(`SELECT name, expertise_ar FROM users WHERE role = 'Mentor'`);
    console.log(' Arabic inserted successfully:');
    console.log(result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

insertArabic();
