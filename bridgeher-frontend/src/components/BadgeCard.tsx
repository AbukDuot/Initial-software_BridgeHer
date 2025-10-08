import React from "react";
import "../styles/badgeCard.css";

interface BadgeCardProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ title, description, icon, earned }) => {
  return (
    <div className={`badge-card ${earned ? "earned" : "locked"}`}>
      <div className="icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      {earned ? (
        <span className="status earned">Earned</span>
      ) : (
        <span className="status locked">Locked</span>
      )}
    </div>
  );
};

export default BadgeCard;