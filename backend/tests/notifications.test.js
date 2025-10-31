import pool from '../config/db.js';

describe('Notification System', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should have notifications table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'notifications'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have correct notification columns', async () => {
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'notifications'
    `);
    const columns = result.rows.map(row => row.column_name);
    expect(columns).toContain('sent_via_email');
    expect(columns).toContain('sent_via_sms');
  });
});
