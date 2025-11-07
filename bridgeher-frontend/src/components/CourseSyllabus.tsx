import React, { useState } from "react";
import "../styles/courseSyllabus.css";

interface Module {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  durationMinutes?: number;
  weekNumber?: number;
}

interface CourseSyllabusProps {
  modules: Module[];
  language: string;
  enrolled: boolean;
  onModuleClick?: (moduleId: number) => void;
}

const CourseSyllabus: React.FC<CourseSyllabusProps> = ({
  modules,
  language,
  enrolled,
  onModuleClick
}) => {
  const isArabic = language === "Arabic";
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const groupedByWeek = modules.reduce((acc, module) => {
    const week = module.weekNumber || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(module);
    return acc;
  }, {} as Record<number, Module[]>);

  const weeks = Object.keys(groupedByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="course-syllabus">
      <h3>{isArabic ? "المنهج الدراسي" : "Course Syllabus"}</h3>
      
      <div className="syllabus-weeks">
        {weeks.map((weekNum) => {
          const weekModules = groupedByWeek[weekNum];
          const totalDuration = weekModules.reduce((sum, m) => sum + (m.durationMinutes || 15), 0);
          const isExpanded = expandedWeek === weekNum;
          
          return (
            <div key={weekNum} className="syllabus-week">
              <div 
                className="week-header"
                onClick={() => setExpandedWeek(isExpanded ? null : weekNum)}
              >
                <div className="week-title">
                  <span className="week-number">
                    {isArabic ? `الأسبوع ${weekNum}` : `Week ${weekNum}`}
                  </span>
                  <span className="week-meta">
                    {weekModules.length} {isArabic ? "وحدات" : "modules"} • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </span>
                </div>
                <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
              </div>
              
              {isExpanded && (
                <div className="week-modules">
                  {weekModules.map((module, idx) => (
                    <div 
                      key={module.id} 
                      className={`module-item ${enrolled ? 'clickable' : 'locked'}`}
                      onClick={() => enrolled && onModuleClick && onModuleClick(module.id)}
                    >
                      <div className="module-number">{idx + 1}</div>
                      <div className="module-info">
                        <h4>{isArabic && module.titleAr ? module.titleAr : module.title}</h4>
                        {module.description && <p>{module.description}</p>}
                      </div>
                      <div className="module-duration">
                        {module.durationMinutes || 15} {isArabic ? "دقيقة" : "min"}
                      </div>
                      {!enrolled && <span className="lock-icon">🔒</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSyllabus;
