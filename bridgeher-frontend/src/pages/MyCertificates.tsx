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
        const res = await fetch(`${API_BASE_URL}/api/courses/my/certificates`, {
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
          <div className="empty-icon">📜</div>
          <h3>{isArabic ? "لا توجد شهادات" : "No Certificates Yet"}</h3>
          <p>{isArabic ? "أكمل دورة للحصول على شهادتك الأولى!" : "Complete a course to earn your first certificate!"}</p>
          <button className="btn primary" onClick={() => window.location.href = '/courses'}>
            {isArabic ? "تصفح الدورات" : "Browse Courses"}
          </button>
        </div>
      ) : (
        <div className="cert-grid">
          {certificates.map((cert) => (
            <div className="cert-card" key={cert.id}>
              <div className="cert-header">
                <div className="cert-icon">🏆</div>
                {cert.score && cert.score >= 90 && <div className="excellence-badge">{isArabic ? "ممتاز" : "Excellence"}</div>}
              </div>
              <h3>{cert.courseTitle}</h3>
              <div className="cert-details">
                <p className="cert-info">
                  <span className="label">{isArabic ? "المرشد:" : "Mentor:"}</span>
                  <span className="value">{cert.mentor}</span>
                </p>
                <p className="cert-info">
                  <span className="label">{isArabic ? "التاريخ:" : "Date:"}</span>
                  <span className="value">{new Date(cert.date).toLocaleDateString(isArabic ? "ar" : "en", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}</span>
                </p>
                {cert.score && (
                  <p className="cert-score">
                    <span className="score-value">{cert.score}%</span>
                    <span className="score-label">{isArabic ? "النتيجة" : "Score"}</span>
                  </p>
                )}
              </div>
              <button className="view-btn primary" onClick={() => setSelectedCert(cert)}>
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
