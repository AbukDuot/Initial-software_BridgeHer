import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/analytics.css';

const AnalyticsDashboard: React.FC = () => {
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
    { name: language === 'Arabic' ? 'التمويل' : 'Finance', completion: 85, enrolled: 320 },
    { name: language === 'Arabic' ? 'الأعمال' : 'Business', completion: 72, enrolled: 280 },
    { name: language === 'Arabic' ? 'التكنولوجيا' : 'Technology', completion: 68, enrolled: 250 },
    { name: language === 'Arabic' ? 'القيادة' : 'Leadership', completion: 80, enrolled: 290 }
  ];

  const engagementData = [
    { month: language === 'Arabic' ? 'يناير' : 'Jan', users: 120 },
    { month: language === 'Arabic' ? 'فبراير' : 'Feb', users: 180 },
    { month: language === 'Arabic' ? 'مارس' : 'Mar', users: 250 },
    { month: language === 'Arabic' ? 'أبريل' : 'Apr', users: 320 },
    { month: language === 'Arabic' ? 'مايو' : 'May', users: 420 },
    { month: language === 'Arabic' ? 'يونيو' : 'Jun', users: 520 }
  ];

  return (
    <div className="analytics-dashboard">
      <h1>{language === 'Arabic' ? 'لوحة التحليلات' : 'Analytics Dashboard'}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label">{language === 'Arabic' ? 'إجمالي المستخدمين' : 'Total Users'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.activeCourses}</div>
          <div className="stat-label">{language === 'Arabic' ? 'الدورات النشطة' : 'Active Courses'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">{language === 'Arabic' ? 'معدل الإكمال' : 'Completion Rate'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">+{stats.monthlyGrowth}%</div>
          <div className="stat-label">{language === 'Arabic' ? 'النمو الشهري' : 'Monthly Growth'}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>{language === 'Arabic' ? 'معدلات إكمال الدورات' : 'Course Completion Rates'}</h3>
          <div className="bar-chart">
            {courseData.map((course, idx) => (
              <div key={idx} className="bar-item">
                <div className="bar-label">{course.name}</div>
                <div className="bar-wrapper">
                  <div className="bar-fill" style={{ width: `${course.completion}%` }}>
                    <span className="bar-value">{course.completion}%</span>
                  </div>
                </div>
                <div className="bar-info">{course.enrolled} {language === 'Arabic' ? 'مسجل' : 'enrolled'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>{language === 'Arabic' ? 'اتجاه مشاركة المستخدمين' : 'User Engagement Trend'}</h3>
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
        <h3>{language === 'Arabic' ? 'الرؤى الرئيسية' : 'Key Insights'}</h3>
        <ul>
          <li>✨ {language === 'Arabic' ? 'معدل إكمال الدورات أعلى بنسبة 15٪ من المتوسط' : 'Course completion rate is 15% above average'}</li>
          <li>📊 {language === 'Arabic' ? 'نمو المستخدمين زاد بنسبة 23٪ هذا الشهر' : 'User growth increased by 23% this month'}</li>
          <li>🎓 {language === 'Arabic' ? 'تم إصدار 892 شهادة حتى الآن' : '892 certificates issued to date'}</li>
          <li>⭐ {language === 'Arabic' ? 'متوسط التقييم 4.7/5 عبر جميع الدورات' : 'Average rating of 4.7/5 across all courses'}</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
