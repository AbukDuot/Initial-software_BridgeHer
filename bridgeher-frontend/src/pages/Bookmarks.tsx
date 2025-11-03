import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import "../styles/bookmarks.css";

interface Topic {
  id: number;
  title: string;
  category: string;
  description: string;
  author_name: string;
  replies: number;
  views: number;
  likes: number;
  created_at: string;
  bookmarked_at: string;
}

const Bookmarks: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [bookmarks, setBookmarks] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (topicId: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/community/topics/${topicId}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookmarks(bookmarks.filter(b => b.id !== topicId));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className={`bookmarks-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="bookmarks-container">
        <header className="bookmarks-header">
          <h1>{isArabic ? "المفضلة" : "Bookmarks"}</h1>
          <button onClick={() => navigate("/community")} className="back-btn">
            ← {isArabic ? "العودة" : "Back"}
          </button>
        </header>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <p>{isArabic ? "لا توجد مواضيع محفوظة" : "No bookmarked topics"}</p>
            <button onClick={() => navigate("/community")} className="btn-primary">
              {isArabic ? "تصفح المواضيع" : "Browse Topics"}
            </button>
          </div>
        ) : (
          <div className="bookmarks-list">
            {bookmarks.map((topic) => (
              <div key={topic.id} className="bookmark-card">
                <div className="bookmark-content" onClick={() => navigate(`/community/topic/${topic.id}`)}>
                  <h3>{topic.title}</h3>
                  <p>{topic.description?.substring(0, 150)}...</p>
                  <div className="topic-meta">
                    <span className="category">{topic.category}</span>
                    <span>{isArabic ? "بواسطة" : "by"} {topic.author_name}</span>
                    <span>👁️ {topic.views}</span>
                    <span>❤️ {topic.likes}</span>
                    <span>💬 {topic.replies}</span>
                    <span>{timeAgo(topic.created_at, isArabic)}</span>
                  </div>
                  <small className="bookmarked-date">
                    {isArabic ? "تم الحفظ" : "Bookmarked"} {timeAgo(topic.bookmarked_at, isArabic)}
                  </small>
                </div>
                <button 
                  className="remove-btn" 
                  onClick={(e) => { e.stopPropagation(); removeBookmark(topic.id); }}
                  title={isArabic ? "إزالة من المفضلة" : "Remove bookmark"}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
