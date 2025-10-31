import express from 'express';
import pool from '../config/db.js';
import { sendNotificationEmail, sendSMS } from '../services/notificationService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, title, message, type, sendEmail, sendSms } = req.body;
    
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, sent_via_email, sent_via_sms) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title, message, type || 'info', sendEmail || false, sendSms || false]
    );

    if (sendEmail) {
      const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [user_id]);
      if (userResult.rows[0]) {
        await sendNotificationEmail(userResult.rows[0].email, title, message);
      }
    }

    if (sendSms) {
      const userResult = await pool.query('SELECT phone FROM users WHERE id = $1', [user_id]);
      if (userResult.rows[0]?.phone) {
        await sendSMS(userResult.rows[0].phone, `${title}: ${message}`);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
