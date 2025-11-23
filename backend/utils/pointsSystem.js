import pool from '../config/db.js';

// Points awarded for different activities
const POINTS = {
  MODULE_COMPLETE: 10,
  COURSE_COMPLETE: 50,
  ASSIGNMENT_SUBMIT: 15,
  QUIZ_PASS: 20,
  TOPIC_CREATE: 5,
  REPLY_POST: 2,
  GET_LIKE: 1,
  BADGE_EARN: 20
};

// Level thresholds
const LEVELS = [
  { level: 1, minPoints: 0 },
  { level: 2, minPoints: 100 },
  { level: 3, minPoints: 300 },
  { level: 4, minPoints: 600 },
  { level: 5, minPoints: 1000 }
];

function calculateLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

export async function addPoints(userId, pointsToAdd, reason = '') {
  try {
    // Get current points
    const { rows } = await pool.query(
      'SELECT total_points, level, streak, last_activity FROM user_points WHERE user_id = $1',
      [userId]
    );

    let currentPoints = 0;
    let currentStreak = 0;
    let lastActivity = null;

    if (rows.length === 0) {
      // Create new record
      await pool.query(
        'INSERT INTO user_points (user_id, total_points, level, streak, last_activity) VALUES ($1, 0, 1, 0, NOW())',
        [userId]
      );
    } else {
      currentPoints = rows[0].total_points || 0;
      currentStreak = rows[0].streak || 0;
      lastActivity = rows[0].last_activity;
    }

    // Calculate new points and level
    const newPoints = currentPoints + pointsToAdd;
    const newLevel = calculateLevel(newPoints);

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = currentStreak;
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, keep streak
        newStreak = currentStreak;
      } else if (daysDiff === 1) {
        // Next day, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Missed days, reset streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Update database
    await pool.query(
      'UPDATE user_points SET total_points = $1, level = $2, streak = $3, last_activity = NOW() WHERE user_id = $4',
      [newPoints, newLevel, newStreak, userId]
    );

    console.log(`✅ Points added: User ${userId} +${pointsToAdd} (${reason}) | Total: ${newPoints} | Level: ${newLevel} | Streak: ${newStreak}`);

    return { newPoints, newLevel, newStreak };
  } catch (err) {
    console.error('Error adding points:', err);
    throw err;
  }
}

export async function updateStreak(userId) {
  try {
    const { rows } = await pool.query(
      'SELECT streak, last_activity FROM user_points WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO user_points (user_id, total_points, level, streak, last_activity) VALUES ($1, 0, 1, 1, NOW())',
        [userId]
      );
      return 1;
    }

    const lastActivity = rows[0].last_activity;
    const currentStreak = rows[0].streak || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = new Date(lastActivity);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    let newStreak = currentStreak;
    if (daysDiff === 0) {
      newStreak = currentStreak;
    } else if (daysDiff === 1) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }

    await pool.query(
      'UPDATE user_points SET streak = $1, last_activity = NOW() WHERE user_id = $2',
      [newStreak, userId]
    );

    return newStreak;
  } catch (err) {
    console.error('Error updating streak:', err);
    throw err;
  }
}

export { POINTS };
