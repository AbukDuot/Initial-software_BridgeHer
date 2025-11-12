import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/createTopic.css";

const CreateTopic: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    tags: ""
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(isArabic ? "الرجاء إدخال عنوان" : "Please enter a title");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(isArabic ? "الرجاء تسجيل الدخول أولاً" : "Please login first");
        navigate("/login");
        return;
      }

      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      let mediaUrl = null;
      if (mediaFile) {
        const formDataMedia = new FormData();
        formDataMedia.append('file', mediaFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataMedia
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/community/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          image_url: mediaType === 'image' ? mediaUrl : null,
          video_url: mediaType === 'video' ? mediaUrl : null,
          media_type: mediaUrl ? mediaType : 'none'
        })
      });

      if (res.ok) {
        const topicData = await res.json();
        const topicId = topicData.id;
        
        // Upload attachments
        for (const file of attachmentFiles) {
          const formDataAttachment = new FormData();
          formDataAttachment.append('file', file);
          
          const attachRes = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataAttachment
          });
          
          if (attachRes.ok) {
            const attachData = await attachRes.json();
            await fetch(`${API_BASE_URL}/api/community/attachments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                content_type: 'topic',
                content_id: topicId,
                file_url: attachData.url,
                file_name: file.name,
                file_size: file.size
              })
            });
          }
        }
        
        alert(isArabic ? "تم إنشاء الموضوع بنجاح!" : "Topic created successfully!");
        navigate("/community");
        return;
      }

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || (isArabic ? "فشل في إنشاء الموضوع" : "Failed to create topic"));
      }
    } catch (err) {
      console.error("Failed to create topic", err);
      alert(isArabic ? "فشل في إنشاء الموضوع" : "Failed to create topic");
    }
  };

  return (
    <div className={`create-topic-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="create-topic-container">
        <div className="create-topic-header">
          <button className="back-btn" onClick={() => navigate("/community")}>
            ← {isArabic ? "رجوع" : "Back"}
          </button>
          <h1>{isArabic ? "إنشاء موضوع جديد" : "Create New Topic"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="create-topic-form">
          <div className="form-group">
            <label>{isArabic ? "العنوان *" : "Title *"}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isArabic ? "أدخل عنوان الموضوع" : "Enter topic title"}
              required
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "الفئة" : "Category"}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">{isArabic ? "اختر فئة" : "Select category"}</option>
              <option value="General">{isArabic ? "عام" : "General"}</option>
              <option value="Courses">{isArabic ? "الدورات" : "Courses"}</option>
              <option value="Mentorship">{isArabic ? "الإرشاد" : "Mentorship"}</option>
              <option value="Career">{isArabic ? "المهنة" : "Career"}</option>
              <option value="Support">{isArabic ? "الدعم" : "Support"}</option>
              <option value="Feedback">{isArabic ? "الملاحظات" : "Feedback"}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{isArabic ? "الوصف المختصر" : "Short Description"}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isArabic ? "وصف مختصر للموضوع" : "Brief description of the topic"}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "المحتوى" : "Content"}</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder={isArabic ? "اكتب محتوى الموضوع هنا..." : "Write your topic content here..."}
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "الوسوم (مفصولة بفواصل)" : "Tags (comma separated)"}</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder={isArabic ? "مثال: تعليم, برمجة, تطوير" : "e.g. education, programming, development"}
            />
          </div>

          <div className="form-group">
            <label>{isArabic ? "إضافة صورة أو فيديو" : "Add Image or Video"}</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMediaFile(file);
                  setMediaType(file.type.startsWith('image') ? 'image' : 'video');
                }
              }}
            />
            {mediaFile && <small>{mediaFile.name}</small>}
          </div>

          <div className="form-group">
            <label>{isArabic ? "إرفاق ملفات (PDF, DOC, etc)" : "Attach Files (PDF, DOC, etc)"}</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.zip"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAttachmentFiles(files);
              }}
            />
            {attachmentFiles.length > 0 && (
              <div style={{marginTop: '5px'}}>
                {attachmentFiles.map((f, i) => (
                  <small key={i} style={{display: 'block'}}>📎 {f.name}</small>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {isArabic ? "نشر الموضوع" : "Post Topic"}
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

export default CreateTopic;
