import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import "../styles/courseDetail.css";

interface Module {
  id: number;
  titleEn: string;
  titleAr: string;
  videoUrl: string;
  notesUrl: string;
  completed: boolean;
}

interface CourseData {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  modules: Module[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "Arabic";

  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  
  const allCourses: CourseData[] = [
    {
      id: "1",
      titleEn: "Financial Literacy Basics",
      titleAr: "أساسيات الثقافة المالية",
      descriptionEn:
        "Learn how to manage your income, budgeting, and saving habits effectively.",
      descriptionAr: "تعلمي كيفية إدارة الدخل ووضع الميزانية وعادات الادخار بفعالية.",
      modules: [
        {
          id: 1,
          titleEn: "Introduction to Budgeting",
          titleAr: "مقدمة في إعداد الميزانية",
          videoUrl: "https://youtu.be/pCwLhz0ltlE?si=tHJWxIs6x4JP6HJ3",
          notesUrl: "/assets/notes/budgeting-basics.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Smart Saving Tips",
          titleAr: "نصائح الادخار الذكي",
          videoUrl: "https://youtu.be/gMbNxthEQEk?si=CeE_fIzfPv6ONS_Q",
          notesUrl: "/assets/notes/saving-tips.pdf",
          completed: false,
        },
        {
          id: 3,
          titleEn: "Understanding Credit",
          titleAr: "فهم الائتمان",
          videoUrl: "https://youtu.be/RlPH-S6f5pI?si=uIcYKapbWNWv-iAv",
          notesUrl: "/assets/notes/credit-basics.pdf",
          completed: false,
        },
      ],
    },
    {
      id: "2",
      titleEn: "Entrepreneurship for Women",
      titleAr: "ريادة الأعمال للنساء",
      descriptionEn:
        "Explore how to create a business idea, plan, and present it with confidence.",
      descriptionAr: "استكشفي كيفية إنشاء فكرة مشروع وخطة عمل وتقديمها بثقة.",
      modules: [
        {
          id: 1,
          titleEn: "Finding a Business Idea",
          titleAr: "إيجاد فكرة المشروع",
          videoUrl: "https://youtu.be/0Ul4aUS1dxQ?si=HiC57dbb2w7yHHmB",
          notesUrl: "/assets/notes/business-idea.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Pitching and Presentation",
          titleAr: "العرض التقديمي للمشروع",
          videoUrl: "https://youtu.be/P2LwuF7zn9c?si=IevxQK6P0S35hXAE",
          notesUrl: "/assets/notes/pitching.pdf",
          completed: false,
        },
      ],
    },
    {
      id: "3",
      titleEn: "Digital Skills for Beginners",
      titleAr: "المهارات الرقمية للمبتدئين",
      descriptionEn: "Master essential computer and internet skills for success.",
      descriptionAr: "أتقن أساسيات الحاسوب والإنترنت للنجاح.",
      modules: [
        {
          id: 1,
          titleEn: "Introduction to Computers",
          titleAr: "مقدمة في الحاسوب",
          videoUrl: "https://youtu.be/8Z3Y0sU1y1M",
          notesUrl: "/assets/notes/computers-intro.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Internet Basics",
          titleAr: "أساسيات الإنترنت",
          videoUrl: "https://youtu.be/YuZP1JmRzjI",
          notesUrl: "/assets/notes/internet-basics.pdf",
          completed: false,
        },
      ],
    },
    {
      id: "4",
      titleEn: "Leadership & Communication",
      titleAr: "القيادة والتواصل",
      descriptionEn: "Develop public speaking, teamwork, and leadership skills.",
      descriptionAr: "طوّر مهارات الخطابة والعمل الجماعي والقيادة.",
      modules: [
        {
          id: 1,
          titleEn: "Public Speaking Basics",
          titleAr: "أساسيات الخطابة",
          videoUrl: "https://youtu.be/zvR9sXKQeB0",
          notesUrl: "/assets/notes/public-speaking.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Team Leadership",
          titleAr: "قيادة الفريق",
          videoUrl: "https://youtu.be/Np3GU7aS4nA",
          notesUrl: "/assets/notes/team-leadership.pdf",
          completed: false,
        },
      ],
    },
  ];

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourse({
          id: data.id.toString(),
          titleEn: data.title,
          titleAr: data.title,
          descriptionEn: data.description,
          descriptionAr: data.description,
          modules: []
        });
        
        const modulesRes = await fetch(`${API_BASE_URL}/api/courses/${id}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json();
          setModules(modulesData.map((m: { id: number; title: string; video_url: string; downloadable_content?: string }) => ({
            id: m.id,
            titleEn: m.title,
            titleAr: m.title,
            videoUrl: m.video_url,
            notesUrl: m.downloadable_content || "",
            completed: false
          })));
        }
      } else {
        const found = allCourses.find((c) => c.id === id);
        setCourse(found || null);
        if (found) setModules(found.modules);
      }
      
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      setEnrolled(enrolledCourses.includes(id));
    } catch {
      const found = allCourses.find((c) => c.id === id);
      setCourse(found || null);
      if (found) setModules(found.modules);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolledCourses.includes(id)) {
          enrolledCourses.push(id);
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        }
        setEnrolled(true);
        alert(isAr ? 'تم التسجيل بنجاح!' : 'Successfully enrolled!');
      }
    } catch {
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      if (!enrolledCourses.includes(id)) {
        enrolledCourses.push(id);
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      }
      setEnrolled(true);
      alert(isAr ? 'تم التسجيل بنجاح!' : 'Successfully enrolled!');
    }
  };

  if (loading) return <p className="loading">Loading course details...</p>;
  if (!course)
    return <p className="error">Course not found. Please return to dashboard.</p>;

  const t = {
    modules: isAr ? "الوحدات التعليمية" : "Modules",
    downloadNotes: isAr ? "تحميل الملاحظات" : "Download Notes",
    startQuiz: isAr ? "بدء الاختبار" : "Start Quiz",
    back: isAr ? "عودة" : "Back",
    enroll: isAr ? "التسجيل في الدورة" : "Enroll in Course",
    enrolled: isAr ? "مسجل" : "Enrolled",
    startLearning: isAr ? "ابدأ التعلم" : "Start Learning",
  };

  return (
    <section className={`course-detail ${isAr ? "rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="course-container">
        <button className="back-btn" onClick={() => navigate("/learner-dashboard")}>
          ← {t.back}
        </button>

        <h2>{isAr ? course.titleAr : course.titleEn}</h2>
        <p className="desc">{isAr ? course.descriptionAr : course.descriptionEn}</p>

        {!enrolled ? (
          <button className="enroll-btn" onClick={handleEnroll}>
            {t.enroll}
          </button>
        ) : (
          <div className="enrolled-badge">
            ✓ {t.enrolled}
          </div>
        )}

        <h3>{t.modules}</h3>
        <div className="module-grid">
          {modules.map((m) => (
            <div key={m.id} className="module-card">
              <h4>{isAr ? m.titleAr : m.titleEn}</h4>
              <div className="video-wrapper">
                <iframe
                  width="100%"
                  height="220"
                  src={m.videoUrl}
                  title={m.titleEn}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="module-actions">
                {enrolled ? (
                  <>
                    <button
                      className="btn primary"
                      onClick={() => navigate(`/course/${course.id}/module/${m.id}`)}
                    >
                      {t.startLearning}
                    </button>
                    <button
                      className="btn outline"
                      onClick={() => navigate(`/quiz/${course.id}?module=${m.id}`)}
                    >
                      {t.startQuiz}
                    </button>
                  </>
                ) : (
                  <button className="btn disabled" disabled>
                    🔒 {isAr ? 'سجل أولاً' : 'Enroll First'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseDetail;
