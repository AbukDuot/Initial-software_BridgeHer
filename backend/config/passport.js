import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (rows.length === 0) {
          const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, "oauth_user", "Learner"]
          );
          return done(null, result.rows[0]);
        }

        return done(null, rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (rows.length === 0) {
          const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, "oauth_user", "Learner"]
          );
          return done(null, result.rows[0]);
        }

        return done(null, rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

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
