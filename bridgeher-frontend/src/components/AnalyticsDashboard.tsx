import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/analytics.css';

interface AnalyticsProps {
  userRole?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ userRole = 'admin' }) => {
  const { language } = useLanguage();

  const stats = {
    totalUsers: 1247,
    activeCourses: 45,
    completionRate: 78,
    avgEngagement: 85,
    monthlyGrowth: 23,
    certificatesIssued: 892
  };

  const courseData = [
    { name: language === 'ar' ? 'التمويل' : 'Finance', completion: 85, enrolled: 320 },
    { name: language === 'ar' ? 'الأعمال' : 'Business', completion: 72, enrolled: 280 },
    { name: language === 'ar' ? 'التكنولوجيا' : 'Technology', completion: 68, enrolled: 250 },
    { name: language === 'ar' ? 'القيادة' : 'Leadership', completion: 80, enrolled: 290 }
  ];

  const engagementData = [
    { month: language === 'ar' ? 'يناير' : 'Jan', users: 120 },
    { month: language === 'ar' ? 'فبراير' : 'Feb', users: 180 },
    { month: language === 'ar' ? 'مارس' : 'Mar', users: 250 },
    { month: language === 'ar' ? 'أبريل' : 'Apr', users: 320 },
    { month: language === 'ar' ? 'مايو' : 'May', users: 420 },
    { month: language === 'ar' ? 'يونيو' : 'Jun', users: 520 }
  ];

  return (
    <div className="analytics-dashboard">
      <h1>{language === 'ar' ? 'لوحة التحليلات' : 'Analytics Dashboard'}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">{language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.activeCourses}</div>
          <div className="stat-label">{language === 'ar' ? 'الدورات النشطة' : 'Active Courses'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">{language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">+{stats.monthlyGrowth}%</div>
          <div className="stat-label">{language === 'ar' ? 'النمو الشهري' : 'Monthly Growth'}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>{language === 'ar' ? 'معدلات إكمال الدورات' : 'Course Completion Rates'}</h3>
          <div className="bar-chart">
            {courseData.map((course, idx) => (
              <div key={idx} className="bar-item">
                <div className="bar-label">{course.name}</div>
                <div className="bar-wrapper">
                  <div className="bar-fill" style={{ width: `${course.completion}%` }}>
                    <span className="bar-value">{course.completion}%</span>
                  </div>
                </div>
                <div className="bar-info">{course.enrolled} {language === 'ar' ? 'مسجل' : 'enrolled'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>{language === 'ar' ? 'اتجاه مشاركة المستخدمين' : 'User Engagement Trend'}</h3>
          <div className="line-chart">
            {engagementData.map((data, idx) => (
              <div key={idx} className="line-item">
                <div className="line-bar" style={{ height: `${(data.users / 600) * 100}%` }}>
                  <span className="line-value">{data.users}</span>
                </div>
                <div className="line-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>{language === 'ar' ? 'الرؤى الرئيسية' : 'Key Insights'}</h3>
        <ul>
          <li>✨ {language === 'ar' ? 'معدل إكمال الدورات أعلى بنسبة 15٪ من المتوسط' : 'Course completion rate is 15% above average'}</li>
          <li>📊 {language === 'ar' ? 'نمو المستخدمين زاد بنسبة 23٪ هذا الشهر' : 'User growth increased by 23% this month'}</li>
          <li>🎓 {language === 'ar' ? 'تم إصدار 892 شهادة حتى الآن' : '892 certificates issued to date'}</li>
          <li>⭐ {language === 'ar' ? 'متوسط التقييم 4.7/5 عبر جميع الدورات' : 'Average rating of 4.7/5 across all courses'}</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
