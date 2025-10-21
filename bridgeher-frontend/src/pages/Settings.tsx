import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
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

  // Load saved settings on mount
  useEffect(() => {
    const savedData = localStorage.getItem("userSettings");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setProfilePic(parsed.profilePic || null);
      setFullName(parsed.fullName || "");
      setEmail(parsed.email || "");
      setBio(parsed.bio || "");
      setTheme(parsed.theme || "light");
      setFontSize(parsed.fontSize || "medium");
      setAccent(parsed.accent || "#6A1B9A");
      setAccountPrivacy(parsed.accountPrivacy || "public");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.style.setProperty("--accent", accent);
  }, [theme, accent, isAr]);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playUiSound(true);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const data = {
      profilePic,
      fullName,
      email,
      bio,
      theme,
      fontSize,
      accent,
      accountPrivacy,
    };
    localStorage.setItem("userSettings", JSON.stringify(data));
    playUiSound(true, "success");
    alert(t.profile.savedMsg);
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
            onChange={(e) => setTheme(e.target.value as "light" | "dark")}
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
            onClick={() =>
              window.confirm(t.account.confirmDelete) && alert("Deleted.")
            }
          >
            {t.account.delete}
          </button>
          <button
            className="settings-btn logout"
            onClick={() => alert(t.account.confirmLogout)}
          >
            {t.account.logout}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
