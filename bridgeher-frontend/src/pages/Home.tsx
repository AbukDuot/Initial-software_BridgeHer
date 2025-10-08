import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import homeTranslations from "../i18n/homeTranslations";
import "../styles/home.css";

const Home: React.FC = () => {
  const { language } = useLanguage();
  const t = homeTranslations[language];

  return (
    <div className={`home ${language === "Arabic" ? "rtl" : ""}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>{t.heroTitle}</h1>
            <p>{t.heroDescription}</p>
            <div className="hero-buttons">
              <Link to="/courses" className="btn primary">
                {t.courses}
              </Link>
              <Link to="/community" className="btn secondary">
                {t.community}
              </Link>
              {/* Register button */}
              <Link to="/register" className="btn highlight">
                {t.register}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
