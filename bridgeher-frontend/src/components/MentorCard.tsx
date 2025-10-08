import React from "react";
import "../styles/mentor.css";

interface MentorCardProps {
  name: string;
  status: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ name, status }) => (
  <div className="mentor-card">
    <h4>{name}</h4>
    <p>{status}</p>
    <button className="btn-primary">Message</button>
  </div>
);

export default MentorCard;