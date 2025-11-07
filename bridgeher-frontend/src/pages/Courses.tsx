import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import CoursePreview from "../components/CoursePreview";
import EnhancedSearch from "../components/EnhancedSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import EnhancedCourseCard from "../components/EnhancedCourseCard";
import coursesTranslations from "../i18n/coursesTranslations";
import { API_BASE_URL } from "../config/api";
import "../styles/courses.css";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  mentor: string;
  enrolled?: boolean;
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
  const [, setEnrolling] = useState<number | null>(null);
  const [previewCourse, setPreviewCourse] = useState<number | null>(null);

  const t = coursesTranslations[language];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await res.json();
      
      if (token) {
        const enrolledRes = await fetch(`${API_BASE_URL}/api/courses/my/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const enrolled = await enrolledRes.json();
        const enrolledIds = enrolled.map((c: any) => c.id);
        setCourses(data.map((c: Course) => ({ ...c, enrolled: enrolledIds.includes(c.id) })));
      } else {
        setCourses(data);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(language === "Arabic" ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      return;
    }
    
    setEnrolling(courseId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCourses(courses.map(c => c.id === courseId ? { ...c, enrolled: true } : c));
        alert(language === "Arabic" ? "تم التسجيل بنجاح!" : "Enrolled successfully!");
      } else {
        alert(language === "Arabic" ? "فشل التسجيل" : "Enrollment failed");
      }
    } catch (err) {
      alert(language === "Arabic" ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      const matchesLevel = level === "All" || course.level === level;
      const matchesSearch = search === "" || 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.mentor.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesLevel && matchesSearch;
    });

    if (sortBy === "newest") {
      filtered = [...filtered].reverse();
    } else if (sortBy === "title") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [courses, category, level, search, sortBy]);

  return (
    <section className="courses-page">
      <div className="courses-header">
        <h2>{t.pageTitle}</h2>
        <p>{t.intro}</p>
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="filters-container">
        <EnhancedSearch
          onSearch={setSearch}
          placeholder={t.searchPlaceholder}
        />
        
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

      {loading ? (
        <LoadingSpinner size="large" message={language === "Arabic" ? "جارٍ تحميل الدورات..." : "Loading courses..."} />
      ) : filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>{language === "Arabic" ? "لا توجد دورات متاحة" : "No courses found"}</p>
        </div>
      ) : (
        <div className="courses-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', padding: '20px 0'}}>
          {filteredCourses.map((course) => (
            <EnhancedCourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              category={course.category}
              level={course.level}
              duration={course.duration}
              instructor={course.mentor}
              enrolled={course.enrolled}
              language={language}
              onEnroll={handleEnroll}
              onPreview={setPreviewCourse}
            />
          ))}
        </div>
      )}
      
      {previewCourse && (
        <CoursePreview
          courseId={previewCourse.toString()}
          onEnroll={() => {
            handleEnroll(previewCourse);
            setPreviewCourse(null);
          }}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </section>
  );
};

export default Courses;
