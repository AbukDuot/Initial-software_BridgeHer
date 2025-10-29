import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import coursesTranslations from "../i18n/coursesTranslations";
import "../styles/courses.css";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  mentor: string;
}

const Courses: React.FC = () => {
  const { language } = useLanguage();
  const { toasts, removeToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  const t = coursesTranslations[language];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("${API_BASE_URL}/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      (course) => {
        // Category filter
        let matchesCategory = category === "All";
        if (!matchesCategory) {
          const categoryMap: Record<string, string> = {
            "Finance": language === "Arabic" ? "المالية" : "Finance",
            "Business": language === "Arabic" ? "الأعمال" : "Business",
            "Tech": language === "Arabic" ? "التكنولوجيا" : "Technology",
            "Leadership": language === "Arabic" ? "القيادة" : "Leadership"
          };
          matchesCategory = course.category === categoryMap[category];
        }
        
        // Level filter
        let matchesLevel = level === "All";
        if (!matchesLevel) {
          const levelMap: Record<string, string> = {
            "Beginner": language === "Arabic" ? "مبتدئ" : "Beginner",
            "Intermediate": language === "Arabic" ? "متوسط" : "Intermediate",
            "Advanced": language === "Arabic" ? "متقدم" : "Advanced"
          };
          matchesLevel = course.level === levelMap[level];
        }
        
        // Search filter
        const matchesSearch = search === "" || 
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase()) ||
          course.mentor.toLowerCase().includes(search.toLowerCase());
          
        return matchesCategory && matchesLevel && matchesSearch;
      }
    );

  
    if (sortBy === "newest") {
      filtered = [...filtered].reverse();
    } else if (sortBy === "popular") {
      
      filtered = [...filtered];
    } else if (sortBy === "title") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [courses, category, level, search, sortBy]);

  return (
    <section className="courses-page">
      <div className="courses-header">
        <h2>{t.pageTitle}</h2>
      </div>
      <p>{t.intro}</p>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Enhanced Filters */}
      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-group">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
            <option value="All">{t.filterAll}</option>
            <option value="Finance">{t.filterFinance}</option>
            <option value="Business">{t.filterBusiness}</option>
            <option value="Tech">{t.filterTech}</option>
            <option value="Leadership">{t.filterLeadership}</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)} className="filter-select">
            <option value="All">{language === "Arabic" ? "كل المستويات" : "All Levels"}</option>
            <option value="Beginner">{language === "Arabic" ? "مبتدئ" : "Beginner"}</option>
            <option value="Intermediate">{language === "Arabic" ? "متوسط" : "Intermediate"}</option>
            <option value="Advanced">{language === "Arabic" ? "متقدم" : "Advanced"}</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="newest">{language === "Arabic" ? "الأحدث" : "Newest"}</option>
            <option value="popular">{language === "Arabic" ? "الأكثر شعبية" : "Most Popular"}</option>
            <option value="title">{language === "Arabic" ? "الاسم" : "Title A-Z"}</option>
          </select>
        </div>

        <div className="results-count">
          {language === "Arabic" 
            ? `${filteredCourses.length} دورة متاحة`
            : `${filteredCourses.length} courses available`}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <LoadingSpinner size="large" message={language === "Arabic" ? "جارٍ تحميل الدورات..." : "Loading courses..."} />
      ) : filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>{language === "Arabic" ? "لا توجد دورات متاحة" : "No courses found"}</p>
        </div>
      ) : (
        <div className={`courses-grid ${language === "Arabic" ? "rtl" : ""}`}>
        {filteredCourses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p className="category">{course.category}</p>
            <p>{course.description}</p>
            <p><strong> {course.mentor}</strong></p>
            <p><strong> {course.level}</strong> |  {course.duration}</p>
            <Link to={`/course-player/${course.id}`} className="details-btn">
              {t.viewCourse}
            </Link>
          </div>
        ))}
        </div>
      )}
    </section>
  );
};

export default Courses;
