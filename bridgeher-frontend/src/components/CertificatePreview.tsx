import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/certificatePreview.css';

interface CertificatePreviewProps {
  courseName: string;
  userName: string;
  onClose: () => void;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ courseName, userName, onClose }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';

  const t = {
    certificateOfCompletion: isAr ? 'شهادة إتمام' : 'Certificate of Completion',
    thisIsToCertify: isAr ? 'هذا يشهد أن' : 'This is to certify that',
    hasSuccessfullyCompleted: isAr ? 'قد أتم بنجاح' : 'has successfully completed',
    issuedBy: isAr ? 'صادرة عن' : 'Issued by',
    bridgeHer: isAr ? 'بريدج هير' : 'BridgeHer',
    close: isAr ? 'إغلاق' : 'Close',
  };

  return (
    <div className="certificate-preview-overlay" onClick={onClose}>
      <div className={`certificate-preview ${isAr ? 'rtl' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="certificate-content">
          <div className="certificate-header">
            <h1>{t.certificateOfCompletion}</h1>
          </div>
          
          <div className="certificate-body">
            <p className="certify-text">{t.thisIsToCertify}</p>
            <h2 className="student-name">{userName}</h2>
            <p className="completion-text">{t.hasSuccessfullyCompleted}</p>
            <h3 className="course-name">{courseName}</h3>
          </div>
          
          <div className="certificate-footer">
            <div className="signature-section">
              <div className="signature-line"></div>
              <p>{t.issuedBy} {t.bridgeHer}</p>
            </div>
            <div className="date-section">
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;