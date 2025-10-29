import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import "../styles/moduleDetail.css";

interface Module {
  id: string;
  title: { English: string; Arabic: string };
  description: { English: string; Arabic: string };
  videoUrl: string;
  notes: { English: string; Arabic: string };
}

const modulesData: Record<string, Module[]> = {
  "1": [
    {
      id: "m1",
      title: {
        English: "Introduction to Digital Literacy",
        Arabic: "مقدمة في الثقافة الرقمية",
      },
      description: {
        English: "Learn the basics of computer literacy, device handling, and understanding the digital world.",
        Arabic: "تعرف على أساسيات الثقافة الرقمية واستخدام الأجهزة وفهم العالم الرقمي.",
      },
      videoUrl: "https://www.youtube.com/embed/8Z3Y0sU1y1M",
      notes: {
        English: "Computer basics, device handling, file management, digital interfaces. Topics: hardware vs software, operating systems, troubleshooting, digital safety.",
        Arabic: "أساسيات الكمبيوتر والتعامل مع الأجهزة وإدارة الملفات والواجهات الرقمية. المواضيع: الأجهزة مقابل البرامج، أنظمة التشغيل، استكشاف الأخطاء، السلامة الرقمية."
      },
    },
    {
      id: "m2",
      title: {
        English: "Using the Internet Safely",
        Arabic: "استخدام الإنترنت بأمان",
      },
      description: {
        English: "Discover how to browse safely, recognize scams, and protect your data online.",
        Arabic: "تعلم كيفية تصفح الإنترنت بأمان والتعرف على عمليات الاحتيال وحماية بياناتك الشخصية.",
      },
      videoUrl: "https://www.youtube.com/embed/YuZP1JmRzjI",
      notes: {
        English: "Identify phishing, create strong passwords, use 2FA, recognize scams, protect personal info, browse safely. Includes secure banking and shopping tips.",
        Arabic: "تحديد رسائل البريد الاحتيالية، وإنشاء كلمات مرور قوية، واستخدام المصادقة الثنائية، والتعرف على عمليات الاحتيال، وحماية المعلومات الشخصية، والتصفح بأمان."
      },
    },
    {
      id: "m3",
      title: {
        English: "Communication & Collaboration Online",
        Arabic: "التواصل والتعاون عبر الإنترنت",
      },
      description: {
        English: "Explore digital tools for remote collaboration and effective communication.",
        Arabic: "استكشف الأدوات الرقمية للتعاون عن بُعد والتواصل الفعال عبر الإنترنت.",
      },
      videoUrl: "https://www.youtube.com/embed/0xG_3jPo5Zs",
      notes: {
        English: "Email etiquette, video conferencing (Zoom, Teams), collaborative platforms (Google Docs, Slack), file sharing, remote teamwork best practices.",
        Arabic: "آداب البريد الإلكتروني، ومؤتمرات الفيديو (Zoom، Teams)، ومنصات التعاون (Google Docs، Slack)، ومشاركة الملفات، وأفضل ممارسات العمل الجماعي عن بُعد."
      },
    },
  ],

  "2": [
    {
      id: "m1",
      title: {
        English: "Entrepreneurship Basics",
        Arabic: "أساسيات ريادة الأعمال",
      },
      description: {
        English: "Understand what it means to be an entrepreneur and how to build a business idea.",
        Arabic: "تعرف على مفهوم ريادة الأعمال وكيفية بناء فكرة مشروع ناجح.",
      },
      videoUrl: "https://www.youtube.com/embed/zvR9sXKQeB0",
      notes: {
        English: "Entrepreneurial mindset, idea validation, market research, business model canvas, customer discovery, MVP development. Turn ideas into viable businesses.",
        Arabic: "العقلية الريادية، والتحقق من صحة الأفكار، وأبحاث السوق، ونموذج الأعمال، واكتشاف العملاء، وتطوير المنتج الأولي. تحويل الأفكار إلى أعمال قابلة للحياة."
      },
    },
    {
      id: "m2",
      title: {
        English: "Financial Literacy for Entrepreneurs",
        Arabic: "الثقافة المالية لرواد الأعمال",
      },
      description: {
        English: "Learn to manage budgets, savings, and investments for your small business.",
        Arabic: "تعلم كيفية إدارة الميزانية والادخار والاستثمار لمشروعك الصغير.",
      },
      videoUrl: "https://www.youtube.com/embed/Np3GU7aS4nA",
      notes: {
        English: "Budgeting, cash flow management, profit vs revenue, pricing strategies, basic accounting, funding options (bootstrapping, loans, investors), financial planning.",
        Arabic: "إعداد الميزانية، وإدارة التدفق النقدي، والربح مقابل الإيرادات، واستراتيجيات التسعير، والمحاسبة الأساسية، وخيارات التمويل (التمويل الذاتي، القروض، المستثمرون)، والتخطيط المالي."
      },
    },
  ],
  "3": [
    {
      id: "1",
      title: {
        English: "Introduction to Computers",
        Arabic: "مقدمة في الحاسوب",
      },
      description: {
        English: "Learn the basics of computer hardware, software, and operating systems.",
        Arabic: "تعلم أساسيات العتاد والبرمجيات وأنظمة التشغيل.",
      },
      videoUrl: "https://www.youtube.com/embed/8Z3Y0sU1y1M",
      notes: {
        English: "Computer components (CPU, RAM, storage), operating systems (Windows, macOS, Linux), file management, keyboard shortcuts, basic troubleshooting.",
        Arabic: "مكونات الكمبيوتر (المعالج، الذاكرة، التخزين)، وأنظمة التشغيل (Windows، macOS، Linux)، وإدارة الملفات، واختصارات لوحة المفاتيح، واستكشاف الأخطاء الأساسية."
      },
    },
    {
      id: "2",
      title: {
        English: "Internet Basics",
        Arabic: "أساسيات الإنترنت",
      },
      description: {
        English: "Understand how to browse safely and use online tools effectively.",
        Arabic: "افهم كيفية التصفح بأمان واستخدام الأدوات عبر الإنترنت بفعالية.",
      },
      videoUrl: "https://www.youtube.com/embed/YuZP1JmRzjI",
      notes: {
        English: "Web browsers, search engines, online safety, email basics, cloud storage (Google Drive, Dropbox), effective internet research for education and work.",
        Arabic: "متصفحات الويب، ومحركات البحث، والسلامة عبر الإنترنت، وأساسيات البريد الإلكتروني، والتخزين السحابي (Google Drive، Dropbox)، وتقنيات البحث الفعالة عبر الإنترنت للتعليم والعمل."
      },
    },
  ],
  "4": [
    {
      id: "1",
      title: {
        English: "Public Speaking Basics",
        Arabic: "أساسيات الخطابة",
      },
      description: {
        English: "Learn how to speak confidently in front of an audience.",
        Arabic: "تعلم كيفية التحدث بثقة أمام الجمهور.",
      },
      videoUrl: "https://www.youtube.com/embed/zvR9sXKQeB0",
      notes: {
        English: "Public speaking fundamentals: body language, voice projection, overcoming stage fright, structuring presentations, engaging audiences, delivering impactful speeches.",
        Arabic: "أساسيات الخطابة العامة: لغة الجسد، وإسقاط الصوت، والتغلب على الخوف من المسرح، وهيكلة العروض التقديمية، وإشراك الجماهير، وإلقاء الخطب المؤثرة بثقة."
      },
    },
    {
      id: "2",
      title: {
        English: "Team Leadership",
        Arabic: "قيادة الفريق",
      },
      description: {
        English: "Develop skills to lead and motivate teams effectively.",
        Arabic: "طور مهارات قيادة وتحفيز الفرق بفعالية.",
      },
      videoUrl: "https://www.youtube.com/embed/Np3GU7aS4nA",
      notes: {
        English: "Leadership skills: team motivation, conflict resolution, delegation, decision-making, emotional intelligence, building trust, creating high-performing teams.",
        Arabic: "مهارات القيادة: تحفيز الفريق، وحل النزاعات، والتفويض، واتخاذ القرارات، والذكاء العاطفي، وبناء الثقة، وإنشاء فرق عالية الأداء."
      },
    },
  ],
};

const ModuleDetail: React.FC = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [showNotes, setShowNotes] = useState(false);

  const courseModules = modulesData[id as string];
  const moduleIndex = courseModules?.findIndex((m) => m.id === moduleId?.toString());
  const module = moduleIndex !== undefined && moduleIndex >= 0 ? courseModules[moduleIndex] : null;
  const isArabic = language === "Arabic";

  useEffect(() => {
    const saved = localStorage.getItem(`progress-course-${id}`);
    if (saved) setProgress(JSON.parse(saved));
  }, [id]);
  
  useEffect(() => {
    if (!module) return;

    setProgress((prev) => {
      if (prev[module.id]) return prev;
      const newProgress = { ...prev, [module.id]: true };
      localStorage.setItem(`progress-course-${id}`, JSON.stringify(newProgress));
      return newProgress;
    });
  }, [module, id]);

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
      navigate(`/quiz/${id}?module=${module.id}`);
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
          src={`${module.videoUrl}?modestbranding=1&rel=0&showinfo=0&fs=1`}
          title={module.title[language]}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="notes-section">
          <h3>{isArabic ? "ملاحظات الوحدة" : "Module Notes"}</h3>
          <p>{module.notes[language]}</p>
        </div>
      )}

      {/* Notes & Buttons */}
      <div className="module-actions">
        <button className="btn download-btn" onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? (isArabic ? "إخفاء الملاحظات" : "Hide Notes") : (isArabic ? "عرض الملاحظات" : "View Notes")}
        </button>

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
