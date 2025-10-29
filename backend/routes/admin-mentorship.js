import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { sendMentorshipNotification } from "../services/emailService.js";
import { sendMentorshipSMS } from "../services/smsService.js";

const router = express.Router();

// Admin assigns mentor to learner
router.post("/assign", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { learner_id, mentor_id, topic, message, scheduled_at } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO mentorship_requests (requester_id, mentor_id, topic, message, status, scheduled_at)
       VALUES ($1, $2, $3, $4, 'accepted', $5)
       RETURNING *`,
      [learner_id, mentor_id, topic || "Admin Assignment", message || "Assigned by admin", scheduled_at || null]
    );
    
    const { rows: users } = await pool.query(
      "SELECT l.name as learner_name, l.email as learner_email, l.contact as learner_phone, m.name as mentor_name, m.email as mentor_email, m.contact as mentor_phone FROM users l, users m WHERE l.id = $1 AND m.id = $2",
      [learner_id, mentor_id]
    );
    
    if (users[0]) {
      console.log("\n🔔 Sending mentorship assignment notifications...");
      console.log("   Learner:", users[0].learner_name, users[0].learner_email);
      console.log("   Mentor:", users[0].mentor_name, users[0].mentor_email);
      console.log("   Scheduled:", scheduled_at || "Not scheduled");
      
      // Notify learner
      sendMentorshipNotification(users[0].learner_email, users[0].learner_name, users[0].mentor_name).catch(err => {
        console.error("❌ Failed to send learner email:", err.message);
      });
      if (users[0].learner_phone) {
        sendMentorshipSMS(users[0].learner_phone, users[0].learner_name, users[0].mentor_name).catch(err => {
          console.error("❌ Failed to send learner SMS:", err.message);
        });
      }
      
      // Notify mentor
      sendMentorshipNotification(users[0].mentor_email, users[0].mentor_name, users[0].learner_name).catch(err => {
        console.error("❌ Failed to send mentor email:", err.message);
      });
      if (users[0].mentor_phone) {
        sendMentorshipSMS(users[0].mentor_phone, users[0].mentor_name, users[0].learner_name).catch(err => {
          console.error("❌ Failed to send mentor SMS:", err.message);
        });
      }
    }
    
    res.json({ message: "Mentor assigned successfully", assignment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all mentorship connections
router.get("/connections", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mr.*, 
              l.name as learner_name, l.email as learner_email,
              m.name as mentor_name, m.email as mentor_email
       FROM mentorship_requests mr
       JOIN users l ON l.id = mr.requester_id
       JOIN users m ON m.id = mr.mentor_id
       ORDER BY mr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available mentors
router.get("/mentors", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, expertise, availability 
       FROM users 
       WHERE role = 'Mentor' AND availability = true
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get learners without mentors
router.get("/unassigned-learners", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at
       FROM users u
       WHERE u.role = 'Learner'
       AND u.id NOT IN (
         SELECT requester_id FROM mentorship_requests WHERE status = 'accepted'
       )
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
