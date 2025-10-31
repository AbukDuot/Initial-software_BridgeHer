import pool from '../config/db.js';

describe('Offline Storage System', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should have offline_content table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'offline_content'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have video_files table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'video_files'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have module_progress table for tracking', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'module_progress'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
