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
    tags: "",
    poll_question: "",
    poll_options: ["", ""]
  });
  const [templates, setTemplates] = useState<{type: string; name: string; template: string}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [drafts, setDrafts] = useState<{id: number; title: string; category: string; description: string; tags?: string[]; poll_question?: string; poll_options?: string}[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchDrafts();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/community/drafts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (err) {
      console.error("Failed to fetch drafts", err);
    }
  };

  const handleTemplateSelect = (templateType: string) => {
    const template = templates.find(t => t.type === templateType);
    if (template) {
      setForm({ ...form, description: template.template });
      setSelectedTemplate(templateType);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title || 'Untitled Draft',
          category: form.category,
          description: form.description,
          tags: form.tags.split(",").map(t => t.trim()).filter(t => t)
        })
      });
      if (res.ok) {
        alert(isArabic ? "تم حفظ المسودة" : "Draft saved!");
        fetchDrafts();
      }
    } catch (err) {
      console.error("Failed to save draft", err);
    }
  };

  const handleLoadDraft = (draft: {id: number; title: string; category: string; description: string; tags?: string[]; poll_question?: string; poll_options?: string}) => {
    setForm({
      title: draft.title,
      category: draft.category,
      description: draft.description,
      tags: draft.tags?.join(', ') || '',
      poll_question: draft.poll_question || '',
      poll_options: draft.poll_options ? JSON.parse(draft.poll_options) : ['', '']
    });
    setShowDrafts(false);
  };

  const addPollOption = () => {
    setForm({ ...form, poll_options: [...form.poll_options, ""] });
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...form.poll_options];
    newOptions[index] = value;
    setForm({ ...form, poll_options: newOptions });
  };

  const removePollOption = (index: number) => {
    if (form.poll_options.length > 2) {
      setForm({ ...form, poll_options: form.poll_options.filter((_, i) => i !== index) });
    }
  };

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
          media_type: mediaType,
          poll_question: form.poll_question || null,
          poll_options: form.poll_question ? JSON.stringify(form.poll_options.filter(o => o.trim())) : null,
          template_type: selectedTemplate || null
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
          <div>
            <button type="button" className="btn-secondary" onClick={() => setShowDrafts(!showDrafts)} style={{marginRight: '10px'}}>
               {isArabic ? "المسودات" : "Drafts"} ({drafts.length})
            </button>
            <button className="btn-back" onClick={() => navigate("/community")}>
              {isArabic ? "← العودة" : "← Back"}
            </button>
          </div>
        </header>

        {showDrafts && drafts.length > 0 && (
          <div className="drafts-panel" style={{background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <h3>{isArabic ? "المسودات المحفوظة" : "Saved Drafts"}</h3>
            {drafts.map(draft => (
              <div key={draft.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', marginBottom: '10px', borderRadius: '5px'}}>
                <span>{draft.title}</span>
                <button onClick={() => handleLoadDraft(draft)} className="btn-small" style={{padding: '5px 15px'}}>
                  {isArabic ? "تحميل" : "Load"}
                </button>
              </div>
            ))}
          </div>
        )}

        {templates.length > 0 && (
          <div className="templates-section" style={{marginBottom: '20px'}}>
            <h3>{isArabic ? "استخدم قالب" : "Use a Template"}</h3>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {templates.map(template => (
                <button
                  key={template.type}
                  type="button"
                  className={selectedTemplate === template.type ? 'active' : ''}
                  onClick={() => handleTemplateSelect(template.type)}
                  style={{padding: '10px 20px', border: '1px solid #4A148C', borderRadius: '5px', background: selectedTemplate === template.type ? '#4A148C' : 'white', color: selectedTemplate === template.type ? 'white' : '#4A148C', cursor: 'pointer'}}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
            <label>
              <input
                type="checkbox"
                checked={!!form.poll_question}
                onChange={(e) => setForm({ ...form, poll_question: e.target.checked ? '' : '' })}
              />
              {isArabic ? " إضافة استطلاع رأي" : " Add a Poll"}
            </label>
            {form.poll_question !== null && form.poll_question !== undefined && (
              <div style={{marginTop: '10px'}}>
                <input
                  type="text"
                  value={form.poll_question}
                  onChange={(e) => setForm({ ...form, poll_question: e.target.value })}
                  placeholder={isArabic ? "سؤال الاستطلاع" : "Poll question"}
                  style={{width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ddd'}}
                />
                {form.poll_options.map((option, idx) => (
                  <div key={idx} style={{display: 'flex', gap: '10px', marginBottom: '5px'}}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={`${isArabic ? 'خيار' : 'Option'} ${idx + 1}`}
                      style={{flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd'}}
                    />
                    {form.poll_options.length > 2 && (
                      <button type="button" onClick={() => removePollOption(idx)} style={{padding: '5px 10px', background: '#E53935', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPollOption} style={{padding: '8px 15px', background: '#4A148C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '5px'}}>
                  + {isArabic ? "إضافة خيار" : "Add Option"}
                </button>
              </div>
            )}
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
            <button type="button" className="btn-secondary" onClick={handleSaveDraft} style={{background: '#FFD700', color: '#333', marginLeft: '10px'}}>
              💾 {isArabic ? "حفظ كمسودة" : "Save as Draft"}
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
