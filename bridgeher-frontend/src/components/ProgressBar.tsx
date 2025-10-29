import React from "react";
import "../styles/progressBar.css";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = "medium",
  color = "#6a1b9a",
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`progress-bar-container progress-${size}`}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${clampedProgress}%`,
            background: color,
          }}
        >
          {showLabel && clampedProgress > 10 && (
            <span className="progress-label">{clampedProgress}%</span>
          )}
        </div>
      </div>
      {showLabel && clampedProgress <= 10 && (
        <span className="progress-label-outside">{clampedProgress}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
