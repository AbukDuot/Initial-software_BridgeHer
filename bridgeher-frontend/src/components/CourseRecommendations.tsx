import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/courseRecommendations.css';

interface RecommendedCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  image?: string;
  average_rating?: number;
  total_reviews?: number;
  similarity_score: number;
}

interface CourseRecommendationsProps {
  courseId: string;
}

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ courseId }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [courseId]);

  const loadRecommendations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/recommendations`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    youMightAlsoLike: isAr ? 'قد تعجبك أيضاً' : 'You might also like',
    viewCourse: isAr ? 'عرض الدورة' : 'View Course',
    reviews: isAr ? 'مراجعة' : 'reviews',
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <section className={`course-recommendations ${isAr ? 'rtl' : ''}`}>
      <h3>{t.youMightAlsoLike}</h3>
      <div className="recommendations-grid">
        {recommendations.map((course) => (
          <div key={course.id} className="recommendation-card" onClick={() => navigate(`/course/${course.id}`)}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <div className="course-meta">
              <span>{course.level}</span>
              {course.average_rating && (
                <span>⭐ {course.average_rating.toFixed(1)}</span>
              )}
            </div>
            <button className="view-btn">{t.viewCourse}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseRecommendations;