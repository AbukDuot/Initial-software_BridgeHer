import React, { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/profile.css";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio?: string;
  expertise?: string;
  avatar?: string;
}

const Profile: React.FC = () => {
  const { language } = useLanguage();
  const { toasts, showToast, removeToast } = useToast();
  const isArabic = language === "Arabic";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "",
    bio: "",
    expertise: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast(isArabic ? "يرجى تسجيل الدخول" : "Please login first", "error");
        return;
      }

      const response = await fetch("${API_BASE_URL}/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        showToast(isArabic ? "فشل تحميل الملف الشخصي" : "Failed to load profile", "error");
      }
    } catch (error) {
      showToast(isArabic ? "خطأ في الاتصال" : "Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("${API_BASE_URL}/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          expertise: profile.expertise,
        }),
      });

      if (response.ok) {
        showToast(isArabic ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully", "success");
        setEditing(false);
      } else {
        showToast(isArabic ? "فشل حفظ التغييرات" : "Failed to save changes", "error");
      }
    } catch (error) {
      showToast(isArabic ? "خطأ في الاتصال" : "Connection error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message={isArabic ? "جارٍ التحميل..." : "Loading..."} />;
  }

  return (
    <div className={`profile-page ${isArabic ? "rtl" : ""}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" />
              ) : (
                <span className="avatar-placeholder">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button className="btn-upload">
              {isArabic ? "تحميل صورة" : "Upload Photo"}
            </button>
          </div>

          <div className="profile-info">
            <h1>{profile.name}</h1>
            <p className="role-badge">{profile.role}</p>
            <p className="email">{profile.email}</p>
          </div>

          <div className="profile-actions">
            {!editing ? (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                {isArabic ? "تعديل الملف الشخصي" : "Edit Profile"}
              </button>
            ) : (
              <>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "حفظ" : "Save")}
                </button>
                <button className="btn-cancel" onClick={() => setEditing(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>{isArabic ? "المعلومات الشخصية" : "Personal Information"}</h2>
            <div className="form-group">
              <label>{isArabic ? "الاسم" : "Name"}</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>{isArabic ? "البريد الإلكتروني" : "Email"}</label>
              <input type="email" value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label>{isArabic ? "الدور" : "Role"}</label>
              <input type="text" value={profile.role} disabled />
            </div>
          </div>

          {profile.role === "Mentor" && (
            <div className="profile-section">
              <h2>{isArabic ? "معلومات المرشد" : "Mentor Information"}</h2>
              <div className="form-group">
                <label>{isArabic ? "السيرة الذاتية" : "Bio"}</label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                  placeholder={isArabic ? "أخبرنا عن نفسك..." : "Tell us about yourself..."}
                />
              </div>

              <div className="form-group">
                <label>{isArabic ? "مجالات الخبرة" : "Expertise"}</label>
                <input
                  type="text"
                  value={profile.expertise || ""}
                  onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                  disabled={!editing}
                  placeholder={isArabic ? "مثال: التكنولوجيا، الأعمال" : "e.g., Technology, Business"}
                />
              </div>
            </div>
          )}

          <div className="profile-section">
            <h2>{isArabic ? "الإحصائيات" : "Statistics"}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>5</h3>
                <p>{isArabic ? "الدورات المسجلة" : "Enrolled Courses"}</p>
              </div>
              <div className="stat-card">
                <h3>3</h3>
                <p>{isArabic ? "الدورات المكتملة" : "Completed Courses"}</p>
              </div>
              <div className="stat-card">
                <h3>150</h3>
                <p>{isArabic ? "النقاط" : "Points"}</p>
              </div>
              <div className="stat-card">
                <h3>2</h3>
                <p>{isArabic ? "الشهادات" : "Certificates"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
