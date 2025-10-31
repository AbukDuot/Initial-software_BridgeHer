import express from "express";
import pool from "../config/db.js";

const router = express.Router();


router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO support_messages (name, email, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, message]
    );
    
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (err) {
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

export default router;
