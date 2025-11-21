import React from "react";
import "../styles/certificate.css";

interface CertificateProps {
  userName: string;
  courseName: string;
  completionDate: string;
  score?: number;
  language: string;
}

const Certificate: React.FC<CertificateProps> = ({
  userName,
  courseName,
  completionDate,
  score,
  language,
}) => {
  const isArabic = language === "Arabic";

  const downloadCertificate = () => {
    const certificate = document.getElementById("certificate");
    if (!certificate) return;

    
    import("html2canvas").then((html2canvas) => {
      html2canvas.default(certificate, {
        scale: 2,
        backgroundColor: "#ffffff",
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `BridgeHer_Certificate_${userName.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  };

  const shareCertificate = (platform: string) => {
    const text = isArabic
      ? `لقد أكملت دورة ${courseName} على منصة BridgeHer! 🎓`
      : `I completed ${courseName} on BridgeHer! 🎓`;
    
    const url = window.location.href;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="certificate-container">
      <div id="certificate" className={`certificate ${isArabic ? "rtl" : ""}`}>
        <div className="certificate-border">
          <div className="certificate-content">
            <div className="certificate-logo">
              <h1>BridgeHer</h1>
              <p className="tagline">
                {isArabic ? "تمكين المرأة من خلال التعليم" : "Empowering Women Through Education"}
              </p>
            </div>

            <div className="certificate-title">
              <h2>{isArabic ? "شهادة إتمام" : "Certificate of Completion"}</h2>
            </div>

            <div className="certificate-body">
              <p className="presented-to">
                {isArabic ? "تُمنح هذه الشهادة إلى" : "This certificate is proudly presented to"}
              </p>
              <h3 className="recipient-name">{userName}</h3>
              
              <p className="completion-text">
                {isArabic 
                  ? `لإتمام دورة`
                  : "for successfully completing the course"}
              </p>
              <h4 className="course-name">{courseName}</h4>

              <p className="date-text">
                {isArabic ? "تاريخ الإتمام: " : "Date of Completion: "}
                <strong>{new Date(completionDate).toLocaleDateString(isArabic ? "ar" : "en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</strong>
              </p>
            </div>

            <div className="certificate-footer">
              <div className="signature">
                <div className="signature-line"></div>
                <p>{isArabic ? "المؤسس" : "Founder"}</p>
                <p className="founder-name">Abuk Mayen Duot</p>
              </div>
              <div className="seal">
                <div className="seal-circle">
                  <span>✓</span>
                </div>
                <p>{isArabic ? "معتمد" : "Verified"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="certificate-actions">
        <button className="btn-download" onClick={downloadCertificate}>
          {isArabic ? "تحميل الشهادة" : "Download Certificate"}
        </button>
        
        <div className="share-buttons">
          <p>{isArabic ? "مشاركة على:" : "Share on:"}</p>
          <button className="btn-share twitter" onClick={() => shareCertificate("twitter")}>
            Twitter
          </button>
          <button className="btn-share facebook" onClick={() => shareCertificate("facebook")}>
            Facebook
          </button>
          <button className="btn-share linkedin" onClick={() => shareCertificate("linkedin")}>
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
