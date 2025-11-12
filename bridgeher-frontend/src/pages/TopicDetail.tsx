import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/topicDetail.css";
import "../styles/toggleComments.css";

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  content: string;
  author_name: string;
  user_id: number;
  views: number;
  likes: number;
  user_liked: boolean;
  status: string;
  locked: boolean;
  created_at: string;
  image_url?: string;
  video_url?: string;
  media_type?: string;
}

interface Reply {
  id: number;
  content: string;
  author_name: string;
  likes: number;
  user_liked: boolean;
  created_at: string;
  parent_reply_id?: number;
  best_answer?: boolean;
  user_id: number;
}

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState(false);
  const [editingReply, setEditingReply] = useState<number | null>(null);
  const [editTopicData, setEditTopicData] = useState({ title: "", description: "", content: "" });
  const [editReplyText, setEditReplyText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ type: "", id: 0, reason: "" });
  const [reactions, setReactions] = useState<any[]>([]);
  const [replyReactions, setReplyReactions] = useState<{[key: number]: any[]}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{type: string, id: number} | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchTopic();
    fetchCurrentUser();
    fetchReactions();
    fetchAttachments();
    checkBookmark();
  }, [id]);
  
  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/api/community/bookmarks/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error("Failed to check bookmark", err);
    }
  };
  
  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        alert(data.bookmarked 
          ? (isArabic ? "تمت إضافة الإشارة المرجعية" : "Bookmark added")
          : (isArabic ? "تمت إزالة الإشارة المرجعية" : "Bookmark removed")
        );
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to bookmark", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };

  const fetchReactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/reactions`);
      if (res.ok) {
        const data = await res.json();
        setReactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch reactions", err);
    }
  };

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/attachments/topic/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error("Failed to fetch attachments", err);
    }
  };

  const fetchCurrentUser = () => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  };

  const fetchTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      const viewedTopics = JSON.parse(localStorage.getItem("viewedTopics") || "[]");
      const alreadyViewed = viewedTopics.includes(Number(id));
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}?skipView=${alreadyViewed}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
        setReplies(data.replies);
        
        if (!alreadyViewed) {
          viewedTopics.push(Number(id));
          localStorage.setItem("viewedTopics", JSON.stringify(viewedTopics));
        }
      }
    } catch (err) {
      console.error("Failed to fetch topic", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to like topic", err);
    }
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to like reply", err);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim()) {
      alert(isArabic ? "الرجاء كتابة رد" : "Please write a reply");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });

      if (res.ok) {
        setReplyText("");
        await fetchTopic();
        alert(isArabic ? "تم إضافة الرد بنجاح!" : "Reply added successfully!");
      }
    } catch (err) {
      console.error("Failed to submit reply", err);
      alert(isArabic ? "فشل في إضافة الرد" : "Failed to add reply");
    }
  };

  const handleDeleteTopic = async () => {
    if (!confirm(isArabic ? "هل تريد حذف هذا الموضوع؟" : "Delete this topic?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم حذف الموضوع" : "Topic deleted");
        navigate("/community");
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to delete topic", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm(isArabic ? "هل تريد حذف هذا الرد؟" : "Delete this reply?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم حذف الرد" : "Reply deleted");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to delete reply", err);
    }
  };

  const handleEditTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTopicData.title,
          description: editTopicData.description,
          category: topic?.category,
          tags: topic?.tags || []
        })
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث الموضوع" : "Topic updated");
        setEditingTopic(false);
        await fetchTopic();
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to edit topic", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleEditReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editReplyText })
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث الرد" : "Reply updated");
        setEditingReply(null);
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to edit reply", err);
    }
  };

  const handlePinTopic = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/pin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث التثبيت" : "Pin status updated");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to pin topic", err);
    }
  };



  const handleReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content_type: reportData.type,
          content_id: reportData.id,
          reason: reportData.reason
        })
      });

      if (res.ok) {
        alert(isArabic ? "تم إرسال البلاغ" : "Report submitted");
        setShowReportModal(false);
        setReportData({ type: "", id: 0, reason: "" });
      }
    } catch (err) {
      console.error("Failed to report", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث الحالة" : "Status updated");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLockToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/lock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث القفل" : "Lock status updated");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to toggle lock", err);
    }
  };



  const handleReact = async (emoji: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        await fetchReactions();
        setShowEmojiPicker(null);
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to react", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleReplyReact = async (replyId: number, emoji: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        const reactRes = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/reactions`);
        if (reactRes.ok) {
          const data = await reactRes.json();
          setReplyReactions(prev => ({ ...prev, [replyId]: data }));
        }
        setShowEmojiPicker(null);
      }
    } catch (err) {
      console.error("Failed to react", err);
    }
  };

  const handleMarkBestAnswer = async (replyId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/replies/${replyId}/mark-best`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديد أفضل إجابة" : "Best answer marked");
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to mark best answer", err);
    }
  };

  const handleNestedReply = async (parentId: number) => {
    if (!nestedReplyText.trim()) {
      alert(isArabic ? "الرجاء كتابة تعليق" : "Please write a comment");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/replies/${parentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: nestedReplyText })
      });

      if (res.ok) {
        setNestedReplyText("");
        setReplyingTo(null);
        await fetchTopic();
        alert(isArabic ? "تم إضافة التعليق!" : "Comment added!");
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to add nested reply", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };



  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  if (!topic) return <div className="error">{isArabic ? "الموضوع غير موجود" : "Topic not found"}</div>;

  return (
    <div className={`topic-detail ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="topic-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate("/community")}>
          ← {isArabic ? "العودة للمنتدى" : "Back to Forum"}
        </button>

        {/* Topic Header */}
        <div className="topic-header">
          {editingTopic ? (
            <div className="edit-form">
              <input
                value={editTopicData.title}
                onChange={(e) => setEditTopicData({ ...editTopicData, title: e.target.value })}
                placeholder={isArabic ? "العنوان" : "Title"}
              />
              <textarea
                value={editTopicData.description}
                onChange={(e) => setEditTopicData({ ...editTopicData, description: e.target.value })}
                placeholder={isArabic ? "الوصف" : "Description"}
                rows={2}
              />
              <RichTextEditor
                value={editTopicData.content}
                onChange={(content) => setEditTopicData({ ...editTopicData, content })}
                placeholder={isArabic ? "المحتوى" : "Content"}
              />
              <div className="edit-actions">
                <button onClick={handleEditTopic} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                <button onClick={() => setEditingTopic(false)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{topic.title}</h1>
              <div className="topic-meta">
                <span className="category-badge">{topic.category}</span>
                <span>
                  {isArabic ? "بواسطة" : "by"}{" "}
                  <strong 
                    className="author-link" 
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${topic.user_id}`); }}
                  >
                    {topic.author_name}
                  </strong>
                </span>
                <span>{timeAgo(topic.created_at, isArabic)}</span>
              </div>
            </>
          )}
        </div>

        {/* Topic Content */}
        <div className="topic-body">
          {topic.description && (
            <div className="topic-description" dangerouslySetInnerHTML={{ __html: topic.description }} />
          )}
          {topic.content && <div className="topic-content" dangerouslySetInnerHTML={{ __html: topic.content }} />}
          
          {/* Media Display */}
          {topic.media_type === 'image' && topic.image_url && (
            <div className="topic-media">
              <img 
                src={topic.image_url.startsWith('http') ? topic.image_url : `${API_BASE_URL}${topic.image_url}`} 
                alt={topic.title} 
                style={{maxWidth: '100%', borderRadius: '8px', marginTop: '15px'}} 
              />
            </div>
          )}
          {topic.media_type === 'video' && topic.video_url && (
            <div className="topic-media">
              <video 
                src={topic.video_url.startsWith('http') ? topic.video_url : `${API_BASE_URL}${topic.video_url}`} 
                controls 
                style={{maxWidth: '100%', borderRadius: '8px', marginTop: '15px'}} 
              />
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="reactions-section">
          {reactions.map((r: any) => (
            <span key={r.emoji} className="reaction-badge" title={r.users.join(', ')}>
              {r.emoji} {r.count}
            </span>
          ))}
          {currentUser && (
            <button className="add-reaction-btn" onClick={() => setShowEmojiPicker({type: 'topic', id: topic.id})}>
              ➕ {isArabic ? "تفاعل" : "React"}
            </button>
          )}
          {showEmojiPicker?.type === 'topic' && showEmojiPicker?.id === topic.id && (
            <div className="emoji-picker">
              {['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯'].map(emoji => (
                <button key={emoji} onClick={() => handleReact(emoji)}>{emoji}</button>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="attachments-section">
            <h4>{isArabic ? "المرفقات" : "Attachments"}</h4>
            {attachments.map((att: any) => (
              <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                📎 {att.file_name} ({Math.round(att.file_size / 1024)}KB)
              </a>
            ))}
          </div>
        )}

        {/* Topic Stats & Actions */}
        <div className="topic-actions">
          <span>👁️ {topic.views} {isArabic ? "مشاهدة" : "Views"}</span>
          <span>💬 {replies.length} {isArabic ? "رد" : "Replies"}</span>
          {topic.status && (
            <span className={`status-badge status-${topic.status}`}>
              {topic.status === 'solved' ? (isArabic ? '✓ محلول' : '✓ Solved') : 
               topic.status === 'closed' ? (isArabic ? '🔒 مغلق' : '🔒 Closed') : 
               (isArabic ? 'مفتوح' : 'Open')}
            </span>
          )}
          {topic.locked && <span className="locked-badge">🔒 {isArabic ? "مقفل" : "Locked"}</span>}
          {currentUser && !editingTopic && (
            <button className="edit-btn" onClick={() => {
              setEditTopicData({ title: topic.title, description: topic.description, content: topic.content });
              setEditingTopic(true);
            }}>
              {isArabic ? "تعديل" : "Edit"}
            </button>
          )}
          {currentUser && (
            <button className="delete-btn" onClick={handleDeleteTopic}>
              {isArabic ? "حذف" : "Delete"}
            </button>
          )}
          {currentUser && currentUser.role === 'Admin' && (
            <>
              <button className="pin-btn" onClick={handlePinTopic}>
                📌 {isArabic ? "تثبيت" : "Pin"}
              </button>
              <button className="lock-btn" onClick={handleLockToggle}>
                {topic.locked ? '🔓' : '🔒'} {topic.locked ? (isArabic ? "فتح" : "Unlock") : (isArabic ? "قفل" : "Lock")}
              </button>
            </>
          )}
          {currentUser && (currentUser.id === topic.user_id || currentUser.role === 'Admin') && (
            <select 
              className="status-select"
              value={topic.status || 'open'}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="open">{isArabic ? "مفتوح" : "Open"}</option>
              <option value="solved">{isArabic ? "محلول" : "Solved"}</option>
              <option value="closed">{isArabic ? "مغلق" : "Closed"}</option>
            </select>
          )}
          {currentUser && (
            <>
              <button 
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmark}
              >
                {isBookmarked ? '🔖' : '📑'} {isBookmarked ? (isArabic ? "محفوظ" : "Saved") : (isArabic ? "حفظ" : "Bookmark")}
              </button>
              <button className="report-btn" onClick={() => {
                setReportData({ type: "topic", id: topic.id, reason: "" });
                setShowReportModal(true);
              }}>
                {isArabic ? "بلاغ" : "Report"}
              </button>
            </>
          )}
        </div>

        {/* Replies Section */}
        <div className="replies-section">
          <h2>{isArabic ? "الردود" : "Replies"} ({replies.length})</h2>

          {replies.length === 0 ? (
            <p className="no-replies">{isArabic ? "لا توجد ردود بعد. كن أول من يرد!" : "No replies yet. Be the first to reply!"}</p>
          ) : (
            <div className="replies-list">
              {replies.filter(r => !r.parent_reply_id).map((reply) => (
                <div key={reply.id} className={`reply-card ${reply.best_answer ? 'best-answer' : ''}`}>
                  <div className="reply-header">
                    <strong>{reply.author_name}</strong>
                    <span>{timeAgo(reply.created_at, isArabic)}</span>
                    {reply.best_answer && <span className="best-badge">✓ {isArabic ? "أفضل إجابة" : "Best Answer"}</span>}
                    {currentUser && (currentUser.id === topic.user_id || currentUser.role === 'Admin') && !reply.best_answer && (
                      <button className="best-answer-btn" onClick={() => handleMarkBestAnswer(reply.id)}>
                        ✓ {isArabic ? "أفضل إجابة" : "Mark Best"}
                      </button>
                    )}
                  </div>
                  <div className="reply-content">{reply.content.replace(/<[^>]*>/g, '')}</div>
                  
                  {/* Reply Reactions */}
                  <div className="reply-reactions">
                    {(replyReactions[reply.id] || []).map((r: any) => (
                      <span key={r.emoji} className="reaction-badge-small" title={r.users.join(', ')}>
                        {r.emoji} {r.count}
                      </span>
                    ))}
                    {currentUser && (
                      <button className="add-reaction-btn-small" onClick={() => setShowEmojiPicker({type: 'reply', id: reply.id})}>
                        ➕
                      </button>
                    )}
                    {showEmojiPicker?.type === 'reply' && showEmojiPicker?.id === reply.id && (
                      <div className="emoji-picker-small">
                        {['👍', '❤️', '😂', '😮', '😢', '🎉'].map(emoji => (
                          <button key={emoji} onClick={() => handleReplyReact(reply.id, emoji)}>{emoji}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {editingReply === reply.id ? (
                    <div className="edit-reply-form">
                      <RichTextEditor
                        value={editReplyText}
                        onChange={setEditReplyText}
                        placeholder={isArabic ? "تعديل الرد" : "Edit reply"}
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleEditReply(reply.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                        <button onClick={() => setEditingReply(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="reply-actions">
                      {currentUser && (
                        <>
                          <button className="edit-btn-small" onClick={() => {
                            setEditReplyText(reply.content);
                            setEditingReply(reply.id);
                          }}>
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                          <button className="delete-btn-small" onClick={() => handleDeleteReply(reply.id)}>
                            {isArabic ? "حذف" : "Delete"}
                          </button>
                          <button className="reply-btn-small" onClick={() => setReplyingTo(reply.id)}>
                            {isArabic ? "تعليق" : "Comment"}
                          </button>
                        </>
                      )}
                      {currentUser && (
                        <button className="report-btn-small" onClick={() => {
                          setReportData({ type: "reply", id: reply.id, reason: "" });
                          setShowReportModal(true);
                        }}>
                          {isArabic ? "بلاغ" : "Report"}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Nested Replies */}
                  {replies.filter(r => r.parent_reply_id === reply.id).length > 0 && (
                    <>
                      <button 
                        className="toggle-comments-btn"
                        onClick={() => setExpandedReplies(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                      >
                        {expandedReplies[reply.id] ? '▼' : '▶'} 
                        {expandedReplies[reply.id] 
                          ? (isArabic ? 'إخفاء' : 'Hide') 
                          : (isArabic ? 'عرض' : 'Show')
                        } {replies.filter(r => r.parent_reply_id === reply.id).length} 
                        {isArabic ? 'تعليق' : 'comment(s)'}
                      </button>
                      {expandedReplies[reply.id] && (
                        <div className="nested-replies">
                          {replies.filter(r => r.parent_reply_id === reply.id).map(nestedReply => (
                            <div key={nestedReply.id} className="nested-reply-card">
                              <div className="reply-header">
                                <strong>{nestedReply.author_name}</strong>
                                <span>{timeAgo(nestedReply.created_at, isArabic)}</span>
                              </div>
                              <div className="reply-content">{nestedReply.content.replace(/<[^>]*>/g, '')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Nested Comment Form */}
                  {replyingTo === reply.id && (
                    <div className="nested-reply-form">
                      <RichTextEditor
                        value={nestedReplyText}
                        onChange={setNestedReplyText}
                        placeholder={isArabic ? "اكتب تعليقك..." : "Write your comment..."}
                      />
                      <div className="nested-reply-actions">
                        <button onClick={() => handleNestedReply(reply.id)} className="btn-primary">
                          {isArabic ? "إرسال التعليق" : "Post Comment"}
                        </button>
                        <button onClick={() => setReplyingTo(null)} className="btn-cancel">
                          {isArabic ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {!topic.locked ? (
            <div className="reply-form">
              <h3>{isArabic ? "أضف رداً" : "Add a Reply"}</h3>
              <form onSubmit={handleSubmitReply}>
                <RichTextEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder={isArabic ? "اكتب ردك على الموضوع... (استخدم @اسم_المستخدم للإشارة)" : "Write your reply to the topic... (Use @username to mention)"}
                />
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                  {isArabic ? "إرسال الرد" : "Post Reply"}
                </button>
              </form>
            </div>
          ) : (
            <div className="locked-message">
              <p>🔒 {isArabic ? "هذا الموضوع مقفل. لا يمكن إضافة ردود جديدة." : "This topic is locked. No new replies can be added."}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{isArabic ? "إبلاغ عن محتوى" : "Report Content"}</h3>
            <textarea
              value={reportData.reason}
              onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
              placeholder={isArabic ? "سبب البلاغ..." : "Reason for report..."}
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={handleReport} className="btn-primary">{isArabic ? "إرسال" : "Submit"}</button>
              <button onClick={() => setShowReportModal(false)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;
