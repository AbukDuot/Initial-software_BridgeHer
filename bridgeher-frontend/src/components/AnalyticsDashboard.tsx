import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/analyticsDashboard.css';

interface AnalyticsData {
  totalTimeSpent: number;
  coursesCompleted: number;
  coursesInProgress: number;
  averageProgress: number;
  weeklyActivity: number[];
  topCourses: Array<{
    id: number;
    title: string;
    progress: number;
    timeSpent: number;
  }>;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    earnedAt: string;
  }>;
}

interface AnalyticsDashboardProps {
  userId?: number;
  isInstructor?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId, isInstructor = false }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadAnalytics();
  }, [userId, timeRange]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isInstructor 
        ? `/api/analytics/instructor/${userId}?range=${timeRange}`
        : `/api/analytics/learner?range=${timeRange}`;
      
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        // Mock data for demo
        setAnalytics({
          totalTimeSpent: 1250,
          coursesCompleted: 3,
          coursesInProgress: 2,
          averageProgress: 68,
          weeklyActivity: [2, 4, 3, 5, 1, 6, 4],
          topCourses: [
            { id: 1, title: 'Financial Literacy', progress: 85, timeSpent: 420 },
            { id: 2, title: 'Entrepreneurship', progress: 60, timeSpent: 380 },
            { id: 3, title: 'Digital Skills', progress: 45, timeSpent: 280 }
          ],
          achievements: [
            { id: 1, title: 'First Course', description: 'Completed your first course', earnedAt: '2024-01-15' },
            { id: 2, title: 'Streak Master', description: '7 days learning streak', earnedAt: '2024-01-20' }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const t = {
    analytics: isAr ? 'التحليلات' : 'Analytics',
    totalTimeSpent: isAr ? 'إجمالي الوقت المستغرق' : 'Total Time Spent',
    coursesCompleted: isAr ? 'الدورات المكتملة' : 'Courses Completed',
    coursesInProgress: isAr ? 'الدورات قيد التقدم' : 'Courses In Progress',
    averageProgress: isAr ? 'متوسط التقدم' : 'Average Progress',
    weeklyActivity: isAr ? 'النشاط الأسبوعي' : 'Weekly Activity',
    topCourses: isAr ? 'أفضل الدورات' : 'Top Courses',
    achievements: isAr ? 'الإنجازات' : 'Achievements',
    thisWeek: isAr ? 'هذا الأسبوع' : 'This Week',
    thisMonth: isAr ? 'هذا الشهر' : 'This Month',
    thisYear: isAr ? 'هذا العام' : 'This Year',
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Failed to load analytics</div>;
  }

  return (
    <div className={`analytics-dashboard ${isAr ? 'rtl' : ''}`}>
      <div className="analytics-header">
        <h2>{t.analytics}</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="week">{t.thisWeek}</option>
          <option value="month">{t.thisMonth}</option>
          <option value="year">{t.thisYear}</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <h3>{formatTime(analytics.totalTimeSpent)}</h3>
            <p>{t.totalTimeSpent}</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{analytics.coursesCompleted}</h3>
            <p>{t.coursesCompleted}</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>{analytics.coursesInProgress}</h3>
            <p>{t.coursesInProgress}</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>{analytics.averageProgress}%</h3>
            <p>{t.averageProgress}</p>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-section">
          <h3>{t.weeklyActivity}</h3>
          <div className="activity-chart">
            {analytics.weeklyActivity.map((activity, index) => (
              <div key={index} className="activity-bar">
                <div 
                  className="bar-fill" 
                  style={{ height: `${(activity / 6) * 100}%` }}
                ></div>
                <span className="bar-label">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="top-courses-section">
          <h3>{t.topCourses}</h3>
          <div className="courses-list">
            {analytics.topCourses.map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p>{formatTime(course.timeSpent)}</p>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{course.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h3>{t.achievements}</h3>
        <div className="achievements-grid">
          {analytics.achievements.map((achievement) => (
            <div key={achievement.id} className="achievement-card">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-content">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <span className="achievement-date">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;