import express from "express";
import pool from "../config/db.js";

const router = express.Router();


router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    await pool.query(
      `INSERT INTO support_messages (name, email, message, subject)
       VALUES ($1, $2, $3, $4)`,
      [name, email, message, 'Contact Form Submission']
    );
    
    console.log('✅ Support message saved:', { name, email });
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error('❌ Support contact error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


router.get("/messages", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM support_messages ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/messages/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE support_messages SET status = 'resolved' WHERE id = $1`,
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
