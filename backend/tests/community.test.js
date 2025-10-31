import pool from '../config/db.js';

describe('Community Forum Database', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should have community_topics table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'community_topics'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have topic_replies table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'topic_replies'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have topic_likes table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'topic_likes'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('should have reply_likes table', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reply_likes'
    `);
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
