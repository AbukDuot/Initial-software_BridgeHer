import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import { timeAgo } from "../utils/timeAgo";
import "../styles/userProfile.css";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_pic: string;
  created_at: string;
  bio?: string;
}

interface Topic {
  id: number;
  title: string;
  category: string;
  views: number;
  likes: number;
  replies: number;
  created_at: string;
}

interface Badge {
  badge_name: string;
  badge_icon: string;
  earned_at: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [user, setUser] = useState<UserData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState({ totalTopics: 0, totalReplies: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [userRes, topicsRes, statsRes, badgesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/${userId}`, { headers }),
        fetch(`${API_BASE_URL}/api/community/user/${userId}/topics`, { headers }),
        fetch(`${API_BASE_URL}/api/community/user/${userId}/stats`, { headers }),
        fetch(`${API_BASE_URL}/api/users/${userId}/badges`, { headers })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData);
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  if (!user) return <div className="error">{isArabic ? "المستخدم غير موجود" : "User not found"}</div>;

  return (
    <div className={`user-profile ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← {isArabic ? "رجوع" : "Back"}
      </button>

      <div className="profile-header">
        <img 
          src={user.profile_pic || "/default-profile.png"} 
          alt={user.name}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="role-badge">{user.role}</p>
          <p className="join-date">
            {isArabic ? "انضم في" : "Joined"} {new Date(user.created_at).toLocaleDateString()}
          </p>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>{stats.totalTopics}</h3>
          <p>{isArabic ? "المواضيع" : "Topics"}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalReplies}</h3>
          <p>{isArabic ? "الردود" : "Replies"}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalLikes}</h3>
          <p>{isArabic ? "الإعجابات" : "Likes Received"}</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="badges-section">
          <h2>{isArabic ? "الشارات" : "Badges"}</h2>
          <div className="badges-grid">
            {badges.map((badge, idx) => (
              <div key={idx} className="badge-item">
                <span className="badge-icon">{badge.badge_icon}</span>
                <span className="badge-name">{badge.badge_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="topics-section">
        <h2>{isArabic ? "المواضيع" : "Topics"}</h2>
        {topics.length === 0 ? (
          <p className="empty-state">{isArabic ? "لا توجد مواضيع بعد" : "No topics yet"}</p>
        ) : (
          <div className="topics-list">
            {topics.map((topic) => (
              <div 
                key={topic.id} 
                className="topic-card"
                onClick={() => navigate(`/community/topic/${topic.id}`)}
              >
                <h3>{topic.title}</h3>
                <div className="topic-meta">
                  <span className="category">{topic.category}</span>
                  <span>👁️ {topic.views}</span>
                  <span>❤️ {topic.likes}</span>
                  <span>💬 {topic.replies}</span>
                  <span>{timeAgo(topic.created_at, isArabic)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
