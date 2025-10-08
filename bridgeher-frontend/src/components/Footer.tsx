import React, { useState, useEffect } from "react";
import { FaArrowUp, FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import footerTranslations from "../i18n/footerTranslations";
import "../styles/footer.css";

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const t = footerTranslations[language];
  const isArabic = language === "Arabic";
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 200);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={`footer ${isArabic ? "rtl" : ""}`}>
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-col">
          <h3>{t.title}</h3>
          <p>{t.description}</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>{t.quickLinks}</h3>
          <ul>
            <li><a href="/">{t.home}</a></li>
            <li><a href="/courses">{t.courses}</a></li>
            <li><a href="/community">{t.community}</a></li>
            <li><a href="/about">{t.about}</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h3>{t.contact}</h3>
          <p><i className="bi bi-envelope"></i> abukmayen123@gmail.com</p>
          <p><i className="bi bi-telephone"></i> +250792104849</p>
        </div>

        {/* Social Media */}
        <div className="footer-col">
          <h3>{t.followUs}</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BridgeHer — {t.rights}</p>
      </div>

      {/* Scroll-to-Top Button */}
      {isVisible && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;
