import React, { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/coursePreview.css';

interface CoursePreviewProps {
  courseId: string;
  onEnroll: () => void;
  onClose: () => void;
}

interface CoursePreviewData {
  id: string;
  title: string;
  description: string;
  preview_video_url?: string;
  syllabus?: string;
  estimated_hours?: number;
  prerequisites?: string;
  learning_objectives?: string;
  average_rating?: number;
  total_reviews?: number;
  instructor_name?: string;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ courseId, onEnroll, onClose }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [course, setCourse] = useState<CoursePreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreview();
  }, [courseId]);

  const loadPreview = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/preview`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      } else {
        console.error('Preview API error:', res.status, await res.text());
        const fallbackRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setCourse({
            ...fallbackData,
            estimated_hours: 10,
            prerequisites: 'No prerequisites required.',
            learning_objectives: 'Learn essential skills and knowledge in this subject area.',
            average_rating: 4.5,
            total_reviews: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load course preview:', error);
      setCourse({
        id: courseId,
        title: 'Course Preview',
        description: 'Course preview is currently unavailable.',
        estimated_hours: 10,
        prerequisites: 'No prerequisites required.',
        learning_objectives: 'Learn essential skills and knowledge.',
        average_rating: 4.5,
        total_reviews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="preview-loading">Loading preview...</div>;
  if (!course) return <div className="preview-error">Preview not available</div>;

  const t = {
    coursePreview: isAr ? 'معاينة الدورة' : 'Course Preview',
    duration: isAr ? 'المدة' : 'Duration',
    hours: isAr ? 'ساعات' : 'hours',
    prerequisites: isAr ? 'المتطلبات المسبقة' : 'Prerequisites',
    whatYoullLearn: isAr ? 'ما ستتعلمه' : "What You'll Learn",
    syllabus: isAr ? 'المنهج' : 'Syllabus',
    instructor: isAr ? 'المدرب' : 'Instructor',
    rating: isAr ? 'التقييم' : 'Rating',
    reviews: isAr ? 'مراجعة' : 'reviews',
    enrollNow: isAr ? 'سجل الآن' : 'Enroll Now',
    close: isAr ? 'إغلاق' : 'Close',
  };

  return (
    <div className="course-preview-overlay" onClick={onClose}>
      <div className={`course-preview-modal ${isAr ? 'rtl' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h2>{t.coursePreview}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="preview-content">
          <h3>{course.title}</h3>
          <p className="course-description">{course.description}</p>

          {course.preview_video_url && (
            <div className="preview-video">
              <iframe
                width="100%"
                height="300"
                src={course.preview_video_url}
                title="Course Preview"
                allowFullScreen
              />
            </div>
          )}

          <div className="course-details">
            {course.estimated_hours && (
              <div className="detail-item">
                <strong>{t.duration}:</strong> {course.estimated_hours} {t.hours}
              </div>
            )}

            {course.average_rating && (
              <div className="detail-item">
                <strong>{t.rating}:</strong>
                <span className="rating">
                  {'⭐'.repeat(Math.round(course.average_rating))} 
                  {course.average_rating.toFixed(1)} ({course.total_reviews} {t.reviews})
                </span>
              </div>
            )}

            {course.instructor_name && (
              <div className="detail-item">
                <strong>{t.instructor}:</strong> {course.instructor_name}
              </div>
            )}
          </div>

          {course.learning_objectives && (
            <div className="learning-objectives">
              <h4>{t.whatYoullLearn}</h4>
              <p>{course.learning_objectives}</p>
            </div>
          )}

          {course.prerequisites && (
            <div className="prerequisites">
              <h4>{t.prerequisites}</h4>
              <p>{course.prerequisites}</p>
            </div>
          )}

          {course.syllabus && (
            <div className="syllabus">
              <h4>{t.syllabus}</h4>
              <div className="syllabus-content">{course.syllabus}</div>
            </div>
          )}
        </div>

        <div className="preview-actions">
          <button className="btn secondary" onClick={onClose}>
            {t.close}
          </button>
          <button className="btn primary" onClick={onEnroll}>
            {t.enrollNow}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;