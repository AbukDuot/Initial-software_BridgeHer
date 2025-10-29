import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import passport from "../config/passport.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import { sendWelcomeSMS } from "../services/smsService.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send welcome notifications
    console.log("\n🔔 Sending welcome notifications...");
    console.log("   Email:", user.email);
    console.log("   Phone:", req.body.phone || "Not provided");
    
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error("❌ Email notification failed:", err.message);
    });
    
    if (req.body.phone) {
      sendWelcomeSMS(req.body.phone, user.name).catch(err => {
        console.error("❌ SMS notification failed:", err.message);
      });
    } else {
      console.log("⚠️ SMS skipped - No phone number in request");
    }

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error(" Registration error:", error.message);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
});

// Facebook OAuth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
});

// Password Reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (!rows[0]) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    const { sendPasswordResetEmail } = await import("../services/emailService.js");
    await sendPasswordResetEmail(email, resetToken);
    
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, decoded.id]);
    
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
