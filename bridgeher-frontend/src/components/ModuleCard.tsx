import React from "react";
import "../styles/modules.css";

interface ModuleCardProps {
  title: string;
  description: string;
  onView: () => void;
  language: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, onView, language }) => {
  const isArabic = language === "Arabic";

  return (
    <div className={`module-card ${isArabic ? "rtl" : ""}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="btn primary" onClick={onView}>
        {isArabic ? "عرض المحتوى" : "View Module"}
      </button>
    </div>
  );
};

export default ModuleCard;
