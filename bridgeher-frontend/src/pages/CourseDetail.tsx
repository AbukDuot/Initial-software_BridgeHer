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
  const [loading, setLoading] = useState(true);
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
          videoUrl: "https://youtu.be/ouvbeb2wSGA?si=B0jZJs9pcmhA_Jot",
          notesUrl: "/assets/notes/budgeting-basics.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Smart Saving Tips",
          titleAr: "نصائح الادخار الذكي",
          videoUrl: "https://youtu.be/X118OH0TMqk?si=QtYwOd-uU_2u8vqs",
          notesUrl: "/assets/notes/saving-tips.pdf",
          completed: false,
        },
        {
          id: 3,
          titleEn: "Understanding Credit",
          titleAr: "فهم الائتمان",
          videoUrl: "https://youtu.be/4VDWahQrf84?si=IRuxrsiBla60xTcn",
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
          videoUrl: "https://youtu.be/0Ul4aUS1dxQ?si=-n65o6lm09mbLM6m",
          notesUrl: "/assets/notes/business-idea.pdf",
          completed: false,
        },
        {
          id: 2,
          titleEn: "Pitching and Presentation",
          titleAr: "العرض التقديمي للمشروع",
          videoUrl: "https://www.youtube.com/embed/nNPLyQjPpRg",
          notesUrl: "/assets/notes/pitching.pdf",
          completed: false,
        },
      ],
    },
  ];

  useEffect(() => {
    const found = allCourses.find((c) => c.id === id);
    setCourse(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return <p className="loading">Loading course details...</p>;
  if (!course)
    return <p className="error">Course not found. Please return to dashboard.</p>;

  const t = {
    modules: isAr ? "الوحدات التعليمية" : "Modules",
    downloadNotes: isAr ? "تحميل الملاحظات" : "Download Notes",
    startQuiz: isAr ? "بدء الاختبار النهائي" : "Start Final Quiz",
    back: isAr ? "عودة إلى لوحة التحكم" : "Back to Dashboard",
  };

  return (
    <section className={`course-detail ${isAr ? "rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="course-container">
        <button className="back-btn" onClick={() => navigate("/learner-dashboard")}>
          ← {t.back}
        </button>

        <h2>{isAr ? course.titleAr : course.titleEn}</h2>
        <p className="desc">{isAr ? course.descriptionAr : course.descriptionEn}</p>

        <h3>{t.modules}</h3>
        <div className="module-grid">
          {course.modules.map((m) => (
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
                <a href={m.notesUrl} target="_blank" rel="noopener noreferrer" className="btn outline">
                  {t.downloadNotes}
                </a>
                <button
                  className="btn primary"
                  onClick={() => navigate(`/quiz/${course.id}?module=${m.id}`)}
                >
                  {t.startQuiz}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseDetail;
