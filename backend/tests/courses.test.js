import pool from '../config/db.js';

describe('Course Database Operations', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should connect to database', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
  });

  it('should have courses table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'courses'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have modules table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'modules'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have enrollments table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'enrollments'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
