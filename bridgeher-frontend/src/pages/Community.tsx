import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import "../styles/community.css";

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
  tags?: string[];
}

interface Activity {
  type: string;
  content: string;
  author: string;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  pinned: boolean;
}

const Community: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory, sortBy, page]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchActivity();
    fetchAnnouncements();
  }, []);

  const fetchTopics = async () => {
    try {
      let url = `${API_BASE_URL}/api/community/topics?sort=${sortBy}&page=${page}&limit=20`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || data);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/tags`);
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch tags", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/activity`);
      if (res.ok) {
        const data = await res.json();
        setActivity(data);
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTopics();
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };





  const viewTopic = (topicId: number) => {
    navigate(`/community/topic/${topicId}`);
  };

  return (
    <div className={`community-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="community-container">
        {/* Sidebar */}
        <aside className="community-sidebar">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="sidebar-card announcements-card">
              <h3>{isArabic ? "📢 الإعلانات" : "📢 Announcements"}</h3>
              <div className="announcements-list">
                {announcements.map((ann) => (
                  <div key={ann.id} className="announcement-item">
                    <h4>{ann.title}</h4>
                    <p>{ann.content}</p>
                    <small>{new Date(ann.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Categories */}
          <div className="sidebar-card">
            <h3>{isArabic ? "الفئات الشائعة" : "Popular Categories"}</h3>
            <ul className="category-list">
              <li 
                className={!selectedCategory ? "active" : ""}
                onClick={() => setSelectedCategory("")}
              >
                {isArabic ? "الكل" : "All"} ({topics.length})
              </li>
              {categories.map((cat) => (
                <li 
                  key={cat.category}
                  className={selectedCategory === cat.category ? "active" : ""}
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category} ({cat.count})
                </li>
              ))}
            </ul>
          </div>

          {/* Top Tags */}
          <div className="sidebar-card">
            <h3>{isArabic ? "الوسوم الشائعة" : "Top Tags"}</h3>
            <div className="tags-cloud">
              {tags.slice(0, 15).map((tag) => (
                <span key={tag.tag} className="tag-badge">
                  {tag.tag} ({tag.count})
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="sidebar-card">
            <h3>{isArabic ? "النشاط الأخير" : "Recent Activity"}</h3>
            <ul className="activity-list">
              {activity.slice(0, 10).map((act, idx) => (
                <li key={idx}>
                  <span className="activity-type">
                    {act.type === 'topic' ? '📝' : '💬'}
                  </span>
                  <div>
                    <strong>{act.author}</strong>
                    <p>{act.content.substring(0, 50)}...</p>
                    <small>{new Date(act.created_at).toLocaleDateString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="community-main">
          {/* Header */}
          <div className="community-header">
            <h1>{isArabic ? "منتدى المجتمع" : "Community Forum"}</h1>
            <button className="btn-primary" onClick={() => navigate("/community/create")}>
              + {isArabic ? "موضوع جديد" : "New Topic"}
            </button>
          </div>

          {/* Search & Filters */}
          <div className="community-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder={isArabic ? "ابحث في المواضيع..." : "Search topics..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>🔍</button>
            </div>

            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="recent">{isArabic ? "الأحدث" : "Recent"}</option>
              <option value="popular">{isArabic ? "الأكثر مشاهدة" : "Popular"}</option>
              <option value="trending">{isArabic ? "الأكثر إعجاباً" : "Trending"}</option>
            </select>
          </div>

          {/* Topics List */}
          <div className="topics-list">
            {topics.length === 0 ? (
              <div className="empty-state">
                <p>{isArabic ? "لا توجد مواضيع بعد" : "No topics yet"}</p>
                <button onClick={() => navigate("/community/create")}>
                  {isArabic ? "كن أول من ينشر!" : "Be the first to post!"}
                </button>
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="topic-card" onClick={() => viewTopic(topic.id)}>
                  <div className="topic-content">
                    <h3>{topic.title}</h3>
                    <p>{topic.description?.substring(0, 150) + "..."}</p>
                    <div className="topic-meta">
                      {topic.category && <span className="category-badge">{topic.category}</span>}
                      <span>{isArabic ? "بواسطة" : "by"} {topic.author_name}</span>
                      <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="topic-stats">
                    <div className="stat">
                      <span className="stat-icon">💬</span>
                      <span>{topic.replies}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">👁️</span>
                      <span>{topic.views}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">❤️</span>
                      <span>{topic.likes}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                {isArabic ? "السابق" : "Previous"}
              </button>
              <span>{isArabic ? "صفحة" : "Page"} {page} {isArabic ? "من" : "of"} {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                {isArabic ? "التالي" : "Next"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Community;
