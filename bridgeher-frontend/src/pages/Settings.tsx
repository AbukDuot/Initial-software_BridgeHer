import React, { useState, useEffect } from "react";
import "../styles/settings.css";

const Settings: React.FC = () => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [accountPrivacy, setAccountPrivacy] = useState("public");

  useEffect(() => {
    const savedPic = localStorage.getItem("user-profile-pic");
    const savedLang = localStorage.getItem("app-language");
    const savedTheme = localStorage.getItem("app-theme");
    const savedNotif = localStorage.getItem("app-notifications");
    const savedFontSize = localStorage.getItem("app-fontsize");
    const savedPrivacy = localStorage.getItem("app-privacy");

    if (savedPic) setProfilePic(savedPic);
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedNotif) setNotifications(savedNotif === "true");
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedPrivacy) setAccountPrivacy(savedPrivacy);
  }, []);

  useEffect(() => {
    if (profilePic) localStorage.setItem("user-profile-pic", profilePic);
    localStorage.setItem("app-language", language);
    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-notifications", String(notifications));
    localStorage.setItem("app-fontsize", fontSize);
    localStorage.setItem("app-privacy", accountPrivacy);

    document.body.className = `${theme}-theme ${fontSize}-text`;
  }, [profilePic, language, theme, notifications, fontSize, accountPrivacy]);


  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
      localStorage.setItem("user-profile-pic", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <section className="setting-section profile-section">
        <h3>Profile</h3>
        <div className="profile-pic-container">
          <img
            src={profilePic || "/default-profile.png"}
            alt="Profile"
            className="profile-pic"
          />
          <label className="upload-btn">
            Change Photo
            <input type="file" accept="image/*" onChange={handleProfilePicUpload} hidden />
          </label>
        </div>
      </section>
      <section className="setting-section">
        <h3>Appearance</h3>

        <div className="setting-item">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Font Size:</label>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </section>

      {/* Language */}
      <section className="setting-section">
        <h3>Language</h3>

        <div className="setting-item">
          <label>Display Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section className="setting-section">
        <h3>Notifications</h3>

        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            Enable App Notifications
          </label>
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="setting-section">
        <h3>Privacy</h3>

        <div className="setting-item">
          <label>Account Privacy:</label>
          <select
            value={accountPrivacy}
            onChange={(e) => setAccountPrivacy(e.target.value)}
          >
            <option value="public">Public Profile</option>
            <option value="private">Private Profile</option>
          </select>
        </div>
      </section>

      {/* Account Actions */}
      <section className="setting-section">
        <h3>Account</h3>

        <button
          className="settings-btn delete"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete your account?")) {
              alert("Your account has been deleted (demo only).");
            }
          }}
        >
          Delete Account
        </button>

        <button
          className="settings-btn logout"
          onClick={() => {
            localStorage.clear();
            alert("You have been logged out (demo only).");
          }}
        >
          Log Out
        </button>
      </section>
    </div>
  );
};

export default Settings;
