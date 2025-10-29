import React, { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import Certificate from "../components/Certificate";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/myCertificates.css";

interface CertificateData {
  id: string;
  learnerName: string;
  courseTitle: string;
  mentor: string;
  date: string;
  score?: number;
}

const MyCertificates: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/courses/my/certificates", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCertificates(data.map((cert: any) => ({
            id: cert.id.toString(),
            learnerName: cert.user_name,
            courseTitle: cert.course_title,
            mentor: cert.category || "BridgeHer",
            date: cert.issued_at,
            score: cert.score
          })));
        }
      } catch (err) {
        console.error("Failed to fetch certificates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" message={isArabic ? "جارٍ التحميل..." : "Loading..."} />;
  }

  if (selectedCert) {
    return (
      <div className="certificates-page">
        <button className="btn-back" onClick={() => setSelectedCert(null)}>
          ← {isArabic ? "عودة" : "Back"}
        </button>
        <Certificate
          userName={selectedCert.learnerName}
          courseName={selectedCert.courseTitle}
          completionDate={selectedCert.date}
          score={selectedCert.score}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className={`certificates-page ${isArabic ? "rtl" : ""}`}>
      <h2>{isArabic ? "شهاداتي" : "My Certificates"}</h2>
      {certificates.length === 0 ? (
        <div className="no-certificates">
          <p>{isArabic ? "لم تحصل على شهادات بعد" : "No certificates earned yet."}</p>
          <p className="hint">{isArabic ? "أكمل دورة للحصول على شهادتك الأولى!" : "Complete a course to earn your first certificate!"}</p>
        </div>
      ) : (
        <div className="cert-grid">
          {certificates.map((cert) => (
            <div className="cert-card" key={cert.id}>
              <div className="cert-icon">🎓</div>
              <h3>{cert.courseTitle}</h3>
              <p className="cert-info">
                <strong>{isArabic ? "المرشد:" : "Mentor:"}</strong> {cert.mentor}
              </p>
              <p className="cert-info">
                <strong>{isArabic ? "التاريخ:" : "Date:"}</strong>{" "}
                {new Date(cert.date).toLocaleDateString(isArabic ? "ar" : "en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {cert.score && (
                <p className="cert-score">
                  {isArabic ? "النتيجة:" : "Score:"} {cert.score}%
                </p>
              )}
              <button className="view-btn" onClick={() => setSelectedCert(cert)}>
                {isArabic ? "عرض الشهادة" : "View Certificate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
