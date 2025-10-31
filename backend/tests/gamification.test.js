import pool from '../config/db.js';

describe('Gamification System', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should have user_points table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_points'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have badges table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'badges'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have certificates table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'certificates'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
