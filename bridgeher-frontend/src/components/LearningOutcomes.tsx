import React from "react";
import "../styles/learningOutcomes.css";

interface LearningOutcomesProps {
  objectives?: string;
  skillsGained?: string;
  careerBenefits?: string;
  realWorldApplications?: string;
  prerequisites?: string;
  language: string;
}

const LearningOutcomes: React.FC<LearningOutcomesProps> = ({
  objectives,
  skillsGained,
  careerBenefits,
  realWorldApplications,
  prerequisites,
  language
}) => {
  const isArabic = language === "Arabic";

  const parseList = (text?: string): string[] => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim());
  };

  return (
    <div className="learning-outcomes">
      {objectives && (
        <div className="outcome-section">
          <h3> {isArabic ? "ما ستتعلمه" : "What You'll Learn"}</h3>
          <ul>
            {parseList(objectives).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {skillsGained && (
        <div className="outcome-section">
          <h3> {isArabic ? "المهارات المكتسبة" : "Skills You'll Gain"}</h3>
          <div className="skills-tags">
            {parseList(skillsGained).map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {careerBenefits && (
        <div className="outcome-section">
          <h3> {isArabic ? "الفوائد المهنية" : "Career Benefits"}</h3>
          <ul>
            {parseList(careerBenefits).map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {realWorldApplications && (
        <div className="outcome-section">
          <h3> {isArabic ? "التطبيقات العملية" : "Real-World Applications"}</h3>
          <ul>
            {parseList(realWorldApplications).map((app, idx) => (
              <li key={idx}>{app}</li>
            ))}
          </ul>
        </div>
      )}

      {prerequisites && (
        <div className="outcome-section prerequisites">
          <h3> {isArabic ? "المتطلبات الأساسية" : "Prerequisites"}</h3>
          <p>{prerequisites}</p>
        </div>
      )}
    </div>
  );
};

export default LearningOutcomes;
