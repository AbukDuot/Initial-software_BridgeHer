import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${q.toLowerCase()}%`;
    
    // Search courses
    const courseQuery = `
      SELECT id, title, category, 'course' as type
      FROM courses 
      WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1
      LIMIT 5
    `;
    
    // Search instructors
    const instructorQuery = `
      SELECT DISTINCT u.id, u.name as title, u.expertise as category, 'instructor' as type
      FROM users u
      JOIN courses c ON c.instructor_id = u.id
      WHERE LOWER(u.name) LIKE $1 OR LOWER(u.expertise) LIKE $1
      LIMIT 3
    `;
    
    // Search categories
    const categoryQuery = `
      SELECT DISTINCT category as title, category, 'category' as type, 0 as id
      FROM courses 
      WHERE LOWER(category) LIKE $1
      LIMIT 3
    `;

    const [courseResults, instructorResults, categoryResults] = await Promise.all([
      pool.query(courseQuery, [searchTerm]),
      pool.query(instructorQuery, [searchTerm]),
      pool.query(categoryQuery, [searchTerm])
    ]);

    const suggestions = [
      ...courseResults.rows,
      ...instructorResults.rows,
      ...categoryResults.rows
    ].slice(0, 8);

    res.json(suggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Advanced search endpoint
router.get('/advanced', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      level, 
      duration_min, 
      duration_max, 
      rating_min,
      sort_by = 'relevance'
    } = req.query;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (q) {
      paramCount++;
      whereConditions.push(`(LOWER(title) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`);
      params.push(`%${q.toLowerCase()}%`);
    }

    if (category && category !== 'All') {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      params.push(category);
    }

    if (level && level !== 'All') {
      paramCount++;
      whereConditions.push(`level = $${paramCount}`);
      params.push(level);
    }

    if (rating_min) {
      paramCount++;
      whereConditions.push(`average_rating >= $${paramCount}`);
      params.push(parseFloat(rating_min));
    }

    let orderBy = 'created_at DESC';
    if (sort_by === 'rating') {
      orderBy = 'average_rating DESC NULLS LAST';
    } else if (sort_by === 'title') {
      orderBy = 'title ASC';
    } else if (sort_by === 'newest') {
      orderBy = 'created_at DESC';
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const query = `
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT 50
    `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;