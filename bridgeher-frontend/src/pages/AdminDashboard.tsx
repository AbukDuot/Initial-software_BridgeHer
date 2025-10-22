import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useLanguage } from "../context/LanguageContext";
import adminDashboardTranslations from "../i18n/adminDashboardTranslations";
import { toArabicNumerals } from "../utils/numberUtils";
import "../styles/adminDashboard.css";

const playUiSound = (enabled: boolean) => {
  if (!enabled) return;
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 540;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (err) {
    console.warn("Sound failed:", err);
  }
};

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";
  const lang = isArabic ? "ar" : "en";
  const t = adminDashboardTranslations[lang];

  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("bh-theme") as "light" | "dark") || "light"
  );
  const [sound, setSound] = useState<boolean>(() => {
    const s = localStorage.getItem("bh-sound");
    return s ? JSON.parse(s) : true;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bh-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("bh-sound", JSON.stringify(sound));
  }, [sound]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalMentors: 0,
    activeLearners: 0,
  });

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  }

  interface Course {
    id: number;
    title: string;
    enrollments: number;
    status: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Learner", status: "Active" });
  const [courseForm, setCourseForm] = useState({ title: "", enrollments: 0, status: "Active" });

  useEffect(() => {
    setStats({
      totalUsers: 150,
      totalCourses: 12,
      totalMentors: 8,
      activeLearners: 120,
    });

    setUsers([
      { id: 1, name: isArabic ? "أبوك ماين" : "Abuk Mayen", email: isArabic ? "أبوك@مثال.كوم" : "abuk@test.com", role: isArabic ? "متعلم" : "Learner", status: isArabic ? "نشط" : "Active" },
      { id: 2, name: isArabic ? "بريسيلا أيوين" : "Priscilla Ayuen", email: isArabic ? "بريسيلا@مثال.كوم" : "priscilla@test.com", role: isArabic ? "مرشد" : "Mentor", status: isArabic ? "نشط" : "Active" },
    ]);

    setCourses([
      { id: 1, title: isArabic ? "الثقافة المالية" : "Financial Literacy", enrollments: 45, status: isArabic ? "نشط" : "Active" },
      { id: 2, title: isArabic ? "ريادة الأعمال ١٠١" : "Entrepreneurship 101", enrollments: 38, status: isArabic ? "نشط" : "Active" },
    ]);
  }, [isArabic]);

  const handleAddUser = () => {
    playUiSound(sound);
    console.log('Add User button clicked');
    console.log('Current showUserModal state:', showUserModal);
    setEditingUser(null);
    setUserForm({ name: "", email: "", role: "Learner", status: "Active" });
    setShowUserModal(true);
    console.log('Modal state set to true');
    setTimeout(() => {
      console.log('After setState - showUserModal:', showUserModal);
    }, 100);
  };

  const handleEditUser = (user: User) => {
    playUiSound(sound);
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    playUiSound(sound);
    console.log('Save User clicked', userForm);
    if (!userForm.name || !userForm.email) {
      alert(isArabic ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...editingUser, ...userForm } : u);
      console.log('Updating user', updated);
      setUsers(updated);
    } else {
      const newUser = { id: Date.now(), ...userForm };
      console.log('Adding new user', newUser);
      console.log('Current users:', users);
      const updatedUsers = [...users, newUser];
      console.log('Updated users array:', updatedUsers);
      setUsers(updatedUsers);
    }
    setShowUserModal(false);
    console.log('Modal closed');
  };

  const handleDeleteUser = (id: number) => {
    playUiSound(sound);
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddCourse = () => {
    playUiSound(sound);
    setEditingCourse(null);
    setCourseForm({ title: "", enrollments: 0, status: "Active" });
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    playUiSound(sound);
    setEditingCourse(course);
    setCourseForm({ title: course.title, enrollments: course.enrollments, status: course.status });
    setShowCourseModal(true);
  };

  const handleSaveCourse = () => {
    playUiSound(sound);
    if (!courseForm.title) {
      alert(isArabic ? "الرجاء إدخال عنوان الدورة" : "Please enter course title");
      return;
    }
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...editingCourse, ...courseForm } : c));
    } else {
      setCourses([...courses, { id: Date.now(), ...courseForm }]);
    }
    setShowCourseModal(false);
  };

  const handleDeleteCourse = (id: number) => {
    playUiSound(sound);
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذه الدورة؟" : "Are you sure you want to delete this course?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };



  return (
    <>
    <div className={`admin-dashboard ${isArabic ? "rtl" : ""}`}>
      <header className="admin-header">
        <h1>{t.title}</h1>
        <div className="theme-toggle">
          <button
            className={theme === "light" ? "active" : ""}
            onClick={() => {
              playUiSound(sound);
              setTheme("light");
            }}
          >
            {t.light}
          </button>
          <button
            className={theme === "dark" ? "active" : ""}
            onClick={() => {
              playUiSound(sound);
              setTheme("dark");
            }}
          >
            {t.dark}
          </button>
          <button
            onClick={() => {
              playUiSound(sound);
              setSound((s) => !s);
            }}
          >
            {sound ? `🔊 ${t.soundOn}` : `🔇 ${t.soundOff}`}
          </button>
        </div>
      </header>
      <section className="stats-overview">
        <h2>{t.overview}</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{isArabic ? toArabicNumerals(stats.totalUsers) : stats.totalUsers}</h3>
            <p>{t.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>{isArabic ? toArabicNumerals(stats.totalCourses) : stats.totalCourses}</h3>
            <p>{t.totalCourses}</p>
          </div>
          <div className="stat-card">
            <h3>{isArabic ? toArabicNumerals(stats.totalMentors) : stats.totalMentors}</h3>
            <p>{t.totalMentors}</p>
          </div>
          <div className="stat-card">
            <h3>{isArabic ? toArabicNumerals(stats.activeLearners) : stats.activeLearners}</h3>
            <p>{t.activeLearners}</p>
          </div>
        </div>
      </section>
      <section className="management-section">
        <div className="section-header">
          <h2>{t.userManagement}</h2>
          <button className="btn primary" onClick={handleAddUser}>{t.addUser}</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.name}</th>
              <th>{t.email}</th>
              <th>{t.role}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button className="btn-small" onClick={() => handleEditUser(user)}>{t.edit}</button>
                  <button className="btn-small danger" onClick={() => handleDeleteUser(user.id)}>{t.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="management-section">
        <div className="section-header">
          <h2>{t.courseManagement}</h2>
          <button className="btn primary" onClick={handleAddCourse}>{t.addCourse}</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.titleCol}</th>
              <th>{t.enrollments}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{isArabic ? toArabicNumerals(course.enrollments) : course.enrollments}</td>
                <td>{course.status}</td>
                <td>
                  <button className="btn-small" onClick={() => handleEditCourse(course)}>{t.edit}</button>
                  <button className="btn-small danger" onClick={() => handleDeleteCourse(course.id)}>{t.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showUserModal && ReactDOM.createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setShowUserModal(false)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              zIndex: 10000,
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <h3>{editingUser ? (isArabic ? "تعديل مستخدم" : "Edit User") : (isArabic ? "إضافة مستخدم" : "Add User")}</h3>
            <div className="form-group">
              <label>{t.name}</label>
              <input type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t.email}</label>
              <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t.role}</label>
              <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                <option value="Learner">{isArabic ? "متعلم" : "Learner"}</option>
                <option value="Mentor">{isArabic ? "مرشد" : "Mentor"}</option>
                <option value="Admin">{isArabic ? "مسؤول" : "Admin"}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select value={userForm.status} onChange={(e) => setUserForm({...userForm, status: e.target.value})}>
                <option value="Active">{isArabic ? "نشط" : "Active"}</option>
                <option value="Inactive">{isArabic ? "غير نشط" : "Inactive"}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={handleSaveUser}>
                {isArabic ? "حفظ" : "Save"}
              </button>
              <button className="btn" onClick={() => setShowUserModal(false)}>
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCourseModal && ReactDOM.createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setShowCourseModal(false)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              position: 'relative', 
              zIndex: 10000,
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <h3>{editingCourse ? (isArabic ? "تعديل دورة" : "Edit Course") : (isArabic ? "إضافة دورة" : "Add Course")}</h3>
            <div className="form-group">
              <label>{t.titleCol}</label>
              <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t.enrollments}</label>
              <input type="number" value={courseForm.enrollments} onChange={(e) => setCourseForm({...courseForm, enrollments: parseInt(e.target.value) || 0})} />
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select value={courseForm.status} onChange={(e) => setCourseForm({...courseForm, status: e.target.value})}>
                <option value="Active">{isArabic ? "نشط" : "Active"}</option>
                <option value="Inactive">{isArabic ? "غير نشط" : "Inactive"}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={handleSaveCourse}>
                {isArabic ? "حفظ" : "Save"}
              </button>
              <button className="btn" onClick={() => setShowCourseModal(false)}>
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
    </>
  );
};

export default AdminDashboard;
