import React from "react";
import { Link } from "react-router-dom";
import "../styles/enhancedCourseCard.css";

interface CourseCardProps {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor?: string;
  instructorAvatar?: string;
  thumbnail?: string;
  rating?: number;
  totalReviews?: number;
  totalEnrolled?: number;
  enrolled?: boolean;
  progress?: number;
  language: string;
  onEnroll?: (id: number) => void;
  onPreview?: (id: number) => void;
}

const EnhancedCourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  titleAr,
  description,
  category,
  level,
  duration,
  instructor,
  instructorAvatar,
  thumbnail,
  rating = 4.8,
  totalReviews = 0,
  totalEnrolled = 0,
  enrolled = false,
  progress = 0,
  language,
  onEnroll,
  onPreview
}) => {
  const isArabic = language === "Arabic";
  const displayTitle = isArabic && titleAr ? titleAr : title;

  return (
    <div className="enhanced-course-card">
      <div className="course-thumbnail" style={{ backgroundImage: thumbnail ? `url(${thumbnail})` : 'linear-gradient(135deg, #4A148C 0%, #FFD700 100%)' }}>
        <span className="category-badge">{category}</span>
        <span className="level-badge">{level}</span>
        {!thumbnail && <span className="icon">📚</span>}
      </div>

      <div className="course-body">
        <h3 className="course-title">{displayTitle}</h3>
        
        {instructor && (
          <div className="instructor-info">
            {instructorAvatar && <img src={instructorAvatar} alt={instructor} className="instructor-avatar-sm" />}
            <span>👨‍🏫 {instructor}</span>
          </div>
        )}

        <p className="course-description">{description.substring(0, 100)}...</p>

        <div className="course-meta">
          <span>⏱️ {duration}</span>
          <span>📊 {level}</span>
          <span>⭐ {rating} ({totalReviews})</span>
        </div>

        {totalEnrolled > 0 && (
          <div className="enrollment-count">
            👥 {totalEnrolled.toLocaleString()} {isArabic ? "طالب" : "students"}
          </div>
        )}

        {enrolled && progress > 0 && (
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% {isArabic ? "مكتمل" : "complete"}</span>
          </div>
        )}
      </div>

      <div className="course-footer">
        <div className="course-price">
          {enrolled ? (
            <span className="enrolled-badge">✅ {isArabic ? "مسجل" : "Enrolled"}</span>
          ) : (
            <span className="price-tag">{isArabic ? "مجاني" : "Free"}</span>
          )}
        </div>

        <div className="course-actions">
          {!enrolled && onPreview && (
            <button onClick={() => onPreview(id)} className="preview-btn">
              👁️ {isArabic ? "معاينة" : "Preview"}
            </button>
          )}
          
          {enrolled ? (
            <Link to={`/course-player/${id}`} className="continue-btn">
              {isArabic ? "متابعة" : "Continue"}
            </Link>
          ) : onEnroll ? (
            <button onClick={() => onEnroll(id)} className="enroll-btn">
              {isArabic ? "التسجيل" : "Enroll"}
            </button>
          ) : (
            <Link to={`/course/${id}`} className="view-btn">
              {isArabic ? "عرض" : "View"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseCard;
