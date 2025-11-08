import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useUser } from "../hooks/useUser";
import navbarTranslations from "../i18n/navbarTranslations";
import NotificationBell from "./NotificationBell";
import "../styles/navbar.css";

const Navbar: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useUser();
  const t = navbarTranslations[language];
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!user;
  const username = user?.name || "";
  const userRole = user?.role || "";

  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "Arabic" ? "rtl" : "ltr");
  }, [language]);

  useEffect(() => {
    console.log('🔍 Navbar - User:', user);
    console.log('🔍 Navbar - Role:', userRole);
  }, [user, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
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
          <li><Link to="/courses" onClick={toggleMenu}>{language === "Arabic" ? "الدورات" : "Courses"}</Link></li>
          <li><Link to="/community" onClick={toggleMenu}>{language === "Arabic" ? "المجتمع" : "Community"}</Link></li>
          <li><Link to="/about" onClick={toggleMenu}>{language === "Arabic" ? "من نحن" : "About"}</Link></li>
          <li><Link to="/mentorship" onClick={toggleMenu}>{language === "Arabic" ? "الإرشاد" : "Mentorship"}</Link></li>
          {userRole === "Learner" && <li><Link to="/learner-dashboard" onClick={toggleMenu}>{t.learnerDashboard}</Link></li>}
          {userRole === "Mentor" && <li><Link to="/mentor-dashboard" onClick={toggleMenu}>{t.mentorDashboard}</Link></li>}
          {userRole === "Admin" && <li><Link to="/admin-dashboard" onClick={toggleMenu}>{t.adminDashboard}</Link></li>}
          {isLoggedIn && <li><Link to="/bookmarks" onClick={toggleMenu}>{language === "Arabic" ? "المفضلة" : "Bookmarks"}</Link></li>}
        </ul>

        {/* Right Actions: Auth + Language */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <NotificationBell />
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
