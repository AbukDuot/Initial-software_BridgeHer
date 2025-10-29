import React, { useState, useEffect } from "react";
import "../styles/cookie-banner.css";

interface CookieBannerProps {
  language: string;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ language }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isArabic = language === "Arabic";

  useEffect(() => {
    const cookieConsent = localStorage.getItem("bridgeher-cookie-consent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bridgeher-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("bridgeher-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`cookie-banner ${isArabic ? "rtl" : ""}`}>
      <div className="cookie-content">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-text">
          <h4>
            {isArabic
              ? "نستخدم ملفات تعريف الارتباط"
              : "We Use Cookies"}
          </h4>
          <p>
            {isArabic
              ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع. بالنقر على 'قبول'، فإنك توافق على استخدامنا لملفات تعريف الارتباط."
              : "We use cookies to improve your experience and analyze site usage. By clicking 'Accept', you consent to our use of cookies."}
          </p>
        </div>
      </div>
      <div className="cookie-actions">
        <button className="btn-decline" onClick={handleDecline}>
          {isArabic ? "رفض" : "Decline"}
        </button>
        <button className="btn-accept" onClick={handleAccept}>
          {isArabic ? "قبول" : "Accept"}
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
