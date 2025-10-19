import React from "react";
import "../styles/achievements.css";

interface Achievement {
  id: number;
  title: string;
  description: string;
  progress: number;
  level: number;
  unlocked: boolean;
}

interface AchievementsProps {
  isAr?: boolean;
}

const Achievements: React.FC<AchievementsProps> = ({ isAr }) => {
  const t = {
    title: isAr ? "إنجازاتي" : "My Achievements",
    subtitle: isAr
      ? "تابع تقدمك واحتفل بإنجازاتك التعليمية 🎉"
      : "Track your progress and celebrate your learning milestones 🎉",
    next: isAr ? "الإنجاز التالي عند" : "Next achievement at",
    unlocked: isAr ? "تم الإنجاز" : "Unlocked",
    locked: isAr ? "قيد التقدم" : "In Progress",
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      title: isAr ? "المتعلمة النشطة" : "Active Learner",
      description: isAr
        ? "سجّلتِ الدخول لمدة 7 أيام متتالية"
        : "Logged in for 7 consecutive days",
      progress: 100,
      level: 1,
      unlocked: true,
    },
    {
      id: 2,
      title: isAr ? "صائدة النقاط" : "XP Collector",
      description: isAr
        ? "احصلي على 500 نقطة خبرة"
        : "Earn 500 XP points",
      progress: 75,
      level: 2,
      unlocked: false,
    },
    {
      id: 3,
      title: isAr ? "صديقة الإرشاد" : "Mentorship Connector",
      description: isAr
        ? "شاركي في 3 جلسات إرشادية"
        : "Participate in 3 mentorship sessions",
      progress: 40,
      level: 3,
      unlocked: false,
    },
  ];

  return (
    <section className={`achievements-section ${isAr ? "rtl" : ""}`}>
      <div className="achievements-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="achievements-grid">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`achievement-card ${a.unlocked ? "unlocked" : "locked"}`}
          >
            <div className="achievement-header">
              <div className="achievement-icon">
                {a.unlocked ? "" : ""}
              </div>
              <div className="achievement-info">
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${a.progress}%`,
                    backgroundColor: a.unlocked ? "#4CAF50" : "#6A1B9A",
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {a.unlocked
                  ? t.unlocked
                  : `${t.next} ${a.progress < 100 ? `${a.progress}%` : ""}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Achievements;
