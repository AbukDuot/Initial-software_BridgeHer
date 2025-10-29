import passport from "passport";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

// OAuth removed - using email/password authentication only

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
