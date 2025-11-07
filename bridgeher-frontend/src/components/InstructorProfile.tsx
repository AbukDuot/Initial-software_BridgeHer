import React from "react";
import "../styles/instructorProfile.css";

interface InstructorProfileProps {
  name?: string;
  avatar?: string;
  bio?: string;
  credentials?: string;
  expertise?: string;
  language: string;
}

const InstructorProfile: React.FC<InstructorProfileProps> = ({
  name,
  avatar,
  bio,
  credentials,
  expertise,
  language
}) => {
  const isArabic = language === "Arabic";

  if (!name) return null;

  return (
    <div className="instructor-profile">
      <h3>{isArabic ? "المدرب" : "Instructor"}</h3>
      
      <div className="instructor-card">
        <div className="instructor-avatar-container">
          {avatar ? (
            <img src={avatar} alt={name} className="instructor-avatar" />
          ) : (
            <div className="instructor-avatar-placeholder"></div>
          )}
        </div>
        
        <div className="instructor-details">
          <h4>{name}</h4>
          {credentials && <p className="instructor-credentials">{credentials}</p>}
          {expertise && <p className="instructor-expertise"> {expertise}</p>}
          {bio && <p className="instructor-bio">{bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;
