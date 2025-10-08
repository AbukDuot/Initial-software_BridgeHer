import React from "react";
import "../styles/progressBar.css";

interface ProgressBarProps {
  course: string;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ course, progress }) => {
  return (
    <div className="progress-card">
      <h4 className="course-name">{course}</h4>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">{progress}% completed</p>
    </div>
  );
};

export default ProgressBar;
