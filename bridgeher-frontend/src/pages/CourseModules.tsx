import React, { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Link } from "react-router-dom";
import ModuleCard from "../components/ModuleCard";
import VideoPlayer from "../components/VideoPlayer";
import NotesCard from "../components/NotesCard";
import "../styles/modules.css";

interface Module {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  notes: string[];
}

interface ModulesData {
  English: Module[];
  Arabic: Module[];
}

const CourseModules: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      const res = await fetch("/data/modulesData.json");
      const data: ModulesData = await res.json();
      setModules(data[language]);
    };
    fetchModules();
  }, [language]);

  if (!modules.length) return <p>{isArabic ? "جارٍ التحميل..." : "Loading..."}</p>;

  return (
    <div className={`modules-page ${isArabic ? "rtl" : ""}`}>
      {!selectedModule ? (
        <>
          <h2>{isArabic ? "الوحدات التعليمية" : "Learning Modules"}</h2>
          <div className="modules-grid">
            {modules.map((m) => (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                onView={() => setSelectedModule(m)}
                language={language}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="module-content">
          <button className="btn secondary back-btn" onClick={() => setSelectedModule(null)}>
            {isArabic ? "عودة إلى الوحدات" : "Back to Modules"}
          </button>

          <h2>{selectedModule.title}</h2>
          <p>{selectedModule.description}</p>

          <VideoPlayer videoUrl={selectedModule.videoUrl} title={selectedModule.title} />
          <NotesCard notes={selectedModule.notes} language={language} />

          <Link to="/quiz" className="btn primary quiz-btn">
            {isArabic ? "ابدأ الاختبار" : "Start Quiz"}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseModules;
