import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/discussion.css";

const Discussion: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const post = queryParams.get("post") || "No post selected.";

  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [...prev, newComment]);
    setNewComment("");
  };

  return (
    <div className="discussion-page">
      <div className="discussion-card">
        <h2>Discussion</h2>
        <p className="post-content">{post}</p>

        <h3>Comments</h3>
        <div className="comments-section">
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="comment">
                <strong>User {i + 1}:</strong> {c}
              </div>
            ))
          )}
        </div>

        <div className="comment-box">
          <textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>
      </div>
    </div>
  );
};

export default Discussion;
