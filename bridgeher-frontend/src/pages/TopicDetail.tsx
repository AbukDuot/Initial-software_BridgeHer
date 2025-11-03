import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import "../styles/topicDetail.css";

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  content: string;
  author_name: string;
  views: number;
  likes: number;
  user_liked: boolean;
  created_at: string;
}

interface Reply {
  id: number;
  content: string;
  author_name: string;
  likes: number;
  user_liked: boolean;
  created_at: string;
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

  useEffect(() => {
    fetchTopic();
    fetchCurrentUser();
  }, [id]);

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
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(isArabic ? "تم حذف الموضوع" : "Topic deleted");
        navigate("/community");
      }
    } catch (err) {
      console.error("Failed to delete topic", err);
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
      const res = await fetch(`${API_BASE_URL}/api/community/topics/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editTopicData)
      });

      if (res.ok) {
        alert(isArabic ? "تم تحديث الموضوع" : "Topic updated");
        setEditingTopic(false);
        await fetchTopic();
      }
    } catch (err) {
      console.error("Failed to edit topic", err);
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
              <textarea
                value={editTopicData.content}
                onChange={(e) => setEditTopicData({ ...editTopicData, content: e.target.value })}
                placeholder={isArabic ? "المحتوى" : "Content"}
                rows={6}
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
                <span>{isArabic ? "بواسطة" : "by"} <strong>{topic.author_name}</strong></span>
                <span>{timeAgo(topic.created_at, isArabic)}</span>
              </div>
            </>
          )}
        </div>

        {/* Topic Content */}
        <div className="topic-body">
          <p className="topic-description">{topic.description}</p>
          {topic.content && <div className="topic-content">{topic.content}</div>}
        </div>

        {/* Topic Stats & Actions */}
        <div className="topic-actions">
          <button 
            className={`like-btn ${topic.user_liked ? 'liked' : ''}`}
            onClick={handleLikeTopic}
          >
            {topic.user_liked ? '❤️' : '🤍'} {topic.likes} {isArabic ? "إعجاب" : "Likes"}
          </button>
          <span>👁️ {topic.views} {isArabic ? "مشاهدة" : "Views"}</span>
          <span>💬 {replies.length} {isArabic ? "رد" : "Replies"}</span>
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
            <button className="pin-btn" onClick={handlePinTopic}>
              📌 {isArabic ? "تثبيت" : "Pin"}
            </button>
          )}
          {currentUser && (
            <button className="report-btn" onClick={() => {
              setReportData({ type: "topic", id: topic.id, reason: "" });
              setShowReportModal(true);
            }}>
              {isArabic ? "بلاغ" : "Report"}
            </button>
          )}
        </div>

        {/* Replies Section */}
        <div className="replies-section">
          <h2>{isArabic ? "الردود" : "Replies"} ({replies.length})</h2>

          {replies.length === 0 ? (
            <p className="no-replies">{isArabic ? "لا توجد ردود بعد. كن أول من يرد!" : "No replies yet. Be the first to reply!"}</p>
          ) : (
            <div className="replies-list">
              {replies.map((reply) => (
                <div key={reply.id} className="reply-card">
                  <div className="reply-header">
                    <strong>{reply.author_name}</strong>
                    <span>{timeAgo(reply.created_at, isArabic)}</span>
                  </div>
                  <div className="reply-content">
                    <p>{reply.content}</p>
                  </div>
                  {editingReply === reply.id ? (
                    <div className="edit-reply-form">
                      <textarea
                        value={editReplyText}
                        onChange={(e) => setEditReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleEditReply(reply.id)} className="btn-save">{isArabic ? "حفظ" : "Save"}</button>
                        <button onClick={() => setEditingReply(null)} className="btn-cancel">{isArabic ? "إلغاء" : "Cancel"}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="reply-actions">
                      <button 
                        className={`like-btn-small ${reply.user_liked ? 'liked' : ''}`}
                        onClick={() => handleLikeReply(reply.id)}
                      >
                        {reply.user_liked ? '❤️' : '🤍'} {reply.likes}
                      </button>
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
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          <div className="reply-form">
            <h3>{isArabic ? "أضف رداً" : "Add a Reply"}</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isArabic ? "اكتب ردك هنا..." : "Write your reply here..."}
                rows={4}
                required
              />
              <button type="submit" className="btn-primary">
                {isArabic ? "إرسال الرد" : "Submit Reply"}
              </button>
            </form>
          </div>
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
