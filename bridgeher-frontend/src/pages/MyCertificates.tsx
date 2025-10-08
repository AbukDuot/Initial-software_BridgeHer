import React, { useEffect, useState } from "react";
import "../styles/myCertificates.css";

interface Certificate {
  id: string;
  learnerName: string;
  courseTitle: string;
  mentor: string;
  date: string;
}

const MyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("certificate-"));
    const certs = keys.map((k) => JSON.parse(localStorage.getItem(k) || "{}"));
    setCertificates(certs);
  }, []);

  return (
    <div className="certificates-page">
      <h2>My Certificates</h2>
      {certificates.length === 0 ? (
        <p>No certificates earned yet.</p>
      ) : (
        <div className="cert-grid">
          {certificates.map((cert) => (
            <div className="cert-card" key={cert.id}>
              <h3>{cert.courseTitle}</h3>
              <p><strong>Learner:</strong> {cert.learnerName}</p>
              <p><strong>Mentor:</strong> {cert.mentor}</p>
              <p><strong>Date:</strong> {cert.date}</p>
              <a href={`/certificate/public/${cert.id}`} className="view-btn">View Certificate</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
