import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import "../styles/auth.css";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "Arabic";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(isArabic ? "كلمات المرور الجديدة غير متطابقة" : "New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSuccess(isArabic ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!");
        setTimeout(() => navigate(-1), 2000);
      } else {
        const data = await res.json();
        setError(data.message || (isArabic ? "فشل تغيير كلمة المرور" : "Failed to change password"));
      }
    } catch (err) {
      setError(isArabic ? "خطأ في الاتصال" : "Connection error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isArabic ? "تغيير كلمة المرور" : "Change Password"}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isArabic ? "كلمة المرور الحالية" : "Current Password"}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "كلمة المرور الجديدة" : "New Password"}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            {isArabic ? "تغيير كلمة المرور" : "Change Password"}
          </button>

          <button type="button" className="auth-btn secondary" onClick={() => navigate(-1)}>
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
