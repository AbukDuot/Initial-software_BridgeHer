import React from "react";
import "../styles/loading.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium", message }) => {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
