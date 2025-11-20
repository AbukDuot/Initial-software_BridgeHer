import React from "react";
import { Link } from "react-router-dom";
import "../styles/enhancedCourseCard.css";

interface CourseCardProps {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
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
  descriptionAr,
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
  
  const getArabicCourseTitle = (title: string) => {
    const titleMap: { [key: string]: string } = {
      'Financial Literacy Basics': 'أساسيات الثقافة المالية',
      'Entrepreneurship for Women': 'ريادة الأعمال للنساء',
      'Digital Skills for Beginners': 'المهارات الرقمية للمبتدئين',
      'Leadership & Communication': 'القيادة والتواصل',
      'Entrepreneurship 101': 'ريادة الأعمال 101'
    };
    return titleMap[title] || title;
  };
  
  const getArabicCourseDescription = (description: string) => {
    if (description.includes('Learn how to budget, save, and manage debt')) {
      return 'تعلم كيفية إعداد الميزانية والادخار وإدارة الديون بفعالية';
    }
    if (description.includes('Start and grow your own business')) {
      return 'ابدأ ونمِّ عملك الخاص باستخدام استراتيجيات بسيطة';
    }
    if (description.includes('Master essential computer')) {
      return 'أتقن أساسيات الحاسوب والإنترنت للنجاح';
    }
    if (description.includes('speaking') || description.includes('leadership')) {
      return 'طوري مهارات الخطابة والعمل الجماعي والقيادة.';
    }
    return description;
  };
  
  const getArabicCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Finance': 'المالية',
      'Business': 'الأعمال',
      'Tech': 'التكنولوجيا',
      'Leadership': 'القيادة'
    };
    return categoryMap[category] || category;
  };
  
  const getArabicLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'Beginner': 'مبتدئ',
      'Intermediate': 'متوسط',
      'Advanced': 'متقدم'
    };
    return levelMap[level] || level;
  };
  
  const getArabicDuration = (duration: string) => {
    if (duration.includes('week')) {
      const weeks = duration.match(/\d+/);
      return weeks ? `${weeks[0]} أسابيع` : duration;
    }
    if (duration.includes('month')) {
      const months = duration.match(/\d+/);
      return months ? `${months[0]} شهر` : duration;
    }
    if (duration.includes('hour')) {
      const hours = duration.match(/\d+/);
      return hours ? `${hours[0]} ساعة` : duration;
    }
    return duration;
  };
  
  const displayTitle = isArabic ? (titleAr || getArabicCourseTitle(title)) : title;
  const displayDescription = isArabic ? (descriptionAr || getArabicCourseDescription(description)) : description;

  return (
    <div className="enhanced-course-card">
      <div className="course-thumbnail" style={{ backgroundImage: thumbnail ? `url(${thumbnail})` : 'linear-gradient(135deg, #4A148C 0%, #FFD700 100%)' }}>
        <span className="category-badge">{isArabic ? getArabicCategory(category) : category}</span>
        <span className="level-badge">{isArabic ? getArabicLevel(level) : level}</span>
        {!thumbnail && <span className="icon"></span>}
      </div>

      <div className="course-body">
        <h3 className="course-title">{displayTitle}</h3>
        
        {instructor && (
          <div className="instructor-info">
            {instructorAvatar && <img src={instructorAvatar} alt={instructor} className="instructor-avatar-sm" />}
            <span> {instructor}</span>
          </div>
        )}

        <p className="course-description">{displayDescription.substring(0, 100)}...</p>

        <div className="course-meta">
          <span>⏱ {isArabic ? getArabicDuration(duration) : duration}</span>
          <span> {isArabic ? getArabicLevel(level) : level}</span>
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
            <span className="enrolled-badge"> {isArabic ? "مسجل" : "Enrolled"}</span>
          ) : (
            <span className="price-tag">{isArabic ? "مجاني" : "Free"}</span>
          )}
        </div>

        <div className="course-actions">
          {!enrolled && onPreview && (
            <button onClick={() => onPreview(id)} className="preview-btn preview-btn-small">
               {isArabic ? "معاينة" : "Preview"}
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
