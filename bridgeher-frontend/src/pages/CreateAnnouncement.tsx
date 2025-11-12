import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import "../styles/createTopic.css";

const CreateAnnouncement: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pinned: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert(isArabic ? "الرجاء إدخال العنوان والمحتوى" : "Please enter title and content");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول أولاً" : "Please login first");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/community/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(isArabic ? "تم إنشاء الإعلان بنجاح!" : "Announcement created successfully!");
        navigate("/community");
      } else {
        const error = await res.json();
        alert(error.error || (isArabic ? "فشل في إنشاء الإعلان" : "Failed to create announcement"));
      }
    } catch (err) {
      console.error("Failed to create announcement", err);
      alert(isArabic ? "فشل في إنشاء الإعلان" : "Failed to create announcement");
    }
  };

  return (
    <div className={`create-topic-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="create-topic-container">
        <div className="create-topic-header">
          <button className="back-btn" onClick={() => navigate("/community")}>
            ← {isArabic ? "رجوع" : "Back"}
          </button>
          <h1>{isArabic ? "إنشاء إعلان جديد" : "Create New Announcement"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="create-topic-form">
          <div className="form-group">
            <label>{isArabic ? "العنوان *" : "Title *"}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isArabic ? "أدخل عنوان الإعلان" : "Enter announcement title"}
              required
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "المحتوى *" : "Content *"}</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={isArabic ? "محتوى الإعلان" : "Announcement content"}
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              />
              {isArabic ? " تثبيت الإعلان" : " Pin announcement"}
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {isArabic ? "نشر الإعلان" : "Post Announcement"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/community")}>
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
