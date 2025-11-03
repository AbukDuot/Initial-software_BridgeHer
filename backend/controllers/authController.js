import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import { sendWelcomeSMS } from "../services/smsService.js";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role, calendar_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, hashedPassword, role, email]
    );

    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || "7d" });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: newUser.rows[0],
    });

    setImmediate(() => {
      sendWelcomeEmail(email, name).catch(console.error);
      if (newUser.rows[0].contact) {
        sendWelcomeSMS(newUser.rows[0].contact, name).catch(console.error);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || "7d" });

    res.json({
      message: "Login successful",
      token,
      user: user.rows[0],
    });

    setImmediate(() => {
      const loginEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Login Notification - BridgeHer",
        html: `<h2>Hi ${user.rows[0].name}!</h2><p>You logged in to BridgeHer at ${new Date().toLocaleString()}.</p>`,
      };
      
      import("nodemailer").then(nodemailer => {
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });
        transporter.sendMail(loginEmail).catch(console.error);
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
