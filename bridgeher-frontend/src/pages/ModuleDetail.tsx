import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import "../styles/moduleDetail.css";

interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  video_url: string;
  pdf_url?: string;
  order_index: number;
  completed?: boolean;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  questions: any;
  due_date: string;
  submitted?: boolean;
}

const ModuleDetail: React.FC = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [module, setModule] = useState<Module | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModule();
    loadAllModules();
  }, [id, moduleId]);

  const loadModule = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setModule(data);
        loadAssignment(Number(moduleId));
      }
    } catch (err) {
      console.error("Failed to load module", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllModules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setAllModules(data);
      }
    } catch (err) {
      console.error("Failed to load modules", err);
    }
  };

  const loadAssignment = async (modId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/assignments/module/${modId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setAssignment(data[0]);
      }
    } catch (err) {
      console.error("Failed to load assignment", err);
    }
  };

  const markModuleComplete = async () => {
    if (!module) return;
    
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/modules/${module.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }),
      });
      
      alert(isArabic ? "تم إكمال الوحدة!" : "Module completed!");
      handleNextModule();
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  const submitAssignment = async () => {
    if (!assignment) return;
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", submissionText);
      if (submissionFile) formData.append("file", submissionFile);
      
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (res.ok) {
        alert(isArabic ? "تم تقديم الواجب بنجاح!" : "Assignment submitted successfully!");
        setAssignment({ ...assignment, submitted: true });
      }
    } catch (err) {
      console.error("Failed to submit assignment", err);
    }
  };

  const handleNextModule = () => {
    if (!module) return;
    
    const currentIndex = allModules.findIndex(m => m.id === module.id);
    const nextModule = allModules[currentIndex + 1];
    
    if (nextModule) {
      navigate(`/course/${id}/module/${nextModule.id}`);
    } else {
      // All modules complete, go to final quiz
      navigate(`/quiz/${id}`);
    }
  };

  const downloadPDF = async () => {
    if (!module?.pdf_url) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/modules/${module.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${module.title}.pdf`;
        a.click();
      }
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;
  if (!module) return <div className="error">{isArabic ? "لم يتم العثور على الوحدة" : "Module not found"}</div>;

  const canProceed = !assignment || assignment.submitted;

  return (
    <section className={`module-detail-container ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="module-header">
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </div>

      {/* Video Player */}
      <div className="video-container">
        {module.video_url.startsWith('http') ? (
          <iframe
            src={module.video_url}
            title={module.title}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video controls src={`${API_BASE_URL}${module.video_url}`} />
        )}
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="notes-section">
          <h3>{isArabic ? "محتوى الوحدة" : "Module Content"}</h3>
          <p>{module.content}</p>
        </div>
      )}

      {/* PDF Download */}
      {module.pdf_url && (
        <div className="pdf-section">
          <button className="btn download-btn" onClick={downloadPDF}>
            📄 {isArabic ? "تحميل ملف PDF" : "Download PDF Notes"}
          </button>
        </div>
      )}

      {/* Assignment Section */}
      {assignment && (
        <div className="assignment-section">
          <h3>📝 {assignment.title}</h3>
          <p>{assignment.description}</p>
          
          {!assignment.submitted ? (
            <>
              <textarea
                placeholder={isArabic ? "اكتب إجابتك هنا..." : "Write your answer here..."}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={6}
              />
              <input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              />
              <button className="btn submit-btn" onClick={submitAssignment}>
                {isArabic ? "تقديم الواجب" : "Submit Assignment"}
              </button>
            </>
          ) : (
            <div className="submitted-badge">
              ✅ {isArabic ? "تم التقديم" : "Submitted"}
            </div>
          )}
        </div>
      )}

      {/* Module Actions */}
      <div className="module-actions">
        <button className="btn" onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? (isArabic ? "إخفاء المحتوى" : "Hide Content") : (isArabic ? "عرض المحتوى" : "View Content")}
        </button>

        {canProceed ? (
          <button className="btn next-btn" onClick={markModuleComplete}>
            {allModules.findIndex(m => m.id === module.id) + 1 < allModules.length
              ? (isArabic ? "الوحدة التالية" : "Next Module")
              : (isArabic ? "إنهاء الدورة" : "Finish Course")}
          </button>
        ) : (
          <button className="btn disabled" disabled>
            🔒 {isArabic ? "أكمل الواجب أولاً" : "Complete Assignment First"}
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="progress-section">
        <h4>{isArabic ? "التقدم في الدورة" : "Course Progress"}</h4>
        <div className="progress-bar-container">
          {allModules.map((m, idx) => (
            <div
              key={m.id}
              className={`progress-dot ${m.completed ? "completed" : idx <= allModules.findIndex(mod => mod.id === module.id) ? "current" : "pending"}`}
              title={m.title}
            />
          ))}
        </div>
        <p>{allModules.filter(m => m.completed).length} / {allModules.length} {isArabic ? "مكتمل" : "completed"}</p>
      </div>
    </section>
  );
};

export default ModuleDetail;
