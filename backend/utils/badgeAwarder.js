import pool from "../config/db.js";

const BADGE_CRITERIA = {
  FIRST_POST: { name: "First Post", icon: "🎯", topicsRequired: 1 },
  ACTIVE_CONTRIBUTOR: { name: "Active Contributor", icon: "⭐", topicsRequired: 10 },
  HELPFUL: { name: "Helpful", icon: "💡", likesRequired: 25 },
  EXPERT: { name: "Expert", icon: "🏆", topicsRequired: 50, likesRequired: 100 },
  COMMUNITY_LEADER: { name: "Community Leader", icon: "👑", topicsRequired: 100, repliesRequired: 200 }
};

export const checkAndAwardBadges = async (userId) => {
  try {
    // Force connection refresh
    await pool.query('SELECT 1');
    const { rows: stats } = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM community_topics WHERE user_id = $1) as topics,
        (SELECT COUNT(*) FROM topic_replies WHERE user_id = $1) as replies,
        (SELECT COUNT(*) FROM topic_likes tl 
         JOIN community_topics t ON t.id = tl.topic_id 
         WHERE t.user_id = $1) as likes
    `, [userId]);

    const { topics, replies, likes } = stats[0];

    const badgesToAward = [];

    if (topics >= 1) badgesToAward.push(BADGE_CRITERIA.FIRST_POST);
    if (topics >= 10) badgesToAward.push(BADGE_CRITERIA.ACTIVE_CONTRIBUTOR);
    if (likes >= 25) badgesToAward.push(BADGE_CRITERIA.HELPFUL);
    if (topics >= 50 && likes >= 100) badgesToAward.push(BADGE_CRITERIA.EXPERT);
    if (topics >= 100 && replies >= 200) badgesToAward.push(BADGE_CRITERIA.COMMUNITY_LEADER);

    for (const badge of badgesToAward) {
      const { rows: existing } = await pool.query(
        `SELECT * FROM user_badges WHERE user_id = $1 AND badge_name = $2`,
        [userId, badge.name]
      );

      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_name, badge_description, badge_icon) VALUES ($1, $2, $3, $4)`,
          [userId, badge.name, `Earned for ${badge.name}`, badge.icon]
        );

        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, $2, $3, $4)`,
          [userId, 'badge', 'New Badge Earned!', `Congratulations! You earned the "${badge.name}" ${badge.icon} badge!`]
        );
      }
    }
  } catch (err) {
    console.error("Badge award error:", err);
  }
};
