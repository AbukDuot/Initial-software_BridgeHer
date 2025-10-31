import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import navbarTranslations from "../i18n/navbarTranslations";
import "../styles/navbar.css";

const Navbar: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = navbarTranslations[language];
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "Arabic" ? "rtl" : "ltr");

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUsername(JSON.parse(user).name || "");
      } catch {
        setUsername("");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };


  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <div
        className={`overlay ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>

      <nav className={`navbar ${language === "Arabic" ? "rtl" : ""}`}>
        {/* Logo */}
        <div className="logo">BridgeHer</div>

        {/* Menu Toggle (Hamburger) */}
        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li><Link to="/" onClick={toggleMenu}>{t.home}</Link></li>
          <li><Link to="/courses" onClick={toggleMenu}>{t.courses}</Link></li>
          <li><Link to="/learner-dashboard" onClick={toggleMenu}>{t.learnerDashboard}</Link></li>
          <li><Link to="/mentor-dashboard" onClick={toggleMenu}>{t.mentorDashboard}</Link></li>
          <li><Link to="/admin-dashboard" onClick={toggleMenu}>{t.adminDashboard}</Link></li>
          <li><Link to="/community" onClick={toggleMenu}>{t.community}</Link></li>
        </ul>

        {/* Right Actions: Auth + Language */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <span>
                {language === "Arabic"
                  ? `مرحبًا، ${username}`
                  : `Welcome, ${username}`}
              </span>
              <button onClick={handleLogout} style={{ background: "#e74c3c", color: "#fff" }}>
                {language === "Arabic" ? "تسجيل الخروج" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{ background: "#fff", color: "#4A148C" }}>
                  {language === "Arabic" ? "تسجيل الدخول" : "Login"}
                </button>
              </Link>
              <Link to="/register">
                <button style={{ background: "#ffd700", color: "#4A148C" }}>
                  {language === "Arabic" ? "إنشاء حساب" : "Register"}
                </button>
              </Link>
            </>
          )}

          {/* Language Selector */}
          <select
            value={language}
            onChange={() => {
              toggleLanguage();
            }}
            style={{
              background: "#fff",
              color: "#4A148C",
              fontWeight: 600,
              border: "2px solid #4A148C",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            <option value="English">English</option>
            <option value="Arabic">العربية</option>
          </select>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
