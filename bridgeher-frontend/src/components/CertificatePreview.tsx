import React from "react";
import "../styles/certificatePreview.css";

interface CertificatePreviewProps {
  learnerName: string;
  courseTitle: string;
  mentor: string;
  date: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  learnerName,
  courseTitle,
  mentor,
  date,
}) => {
  return (
    <div className="certificate-card">
      <div className="certificate-header">BridgeHer Certificate of Completion</div>
      <div className="certificate-body">
        <p>This certifies that <strong>{learnerName}</strong></p>
        <p>has successfully completed the course:</p>
        <h4>{courseTitle}</h4>
        <p>Mentor: {mentor}</p>
        <p className="date">Date: {date}</p>
      </div>
      <div className="certificate-actions">
        <button className="btn download">⬇ Download</button>
        <button className="btn share">Share</button>
      </div>
    </div>
  );
};

module.exports = CertificatePreview;
