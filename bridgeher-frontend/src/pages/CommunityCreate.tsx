import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/community.css";

const CommunityCreate: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [form, setForm] = useState({
    title: "",
    category: "General",
    description: "",
    tags: ""
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [loading, setLoading] = useState(false);



  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert(isArabic ? "يرجى اختيار صورة أو فيديو" : "Please select an image or video");
      return;
    }
    
    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description) {
      alert(isArabic ? "الرجاء ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      let imageUrl = "";
      let videoUrl = "";
      
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (mediaType === 'image') {
            imageUrl = uploadData.url;
          } else {
            videoUrl = uploadData.url;
          }
        }
      }
      
      const res = await fetch(`${API_BASE_URL}/api/community/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          tags: form.tags.split(",").map(t => t.trim()).filter(t => t),
          image_url: imageUrl,
          video_url: videoUrl,
          media_type: mediaType
        })
      });

      if (res.ok) {
        alert(isArabic ? "تم نشر الموضوع بنجاح!" : "Topic posted successfully!");
        navigate("/community");
      } else {
        const data = await res.json();
        alert(data.error || (isArabic ? "فشل نشر الموضوع" : "Failed to post topic"));
      }
    } catch (err) {
      console.error("Failed to create topic", err);
      alert(isArabic ? "حدث خطأ أثناء النشر" : "An error occurred while posting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`community-create ${isArabic ? "rtl" : ""}`}>
      <div className="create-container">
        <header className="create-header">
          <h1>{isArabic ? "إنشاء موضوع جديد" : "Create New Topic"}</h1>
          <button className="btn-back" onClick={() => navigate("/community")}>
            {isArabic ? "← العودة" : "← Back"}
          </button>
        </header>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>{isArabic ? "العنوان *" : "Title *"}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isArabic ? "أدخل عنوان الموضوع..." : "Enter topic title..."}
              required
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "الفئة" : "Category"}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="General">{isArabic ? "عام" : "General"}</option>
              <option value="Finance">{isArabic ? "المالية" : "Finance"}</option>
              <option value="Business">{isArabic ? "الأعمال" : "Business"}</option>
              <option value="Technology">{isArabic ? "التكنولوجيا" : "Technology"}</option>
              <option value="Leadership">{isArabic ? "القيادة" : "Leadership"}</option>
              <option value="Career">{isArabic ? "المسار المهني" : "Career"}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{isArabic ? "الوصف *" : "Description *"}</label>
            <RichTextEditor
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
              placeholder={isArabic ? "اكتب وصف الموضوع..." : "Write your topic description..."}
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "الوسوم (افصل بفاصلة)" : "Tags (comma separated)"}</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder={isArabic ? "مثال: تعليم، تطوير، مهارات" : "e.g. education, development, skills"}
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "إضافة صورة أو فيديو (اختياري)" : "Add Image or Video (optional)"}</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
            />
            {mediaPreview && (
              <div style={{marginTop: '10px'}}>
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" style={{maxWidth: '100%', maxHeight: '300px', borderRadius: '8px'}} />
                ) : (
                  <video src={mediaPreview} controls style={{maxWidth: '100%', maxHeight: '300px', borderRadius: '8px'}} />
                )}
                <button 
                  type="button" 
                  onClick={() => { setMediaFile(null); setMediaPreview(""); setMediaType("none"); }}
                  style={{marginTop: '10px', padding: '5px 10px', background: '#E53935', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                >
                  {isArabic ? "إزالة" : "Remove"}
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? (isArabic ? "جارٍ النشر..." : "Posting...") : (isArabic ? "نشر الموضوع" : "Post Topic")}
            </button>
            <button type="button" className="btn" onClick={() => navigate("/community")}>
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityCreate;
