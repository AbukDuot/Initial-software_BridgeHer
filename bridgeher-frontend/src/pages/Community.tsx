import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import "../styles/community.css";
import "../styles/modal.css";

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

interface Category {
  category: string;
  count: number;
}

interface Tag {
  tag: string;
  count: number;
}

const Community: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    tag: "",
    author: "",
    dateFrom: "",
    dateTo: "",
    status: ""
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    category: "",
    description: "",
    tags: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
        const topicsData = Array.isArray(data) ? data : (data.topics || []);
        setTopics(topicsData.map((t: Topic) => ({
          ...t,
          replies: Number(t.replies) || 0,
          views: Number(t.views) || 0,
          likes: Number(t.likes) || 0
        })));
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch topics", err);
      setTopics([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data.map((c: Category) => ({...c, count: Number(c.count) || 0})) : []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/tags`);
      if (res.ok) {
        const data = await res.json();
        setTags(Array.isArray(data) ? data.map((t: Tag) => ({...t, count: Number(t.count) || 0})) : []);
      }
    } catch (err) {
      console.error("Failed to fetch tags", err);
      setTags([]);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/activity`);
      if (res.ok) {
        const data = await res.json();
        setActivity(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
      setActivity([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !advancedFilters.tag && !advancedFilters.author && !advancedFilters.status && !advancedFilters.dateFrom) {
      fetchTopics();
      return;
    }
    
    try {
      let url = `${API_BASE_URL}/api/community/search?q=${encodeURIComponent(searchQuery || '')}`;
      if (advancedFilters.tag) url += `&tag=${encodeURIComponent(advancedFilters.tag)}`;
      if (advancedFilters.author) url += `&author=${encodeURIComponent(advancedFilters.author)}`;
      if (advancedFilters.dateFrom) url += `&dateFrom=${advancedFilters.dateFrom}`;
      if (advancedFilters.dateTo) url += `&dateTo=${advancedFilters.dateTo}`;
      if (advancedFilters.status) url += `&status=${advancedFilters.status}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const topicsData = Array.isArray(data) ? data : [];
        setTopics(topicsData.map((t: Topic) => ({
          ...t,
          replies: Number(t.replies) || 0,
          views: Number(t.views) || 0,
          likes: Number(t.likes) || 0
        })));
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Search failed", err);
      setTopics([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      setAnnouncements([]);
    }
  };





  const viewTopic = (topicId: number) => {
    navigate(`/community/topic/${topicId}`);
  };

  const handleVoteTopic = async (topicId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${topicId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });

      if (res.ok) {
        fetchTopics(); // Refresh topics to show updated vote counts
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to vote", err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const uploadTopicMedia = async (topicId: number, file: File) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append('media', file);
      formData.append('topicId', topicId.toString());

      const res = await fetch(`${API_BASE_URL}/api/community/topics/${topicId}/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        console.error('Failed to upload media');
      }
    } catch (err) {
      console.error('Error uploading media:', err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.category || !newTopic.description.trim()) {
      alert(isArabic ? "الرجاء ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول" : "Please login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTopic.title,
          category: newTopic.category,
          description: newTopic.description,
          tags: newTopic.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Upload media if selected
        if (selectedFile && data.topicId) {
          await uploadTopicMedia(data.topicId, selectedFile);
        }
        
        setShowCreateModal(false);
        setNewTopic({ title: "", category: "", description: "", tags: "" });
        setSelectedFile(null);
        setFilePreview(null);
        fetchTopics(); // Refresh topics list
        alert(isArabic ? "تم إنشاء الموضوع بنجاح!" : "Topic created successfully!");
      } else {
        const error = await res.json();
        alert(isArabic ? `فشل: ${error.error}` : `Failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to create topic", err);
      alert(isArabic ? "حدث خطأ" : "An error occurred");
    }
  };

  return (
    <div className={`community-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="community-container">
        {/* Sidebar */}
        <aside className="community-sidebar">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="sidebar-card announcements-card">
              <h3>{isArabic ? " الإعلانات" : " Announcements"}</h3>
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
                    {act.type === 'topic' ? 'T' : 'R'}
                  </span>
                  <div>
                    <strong>{act.author}</strong>
                    <p>{act.content.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
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
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                + {isArabic ? "موضوع جديد" : "New Topic"}
              </button>
              {JSON.parse(localStorage.getItem("user") || '{}').role === 'Admin' && (
                <button className="btn-primary" onClick={() => navigate("/community/announcement/create")}>
                   {isArabic ? "إعلان" : "Announcement"}
                </button>
              )}
            </div>
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
              <button onClick={handleSearch}>{isArabic ? 'بحث' : 'Search'}</button>
              <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="advanced-search-btn">
                {isArabic ? "بحته متقدم" : "Advanced"}
              </button>
            </div>
            
            {showAdvancedSearch && (
              <div className="advanced-search-panel">
                <input
                  type="text"
                  placeholder={isArabic ? "وسم" : "Tag"}
                  value={advancedFilters.tag}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, tag: e.target.value })}
                />
                <input
                  type="text"
                  placeholder={isArabic ? "اسم المؤلف" : "Author"}
                  value={advancedFilters.author}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, author: e.target.value })}
                />
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                />
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                />
                <select
                  value={advancedFilters.status}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, status: e.target.value })}
                >
                  <option value="">{isArabic ? "كل الحالات" : "All Status"}</option>
                  <option value="open">{isArabic ? "مفتوح" : "Open"}</option>
                  <option value="solved">{isArabic ? "محلول" : "Solved"}</option>
                  <option value="closed">{isArabic ? "مغلق" : "Closed"}</option>
                </select>
                <button onClick={handleSearch} className="search-filters-btn">
                  {isArabic ? "بحث" : "Search"}
                </button>
                <button onClick={() => {
                  setAdvancedFilters({ tag: "", author: "", dateFrom: "", dateTo: "", status: "" });
                  setSearchQuery("");
                  fetchTopics();
                }} className="clear-filters-btn">
                  {isArabic ? "مسح" : "Clear"}
                </button>
              </div>
            )}

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
                <button onClick={() => setShowCreateModal(true)}>
                  {isArabic ? "كن أول من ينشر!" : "Be the first to post!"}
                </button>
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="topic-card" onClick={() => viewTopic(topic.id)}>
                  <div className="topic-content">
                    <h3>{topic.title}</h3>
                    <p>{(topic.description || '').replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                    
                    {/* Media Preview */}
                    {topic.image_url && (
                      <div className="topic-media-preview">
                        <img 
                          src={topic.image_url.startsWith('http') ? topic.image_url : `${API_BASE_URL}${topic.image_url}`}
                          alt={topic.title}
                          className="topic-thumbnail"
                        />
                      </div>
                    )}
                    {topic.video_url && (
                      <div className="topic-media-preview">
                        <video 
                          src={topic.video_url.startsWith('http') ? topic.video_url : `${API_BASE_URL}${topic.video_url}`}
                          className="topic-thumbnail"
                          muted
                        />
                        <div className="video-overlay">
                          <span className="play-icon">▶</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="topic-meta">
                      {topic.category && <span className="category-badge">{topic.category}</span>}
                      <span>{isArabic ? "بواسطة" : "by"} {topic.author_name}</span>
                      <span>{timeAgo(topic.created_at, isArabic)}</span>
                    </div>
                  </div>
                  <div className="topic-stats">
                    <div className="vote-section">
                      <button 
                        className="vote-btn upvote-btn" 
                        onClick={(e) => { e.stopPropagation(); handleVoteTopic(topic.id, 'up'); }}
                      >
                        ▲
                      </button>
                      <span className="vote-count">{topic.likes || 0}</span>
                      <button 
                        className="vote-btn downvote-btn" 
                        onClick={(e) => { e.stopPropagation(); handleVoteTopic(topic.id, 'down'); }}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="stat">
                      <span className="stat-label">{isArabic ? 'ردود' : 'Replies'}</span>
                      <span>{topic.replies}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">{isArabic ? 'مشاهدات' : 'Views'}</span>
                      <span>{topic.views}</span>
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

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-topic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isArabic ? "إنشاء موضوع جديد" : "Create New Topic"}</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="create-topic-form">
              <div className="form-group">
                <label>{isArabic ? "العنوان" : "Title"} *</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  placeholder={isArabic ? "اكتب عنوان الموضوع..." : "Enter topic title..."}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "الفئة" : "Category"} *</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                  required
                >
                  <option value="">{isArabic ? "اختر فئة" : "Select category"}</option>
                  <option value="General">{isArabic ? "عام" : "General"}</option>
                  <option value="Courses">{isArabic ? "الدورات" : "Courses"}</option>
                  <option value="Mentorship">{isArabic ? "الإرشاد" : "Mentorship"}</option>
                  <option value="Career">{isArabic ? "المهنة" : "Career"}</option>
                  <option value="Technology">{isArabic ? "التكنولوجيا" : "Technology"}</option>
                  <option value="Business">{isArabic ? "الأعمال" : "Business"}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "الوصف" : "Description"} *</label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                  placeholder={isArabic ? "اكتب وصف الموضوع..." : "Write topic description..."}
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "الوسوم (اختياري)" : "Tags (optional)"}</label>
                <input
                  type="text"
                  value={newTopic.tags}
                  onChange={(e) => setNewTopic({...newTopic, tags: e.target.value})}
                  placeholder={isArabic ? "وسم1، وسم2، وسم3" : "tag1, tag2, tag3"}
                />
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "إضافة صورة أو فيديو (اختياري)" : "Add Image or Video (optional)"}</label>
                <div className="media-upload-area">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="upload-button">
                    {isArabic ? "اختر ملف" : "Choose File"}
                  </label>
                  
                  {selectedFile && (
                    <div className="file-preview">
                      <div className="file-info">
                        <span>{selectedFile.name}</span>
                        <button type="button" onClick={removeFile} className="remove-file">×</button>
                      </div>
                      
                      {filePreview && (
                        <div className="preview-container">
                          {selectedFile.type.startsWith('image/') ? (
                            <img src={filePreview} alt="Preview" className="media-preview" />
                          ) : selectedFile.type.startsWith('video/') ? (
                            <video src={filePreview} controls className="media-preview" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {isArabic ? "إنشاء الموضوع" : "Create Topic"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
