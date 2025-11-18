import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import ModuleQuizSimple from "../components/ModuleQuizSimple";
import { cacheVideoForOffline, isVideoCached, getCachedVideo } from "../utils/videoCache";
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
  questions: { question: string; options?: string[]; answer?: string }[];
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
  const [showQuiz, setShowQuiz] = useState(false);
  const [isVideoDownloading, setIsVideoDownloading] = useState(false);
  const [isVideoDownloaded, setIsVideoDownloaded] = useState(false);
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadModule();
    loadAllModules();
  }, [id, moduleId]);
  
  useEffect(() => {
    if (module?.video_url) {
      checkIfVideoCached();
    }
  }, [module]);
  
  const checkIfVideoCached = async () => {
    if (!module?.video_url) return;
    const videoUrl = module.video_url.startsWith('http') ? module.video_url : `${API_BASE_URL}${module.video_url}`;
    const cached = await isVideoCached(videoUrl);
    setIsVideoDownloaded(cached);
    
    // If cached, get the blob URL
    if (cached) {
      const blobUrl = await getCachedVideo(videoUrl);
      setCachedVideoUrl(blobUrl);
    }
  };
  
  const downloadVideoForOffline = async () => {
    if (!module?.video_url) return;
    
    setIsVideoDownloading(true);
    try {
      const videoUrl = module.video_url.startsWith('http') ? module.video_url : `${API_BASE_URL}${module.video_url}`;
      const success = await cacheVideoForOffline(videoUrl);
      
      if (success) {
        setIsVideoDownloaded(true);
        alert(isArabic ? '✅ تم تنزيل الفيديو للاستخدام دون اتصال!' : '✅ Video downloaded for offline use!');
      } else {
        alert(isArabic ? '❌ فشل تنزيل الفيديو' : '❌ Failed to download video');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(isArabic ? '❌ حدث خطأ أثناء التنزيل' : '❌ Error during download');
    } finally {
      setIsVideoDownloading(false);
    }
  };

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
        if (data.length > 0) {
          const assignmentData = data[0];
          const submissionRes = await fetch(`${API_BASE_URL}/api/assignments/${assignmentData.id}/submission`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (submissionRes.ok) {
            const submission = await submissionRes.json();
            assignmentData.submitted = !!submission;
          }
          setAssignment(assignmentData);
        }
      }
    } catch (err) {
      console.error("Failed to load assignment", err);
    }
  };

  const markModuleComplete = async () => {
    if (!module) return;
    setShowQuiz(true);
  };

  const handleQuizComplete = async (passed: boolean) => {
    if (!module) return;
    
    if (passed) {
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
        setShowQuiz(false);
        handleNextModule();
      } catch (err) {
        console.error("Failed to mark complete", err);
      }
    } else {
      alert(isArabic ? "يجب اجتياز الاختبار لإكمال الوحدة" : "You must pass the quiz to complete the module");
    }
  };

  const submitAssignment = async () => {
    if (!assignment) return;
    if (!submissionText.trim()) {
      alert(isArabic ? "يرجى كتابة إجابة" : "Please write an answer");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const answers = { text: submissionText, file: submissionFile?.name || null };
      
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ answers }),
      });
      
      if (res.ok) {
        alert(isArabic ? "تم تقديم الواجب بنجاح!" : "Assignment submitted successfully!");
        setAssignment({ ...assignment, submitted: true });
        setSubmissionText("");
        setSubmissionFile(null);
      } else {
        const data = await res.json();
        alert(data.error || (isArabic ? "فشل التقديم" : "Submission failed"));
      }
    } catch (err) {
      console.error("Failed to submit assignment", err);
      alert(isArabic ? "خطأ في الاتصال" : "Connection error");
    }
  };

  const handleNextModule = () => {
    if (!module) return;
    
    const currentIndex = allModules.findIndex(m => m.id === module.id);
    const nextModule = allModules[currentIndex + 1];
    
    if (nextModule) {
      navigate(`/course/${id}/module/${nextModule.id}`);
    } else {
    
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
        <div style={{background: '#FFD700', color: '#4A148C', padding: '10px', borderRadius: '5px', margin: '10px 0', fontWeight: 'bold', textAlign: 'center'}}>
           {isArabic ? 'الاختبار متاح في نهاية هذه الصفحة!' : 'Quiz available at the bottom of this page!'}
        </div>
      </div>

      {/* Video Player */}
      <div className="video-container">
        {module.video_url && (
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {isVideoDownloaded ? (
              <button 
                style={{
                  background: '#2E7D32',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: '600',
                  cursor: 'default'
                }}
                disabled
              >
                ✓ {isArabic ? 'متاح دون اتصال' : 'Available Offline'}
              </button>
            ) : (
              <button 
                onClick={downloadVideoForOffline}
                disabled={isVideoDownloading}
                style={{
                  background: isVideoDownloading ? '#CCC' : '#4A148C',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: '600',
                  cursor: isVideoDownloading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  if (!isVideoDownloading) {
                    e.currentTarget.style.background = '#FFD700';
                    e.currentTarget.style.color = '#4A148C';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isVideoDownloading) {
                    e.currentTarget.style.background = '#4A148C';
                    e.currentTarget.style.color = 'white';
                  }
                }}
              >
                {isVideoDownloading 
                  ? `⏳ ${isArabic ? 'جاري التنزيل...' : 'Downloading...'}` 
                  : `📥 ${isArabic ? 'تنزيل للاستخدام دون اتصال' : 'Download for Offline'}`
                }
              </button>
            )}
          </div>
        )}
        {module.video_url ? (
          module.video_url.includes('youtube.com') || module.video_url.includes('youtu.be') ? (
            <iframe
              src={module.video_url.replace('watch?v=', 'embed/')}
              title={module.title}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video 
              controls 
              src={cachedVideoUrl || (module.video_url.startsWith('http') ? module.video_url : `${API_BASE_URL}${module.video_url}`)}
              style={{ width: '100%', maxHeight: '500px' }}
              onError={(e) => {
                console.error('Video load error:', module.video_url);
                const target = e.target as HTMLVideoElement;
                if (!navigator.onLine) {
                  target.style.display = 'none';
                  const msg = document.createElement('div');
                  msg.style.cssText = 'padding: 40px; text-align: center; background: #fff3cd; border-radius: 8px; color: #856404;';
                  msg.innerHTML = `<h3>📡 ${isArabic ? 'غير متصل' : 'Offline'}</h3><p>${isArabic ? 'هذا الفيديو غير متاح دون اتصال. قم بتنزيل الدورة أولاً.' : 'This video is not available offline. Download the course first.'}</p>`;
                  target.parentElement?.appendChild(msg);
                } else {
                  target.style.display = 'none';
                  const msg = document.createElement('div');
                  msg.style.cssText = 'padding: 40px; text-align: center; background: #ffebee; border-radius: 8px; color: #c62828;';
                  msg.innerHTML = `<h3> ${isArabic ? 'خطأ في تحميل الفيديو' : 'Video Load Error'}</h3><p>${isArabic ? 'تعذر تحميل الفيديو. يرجى المحاولة لاحقاً.' : 'Failed to load video. Please try again later.'}</p>`;
                  target.parentElement?.appendChild(msg);
                }
              }}
            />
          )
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
            <p>{isArabic ? "لا يوجد فيديو متاح" : "No video available"}</p>
          </div>
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
             {isArabic ? "تحميل ملف PDF" : "Download PDF Notes"}
          </button>
        </div>
      )}

      {/* Assignment Section */}
      {assignment && (
        <div className="assignment-section">
          <h3> {assignment.title}</h3>
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
               {isArabic ? "تم التقديم" : "Submitted"}
            </div>
          )}
        </div>
      )}

      {/* Module Actions */}
      <div className="module-actions">
        <button className="btn" onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? (isArabic ? "إخفاء المحتوى" : "Hide Content") : (isArabic ? "عرض المحتوى" : "View Content")}
        </button>

        <button 
          onClick={() => setShowQuiz(true)}
          style={{
            background: '#FFD700',
            color: '#4A148C',
            border: '3px solid #4A148C',
            padding: '15px 25px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            margin: '10px 0'
          }}
        >
           {isArabic ? "اختبار الوحدة" : "MODULE QUIZ"}
        </button>
        
        {canProceed && (
          <button className="btn next-btn" onClick={markModuleComplete}>
            {allModules.findIndex(m => m.id === module.id) + 1 < allModules.length
              ? (isArabic ? "الوحدة التالية" : "Next Module")
              : (isArabic ? "إنهاء الدورة" : "Finish Course")}
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

      {/* Quiz Modal */}
      {showQuiz && (
        <ModuleQuizSimple
          moduleId={module.id}
          moduleTitle={module.title}
          onQuizComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
          isArabic={isArabic}
        />
      )}
    </section>
  );
};

export default ModuleDetail;