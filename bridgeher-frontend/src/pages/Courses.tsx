import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import coursesTranslations from "../i18n/coursesTranslations";
import "../styles/courses.css";

const Courses: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const t = coursesTranslations[language];

  const filteredCourses = t.courses.filter(
    (course) =>
      (category === "All" || course.category === t[`filter${category}` as keyof typeof t]) &&
      course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="courses-page">
      <div className="courses-header">
        <h2>{t.pageTitle}</h2>
      </div>
      <p>{t.intro}</p>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">{t.filterAll}</option>
          <option value="Finance">{t.filterFinance}</option>
          <option value="Business">{t.filterBusiness}</option>
          <option value="Tech">{t.filterTech}</option>
          <option value="Leadership">{t.filterLeadership}</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className={`courses-grid ${language === "Arabic" ? "rtl" : ""}`}>
        {filteredCourses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p className="category">{course.category}</p>
            <p>{course.description}</p>
            <p><strong> {course.mentor}</strong></p>
            <p><strong> {course.level}</strong> |  {course.duration}</p>
            <Link to={`/course/${course.id}`} className="details-btn">
              {t.viewCourse}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Courses;
