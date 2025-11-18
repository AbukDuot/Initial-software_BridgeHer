import React, { useEffect, useState, useRef } from "react";
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Force re-render when user data changes (e.g., profile image update)
  useEffect(() => {
    const handleStorageChange = () => {
      // Force component re-render by updating a state
      setProfileDropdownOpen(prev => prev);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileDropdownOpen(false);
    navigate("/login");
    window.location.reload();
  };

  const getDashboardPath = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin': return '/admin-dashboard';
      case 'mentor': return '/mentor-dashboard';
      default: return '/learner-dashboard';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserImage = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return storedUser?.profile_pic || storedUser?.avatar_url || null;
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
              <NotificationBell isArabic={language === "Arabic"} />
              <div className="profile-dropdown" ref={profileDropdownRef}>
                <div 
                  className="profile-avatar" 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  {getUserImage() ? (
                    <img 
                      src={getUserImage()} 
                      alt={username}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-circle">
                      {getInitials(username)}
                    </div>
                  )}
                  <span className="profile-name">{username}</span>
                  <span className="dropdown-arrow">{profileDropdownOpen ? '▲' : '▼'}</span>
                </div>
                
                {profileDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-header">
                      {getUserImage() ? (
                        <img 
                          src={getUserImage()} 
                          alt={username}
                          className="avatar-image large"
                        />
                      ) : (
                        <div className="avatar-circle large">
                          {getInitials(username)}
                        </div>
                      )}
                      <div className="profile-info">
                        <h4>{username}</h4>
                        <p>{userRole}</p>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link to={getDashboardPath()} onClick={() => setProfileDropdownOpen(false)} className="dropdown-item">
                      <span className="dropdown-icon">📊</span>
                      <span className="dropdown-text" style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{language === "Arabic" ? "لوحة التحكم" : "Dashboard"}</span>
                    </Link>
                    
                    <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      <span className="dropdown-text" style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{language === "Arabic" ? "الملف الشخصي" : "Profile"}</span>
                    </Link>
                    
                    <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="dropdown-item">
                      <span className="dropdown-icon">⚙️</span>
                      <span className="dropdown-text" style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{language === "Arabic" ? "الإعدادات" : "Settings"}</span>
                    </Link>
                    
                    <Link to="/help" onClick={() => setProfileDropdownOpen(false)} className="dropdown-item">
                      <span className="dropdown-icon">❓</span>
                      <span className="dropdown-text" style={{fontSize: '14px', fontWeight: '500', color: '#333'}}>{language === "Arabic" ? "المساعدة" : "Help"}</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="dropdown-icon">🚪</span>
                      <span className="dropdown-text" style={{fontSize: '14px', fontWeight: '500', color: '#e74c3c'}}>{language === "Arabic" ? "تسجيل الخروج" : "Logout"}</span>
                    </button>
                  </div>
                )}
              </div>
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
