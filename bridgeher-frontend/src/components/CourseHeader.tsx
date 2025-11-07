import React from "react";
import "../styles/courseHeader.css";

interface CourseHeaderProps {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  level: string;
  duration: string;
  weeks?: number;
  hoursPerWeek?: number;
  estimatedHours?: number;
  rating?: number;
  totalReviews?: number;
  totalEnrolled?: number;
  lastUpdated?: string;
  language: string;
  bannerUrl?: string;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  titleAr,
  description,
  descriptionAr,
  category,
  level,
  duration: _duration,
  weeks = 4,
  hoursPerWeek = 3,
  estimatedHours,
  rating = 4.8,
  totalReviews = 0,
  totalEnrolled = 0,
  lastUpdated,
  language,
  bannerUrl
}) => {
  const isArabic = language === "Arabic";
  const displayTitle = isArabic && titleAr ? titleAr : title;
  const displayDescription = isArabic && descriptionAr ? descriptionAr : description;

  return (
    <div className="course-header-section" style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(135deg, #4A148C 0%, #FFD700 100%)' }}>
      <div className="course-header-overlay">
        <div className="course-header-content">
          <div className="course-badges">
            <span className="badge-category">{category}</span>
            <span className="badge-level">{level}</span>
          </div>
          
          <h1 className="course-main-title">{displayTitle}</h1>
          <p className="course-main-description">{displayDescription}</p>
          
          <div className="course-header-meta">
            <div className="meta-item">
              <span className="meta-icon">⭐</span>
              <span>{rating} ({totalReviews.toLocaleString()} {isArabic ? "تقييم" : "reviews"})</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span>{totalEnrolled.toLocaleString()} {isArabic ? "طالب" : "students"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>{estimatedHours || (weeks * hoursPerWeek)} {isArabic ? "ساعة" : "hours"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{weeks} {isArabic ? "أسابيع" : "weeks"}, {hoursPerWeek} {isArabic ? "ساعات/أسبوع" : "hrs/week"}</span>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="last-updated">
              {isArabic ? "آخر تحديث:" : "Last updated:"} {new Date(lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
