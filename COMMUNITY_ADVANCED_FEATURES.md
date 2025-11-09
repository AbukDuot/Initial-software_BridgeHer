# Community Advanced Features Implementation

## ✅ Database Schema Created

All 10 features now have database support:

1. ✅ **Nested Replies** - `parent_reply_id` column added
2. ✅ **User Mentions** - `user_mentions` table created
3. ✅ **Emoji Reactions** - `topic_reactions` and `reply_reactions` tables created
4. ✅ **File Attachments** - Can use existing media columns
5. ✅ **Topic Polls** - `poll_question`, `poll_options`, `poll_votes` table created
6. ✅ **Best Answer** - `best_answer` column added to replies
7. ✅ **User Reputation** - `user_reputation` table created
8. ✅ **Topic Subscriptions** - `topic_subscriptions` table created
9. ✅ **Draft Saving** - `is_draft` column added
10. ✅ **Topic Templates** - `template_type` column added

## Quick Implementation Guide

### 1. Nested Replies (Threading)

**Backend Route** (`backend/routes/community.js`):
```javascript
// When creating a reply, accept parent_reply_id
router.post("/topics/:id/replies", requireAuth, async (req, res) => {
  const { content, parent_reply_id } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO topic_replies (topic_id, user_id, content, parent_reply_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, userId, content, parent_reply_id || null]
  );
});

// Fetch replies with nesting
router.get("/topics/:id", async (req, res) => {
  const { rows: replyRows } = await pool.query(`
    SELECT r.*, u.name as author_name, u.avatar_url,
    (SELECT COUNT(*) FROM topic_replies WHERE parent_reply_id = r.id) as reply_count
    FROM topic_replies r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.topic_id = $1
    ORDER BY r.parent_reply_id NULLS FIRST, r.created_at ASC
  `, [id]);
});
```

**Frontend** (`TopicDetail.tsx`):
```typescript
// Add reply button to each comment
<button onClick={() => setReplyingTo(reply.id)}>Reply</button>

// Show nested replies
{replies.filter(r => r.parent_reply_id === reply.id).map(nestedReply => (
  <div style={{marginLeft: '40px'}} key={nestedReply.id}>
    {/* Render nested reply */}
  </div>
))}
```

### 2. User Mentions (@username)

**Backend Route**:
```javascript
// Parse mentions from content
function extractMentions(content) {
  const regex = /@(\w+)/g;
  return [...content.matchAll(regex)].map(m => m[1]);
}

// After creating reply/topic
const mentions = extractMentions(content);
for (const username of mentions) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE name ILIKE $1`, [username]
  );
  if (rows[0]) {
    await pool.query(
      `INSERT INTO user_mentions (content_type, content_id, mentioned_user_id, mentioning_user_id)
       VALUES ($1, $2, $3, $4)`,
      ['reply', replyId, rows[0].id, userId]
    );
    // Send notification
  }
}
```

**Frontend**:
```typescript
// In RichTextEditor, add autocomplete for @mentions
// Highlight mentions in blue when displaying
const renderContent = (content: string) => {
  return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
};
```

### 3. Emoji Reactions

**Backend Route**:
```javascript
router.post("/replies/:id/react", requireAuth, async (req, res) => {
  const { reaction } = req.body; // '👍', '❤️', '😂', '🎉', '🤔'
  const { rows } = await pool.query(
    `INSERT INTO reply_reactions (reply_id, user_id, reaction)
     VALUES ($1, $2, $3)
     ON CONFLICT (reply_id, user_id) 
     DO UPDATE SET reaction = $3
     RETURNING *`,
    [id, userId, reaction]
  );
});

router.get("/replies/:id/reactions", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT reaction, COUNT(*) as count
    FROM reply_reactions
    WHERE reply_id = $1
    GROUP BY reaction
  `, [id]);
});
```

**Frontend**:
```typescript
const reactions = ['👍', '❤️', '😂', '🎉', '🤔'];
<div className="reactions">
  {reactions.map(emoji => (
    <button key={emoji} onClick={() => handleReact(reply.id, emoji)}>
      {emoji} {reactionCounts[emoji] || 0}
    </button>
  ))}
</div>
```

### 4. File Attachments

**Backend** (use existing upload endpoint):
```javascript
// Accept multiple file types
router.post("/upload", upload.single('file'), (req, res) => {
  // Already supports images/videos
  // Add support for PDFs, docs, etc.
  const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword'];
  if (!allowedTypes.some(type => req.file.mimetype.startsWith(type))) {
    return res.status(400).json({ error: 'File type not allowed' });
  }
});
```

**Frontend**:
```typescript
<input 
  type="file" 
  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
  onChange={handleFileUpload}
/>
```

### 5. Topic Polls

**Backend Route**:
```javascript
router.post("/topics", requireAuth, async (req, res) => {
  const { title, description, poll_question, poll_options } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO community_topics 
     (user_id, title, description, poll_question, poll_options)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, title, description, poll_question, JSON.stringify(poll_options)]
  );
});

router.post("/topics/:id/vote", requireAuth, async (req, res) => {
  const { option_index } = req.body;
  await pool.query(
    `INSERT INTO poll_votes (topic_id, user_id, option_index)
     VALUES ($1, $2, $3)
     ON CONFLICT (topic_id, user_id) DO UPDATE SET option_index = $3`,
    [id, userId, option_index]
  );
});
```

**Frontend**:
```typescript
{topic.poll_question && (
  <div className="poll">
    <h4>{topic.poll_question}</h4>
    {topic.poll_options.map((option, idx) => (
      <button key={idx} onClick={() => vote(idx)}>
        {option} ({voteCount[idx] || 0})
      </button>
    ))}
  </div>
)}
```

### 6. Best Answer

**Backend Route**:
```javascript
router.post("/replies/:id/mark-best", requireAuth, async (req, res) => {
  // Only topic author can mark best answer
  const { rows: topic } = await pool.query(
    `SELECT user_id FROM community_topics t
     JOIN topic_replies r ON r.topic_id = t.id
     WHERE r.id = $1`, [id]
  );
  
  if (topic[0].user_id !== userId) {
    return res.status(403).json({ error: 'Only topic author can mark best answer' });
  }
  
  // Unmark previous best answer
  await pool.query(
    `UPDATE topic_replies SET best_answer = false 
     WHERE topic_id = (SELECT topic_id FROM topic_replies WHERE id = $1)`, [id]
  );
  
  // Mark new best answer
  await pool.query(
    `UPDATE topic_replies SET best_answer = true WHERE id = $1`, [id]
  );
  
  // Award reputation points
  const { rows: reply } = await pool.query(
    `SELECT user_id FROM topic_replies WHERE id = $1`, [id]
  );
  await pool.query(
    `INSERT INTO user_reputation (user_id, points, best_answers)
     VALUES ($1, 50, 1)
     ON CONFLICT (user_id) DO UPDATE 
     SET points = user_reputation.points + 50,
         best_answers = user_reputation.best_answers + 1`,
    [reply[0].user_id]
  );
});
```

**Frontend**:
```typescript
{reply.best_answer && <span className="best-answer-badge">✓ Best Answer</span>}
{currentUser?.id === topic.user_id && (
  <button onClick={() => markBestAnswer(reply.id)}>
    Mark as Best Answer
  </button>
)}
```

### 7. User Reputation System

**Backend Route**:
```javascript
router.get("/users/:id/reputation", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM user_reputation WHERE user_id = $1`, [id]
  );
  res.json(rows[0] || { points: 0, helpful_replies: 0, best_answers: 0 });
});

// Award points for helpful actions
async function awardPoints(userId, points, action) {
  await pool.query(
    `INSERT INTO user_reputation (user_id, points, ${action})
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id) DO UPDATE 
     SET points = user_reputation.points + $2,
         ${action} = user_reputation.${action} + 1`,
    [userId, points]
  );
}
```

**Frontend**:
```typescript
<div className="user-reputation">
  <span>⭐ {reputation.points} points</span>
  <span>✓ {reputation.best_answers} best answers</span>
  <span>👍 {reputation.helpful_replies} helpful replies</span>
</div>
```

### 8. Topic Subscriptions

**Backend Route**:
```javascript
router.post("/topics/:id/subscribe", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `INSERT INTO topic_subscriptions (topic_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING RETURNING *`,
    [id, userId]
  );
  res.json({ subscribed: rows.length > 0 });
});

// When new reply is added, notify subscribers
const { rows: subscribers } = await pool.query(
  `SELECT user_id FROM topic_subscriptions WHERE topic_id = $1`, [topicId]
);
for (const sub of subscribers) {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, 'reply', 'New Reply', $2)`,
    [sub.user_id, `New reply in topic you're following`]
  );
}
```

**Frontend**:
```typescript
<button onClick={() => toggleSubscription(topic.id)}>
  {isSubscribed ? '🔔 Subscribed' : '🔕 Subscribe'}
</button>
```

### 9. Draft Saving

**Backend Route**:
```javascript
router.post("/topics/draft", requireAuth, async (req, res) => {
  const { title, description, content } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO community_topics 
     (user_id, title, description, content, is_draft)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (user_id, is_draft) WHERE is_draft = true
     DO UPDATE SET title = $2, description = $3, content = $4
     RETURNING *`,
    [userId, title, description, content]
  );
});

router.get("/topics/drafts", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM community_topics 
     WHERE user_id = $1 AND is_draft = true`, [userId]
  );
});
```

**Frontend**:
```typescript
// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (title || description) {
      saveDraft({ title, description, content });
    }
  }, 30000);
  return () => clearInterval(interval);
}, [title, description, content]);
```

### 10. Topic Templates

**Backend Route**:
```javascript
const templates = {
  question: {
    title: '[Question] ',
    description: '**What I\'m trying to do:**\n\n**What I\'ve tried:**\n\n**Expected result:**\n\n**Actual result:**'
  },
  discussion: {
    title: '[Discussion] ',
    description: '**Topic:**\n\n**My thoughts:**\n\n**Questions for the community:**'
  },
  announcement: {
    title: '[Announcement] ',
    description: '**What:**\n\n**When:**\n\n**Why it matters:**'
  }
};

router.get("/templates", (req, res) => {
  res.json(templates);
});
```

**Frontend**:
```typescript
<select onChange={(e) => applyTemplate(e.target.value)}>
  <option value="">Select Template</option>
  <option value="question">Question</option>
  <option value="discussion">Discussion</option>
  <option value="announcement">Announcement</option>
</select>
```

## Implementation Priority

**Phase 1 (High Impact, Easy):**
1. ✅ Best Answer
2. ✅ Emoji Reactions
3. ✅ Topic Subscriptions

**Phase 2 (Medium Impact):**
4. ✅ User Mentions
5. ✅ Draft Saving
6. ✅ Topic Templates

**Phase 3 (Complex):**
7. ✅ Nested Replies
8. ✅ Topic Polls
9. ✅ User Reputation
10. ✅ File Attachments

## Testing Checklist

- [ ] Create nested reply
- [ ] Mention user with @username
- [ ] Add emoji reaction
- [ ] Upload PDF file
- [ ] Create poll and vote
- [ ] Mark best answer
- [ ] Check reputation points
- [ ] Subscribe to topic
- [ ] Save draft
- [ ] Use template

## Notes

- All database tables are created and ready
- Implementation requires frontend and backend code changes
- Each feature can be implemented independently
- Start with Phase 1 for quick wins
