import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/moduleDetail.css";

interface Module {
  id: string;
  title: { English: string; Arabic: string };
  description: { English: string; Arabic: string };
  videoUrl: string;
  notes: string;
}

const modulesData: Record<string, Module[]> = {
  1: [
    {
      id: "m1",
      title: {
        English: "Introduction to Digital Literacy",
        Arabic: "مقدمة في الثقافة الرقمية",
      },
      description: {
        English:
          "Learn the basics of computer literacy, device handling, and understanding the digital world.",
        Arabic:
          "تعرف على أساسيات الثقافة الرقمية واستخدام الأجهزة وفهم العالم الرقمي.",
      },
      videoUrl: "https://www.youtube.com/embed/8Z3Y0sU1y1M",
      notes: "/notes/module1_digital_literacy.pdf",
    },
    {
      id: "m2",
      title: {
        English: "Using the Internet Safely",
        Arabic: "استخدام الإنترنت بأمان",
      },
      description: {
        English:
          "Discover how to browse safely, recognize scams, and protect your data online.",
        Arabic:
          "تعلم كيفية تصفح الإنترنت بأمان والتعرف على عمليات الاحتيال وحماية بياناتك الشخصية.",
      },
      videoUrl: "https://www.youtube.com/embed/YuZP1JmRzjI",
      notes: "/notes/module2_internet_safety.pdf",
    },
    {
      id: "m3",
      title: {
        English: "Communication & Collaboration Online",
        Arabic: "التواصل والتعاون عبر الإنترنت",
      },
      description: {
        English:
          "Explore digital tools for remote collaboration and effective communication.",
        Arabic:
          "استكشف الأدوات الرقمية للتعاون عن بُعد والتواصل الفعال عبر الإنترنت.",
      },
      videoUrl: "https://www.youtube.com/embed/0xG_3jPo5Zs",
      notes: "/notes/module3_online_communication.pdf",
    },
  ],

  2: [
    {
      id: "m1",
      title: {
        English: "Entrepreneurship Basics",
        Arabic: "أساسيات ريادة الأعمال",
      },
      description: {
        English:
          "Understand what it means to be an entrepreneur and how to build a business idea.",
        Arabic:
          "تعرف على مفهوم ريادة الأعمال وكيفية بناء فكرة مشروع ناجح.",
      },
      videoUrl: "https://www.youtube.com/embed/zvR9sXKQeB0",
      notes: "/notes/module1_entrepreneurship.pdf",
    },
    {
      id: "m2",
      title: {
        English: "Financial Literacy for Entrepreneurs",
        Arabic: "الثقافة المالية لرواد الأعمال",
      },
      description: {
        English:
          "Learn to manage budgets, savings, and investments for your small business.",
        Arabic:
          "تعلم كيفية إدارة الميزانية والادخار والاستثمار لمشروعك الصغير.",
      },
      videoUrl: "https://www.youtube.com/embed/Np3GU7aS4nA",
      notes: "/notes/module2_finance.pdf",
    },
  ],
};

const ModuleDetail: React.FC = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const courseModules = modulesData[id as keyof typeof modulesData];
  const moduleIndex = courseModules?.findIndex((m) => m.id === moduleId);
  const module = moduleIndex !== undefined && moduleIndex >= 0 ? courseModules[moduleIndex] : null;
  const isArabic = language === "Arabic";

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(`progress-course-${id}`);
    if (saved) setProgress(JSON.parse(saved));
  }, [id]);

  // Save module progress when visited
  useEffect(() => {
    if (module) {
      const newProgress = { ...progress, [module.id]: true };
      setProgress(newProgress);
      localStorage.setItem(`progress-course-${id}`, JSON.stringify(newProgress));
    }
  }, [module]);

  if (!module) {
    return (
      <div className="module-detail-container">
        <p className="not-found">
          {isArabic ? "لم يتم العثور على الوحدة المطلوبة" : "Module not found"}
        </p>
      </div>
    );
  }

  const handleNextModule = () => {
    const nextModule = courseModules[moduleIndex + 1];
    if (nextModule) {
      navigate(`/course/${id}/module/${nextModule.id}`);
    } else {
      navigate(`/course/${id}/module/${module.id}/quiz`);
    }
  };

  return (
    <section
      className={`module-detail-container ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="module-header">
        <h2>{module.title[language]}</h2>
        <p>{module.description[language]}</p>
      </div>

      {/* Video Player */}
      <div className="video-container">
        <iframe
          src={module.videoUrl}
          title={module.title[language]}
          allowFullScreen
        ></iframe>
      </div>

      {/* Notes & Buttons */}
      <div className="module-actions">
        <a
          href={module.notes}
          className="btn download-btn"
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          {isArabic ? " تنزيل الملاحظات" : " Download Notes"}
        </a>

        <button className="btn next-btn" onClick={handleNextModule}>
          {moduleIndex + 1 < courseModules.length
            ? isArabic
              ? "الوحدة التالية"
              : "Next Module"
            : isArabic
            ? "ابدأ الاختبار"
            : "Start Quiz"}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="progress-section">
        <h4>{isArabic ? "التقدم في الدورة" : "Course Progress"}</h4>
        <div className="progress-bar-container">
          {courseModules.map((m) => (
            <div
              key={m.id}
              className={`progress-dot ${
                progress[m.id] ? "completed" : "pending"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModuleDetail;
