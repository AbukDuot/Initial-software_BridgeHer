import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/certificate.css";
import { useLanguage } from "../hooks/useLanguage";

interface CertificateProps {
  name: string;
  courseTitle: string;
  score: number;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ name, courseTitle, score, onClose }) => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";
  const certRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${name.replace(/\s+/g, "_")}_Certificate.pdf`);
  };

  return (
    <div className={`certificate-modal ${isArabic ? "rtl" : ""}`}>
      <div className="certificate-card" ref={certRef}>
        <h1 className="cert-title">
          {isArabic ? "شهادة إتمام الدورة" : "Certificate of Completion"}
        </h1>

        <p className="cert-text">
          {isArabic
            ? `تُمنح هذه الشهادة إلى ${name} لإكماله بنجاح دورة "${courseTitle}" بدرجة ${score}٪.`
            : `This certificate is proudly presented to ${name} for successfully completing the course "${courseTitle}" with a score of ${score}%.`}
        </p>

        <div className="cert-seal"></div>

        <p className="cert-signature">{isArabic ? "منصة BridgeHer" : "BridgeHer Platform"}</p>
      </div>

      <div className="cert-buttons">
        <button onClick={handleDownloadPDF} className="btn primary">
          {isArabic ? "تنزيل PDF" : "Download PDF"}
        </button>
        <button onClick={onClose} className="btn secondary">
          {isArabic ? "إغلاق" : "Close"}
        </button>
      </div>
    </div>
  );
};

export default Certificate;
