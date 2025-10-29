import React, { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import "../styles/settings.css";

const playUiSound = (enabled: boolean, tone: "tap" | "success" = "tap") => {
  if (!enabled) return;
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext);
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = tone === "success" ? 650 : 540;
    gain.gain.value = 0.07;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (err) {
    console.warn("playUiSound error:", err);
  }
};

const tMap = {
  en: {
    profile: {
      title: "Profile",
      name: "Full Name",
      email: "Email Address",
      bio: "Short Bio",
      changePhoto: "Change Photo",
      save: "Save Changes",
      savedMsg: "Profile saved successfully!",
    },
    appearance: {
      title: "Appearance",
      theme: "Theme",
      light: "Light Mode",
      dark: "Dark Mode",
      fontSize: "Font Size",
      accent: "Accent Color",
    },
    language: {
      title: "Language",
      display: "Display Language",
    },
    privacy: {
      title: "Privacy & Security",
      privacy: "Account Privacy",
      public: "Public Profile",
      private: "Private Profile",
    },
    account: {
      title: "Account",
      delete: "Delete Account",
      logout: "Log Out",
      confirmDelete: "Are you sure you want to delete your account?",
      confirmLogout: "You have been logged out.",
    },
  },
  ar: {
    profile: {
      title: "الملف الشخصي",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      bio: "نبذة قصيرة",
      changePhoto: "تغيير الصورة",
      save: "حفظ التغييرات",
      savedMsg: "تم حفظ الملف الشخصي بنجاح!",
    },
    appearance: {
      title: "المظهر",
      theme: "الوضع",
      light: "الوضع الفاتح",
      dark: "الوضع الداكن",
      fontSize: "حجم الخط",
      accent: "لون التمييز",
    },
    language: {
      title: "اللغة",
      display: "لغة العرض",
    },
    privacy: {
      title: "الخصوصية والأمان",
      privacy: "خصوصية الحساب",
      public: "الملف عام",
      private: "الملف خاص",
    },
    account: {
      title: "الحساب",
      delete: "حذف الحساب",
      logout: "تسجيل الخروج",
      confirmDelete: "هل أنت متأكد من حذف الحساب؟",
      confirmLogout: "تم تسجيل خروجكِ (تجريبي فقط).",
    },
  },
};

const Settings: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const isAr = language === "Arabic";
  const t = isAr ? tMap.ar : tMap.en;

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState("medium");
  const [accent, setAccent] = useState("#6A1B9A");
  const [accountPrivacy, setAccountPrivacy] = useState("public");

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("${API_BASE_URL}/api/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.user.name || "");
          setEmail(data.user.email || "");
          setBio(data.user.bio || "");
          setProfilePic(data.user.profile_pic || null);
          const savedTheme = data.settings.theme || "light";
          setTheme(savedTheme);
          document.documentElement.dataset.theme = savedTheme;
          setFontSize(data.settings.font_size || "medium");
          setAccent(data.settings.accent_color || "#6A1B9A");
          setAccountPrivacy(data.settings.account_privacy || "public");
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent, isAr]);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playUiSound(true);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${API_BASE_URL}/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: fullName,
          bio,
          theme,
          fontSize,
          accent,
          accountPrivacy,
          profilePic
        })
      });
      
      if (res.ok) {
        document.documentElement.dataset.theme = theme;
        playUiSound(true, "success");
        alert(t.profile.savedMsg);
      } else {
        alert(isAr ? "فشل الحفظ" : "Failed to save");
      }
    } catch (err) {
      alert(isAr ? "خطأ في الاتصال" : "Connection error");
    }
  };

  return (
    <div className={`settings-page ${isAr ? "rtl" : ""}`}>
      {/* Profile Section */}
      <section className="setting-section card profile-centered">
        <div className="profile-pic-container">
          <img
            src={profilePic || "/default-profile.png"}
            alt="Profile"
            className="profile-pic"
          />
          <label className="upload-btn">
            {t.profile.changePhoto}
            <input type="file" accept="image/*" onChange={handleProfilePicUpload} hidden />
          </label>
        </div>

        <div className="form-group">
          <input
            placeholder={t.profile.name}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            placeholder={t.profile.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder={t.profile.bio}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button className="upload-btn" onClick={handleSave}>
          {t.profile.save}
        </button>
      </section>

      {/* Appearance */}
      <section className="setting-section card">
        <h3>{t.appearance.title}</h3>
        <div className="setting-item">
          <label>{t.appearance.theme}:</label>
          <select
            value={theme}
            onChange={(e) => {
              const newTheme = e.target.value as "light" | "dark";
              setTheme(newTheme);
              document.documentElement.dataset.theme = newTheme;
            }}
          >
            <option value="light">{t.appearance.light}</option>
            <option value="dark">{t.appearance.dark}</option>
          </select>
        </div>
        <div className="setting-item">
          <label>{t.appearance.fontSize}:</label>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="setting-item">
          <label>{t.appearance.accent}:</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </div>
      </section>

      {/* Language */}
      <section className="setting-section card">
        <h3>{t.language.title}</h3>
        <div className="setting-item">
          <label>{t.language.display}:</label>
          <select
            value={isAr ? "Arabic" : "English"}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
          >
            <option value="English">English</option>
            <option value="Arabic">العربية</option>
          </select>
        </div>
      </section>

      {/* Privacy */}
      <section className="setting-section card">
        <h3>{t.privacy.title}</h3>
        <div className="setting-item">
          <label>{t.privacy.privacy}:</label>
          <select
            value={accountPrivacy}
            onChange={(e) => setAccountPrivacy(e.target.value)}
          >
            <option value="public">{t.privacy.public}</option>
            <option value="private">{t.privacy.private}</option>
          </select>
        </div>
      </section>

      {/* Account Buttons */}
      <section className="setting-section card account-actions">
        <h3>{t.account.title}</h3>
        <div className="button-row">
          <button
            className="settings-btn delete"
            onClick={async () => {
              if (window.confirm(t.account.confirmDelete)) {
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch("${API_BASE_URL}/api/settings/account", {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (res.ok) {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }
                } catch (err) {
                  alert("Failed to delete account");
                }
              }
            }}
          >
            {t.account.delete}
          </button>
          <button
            className="settings-btn logout"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await fetch("${API_BASE_URL}/api/settings/logout", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.removeItem("token");
                alert(t.account.confirmLogout);
                window.location.href = "/login";
              } catch (err) {
                console.error("Logout error", err);
              }
            }}
          >
            {t.account.logout}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
