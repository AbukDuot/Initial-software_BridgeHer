import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import adminDashboardTranslations from "../i18n/adminDashboardTranslations";
import { toArabicNumerals } from "../utils/numberUtils";
import { API_BASE_URL } from "../config/api";
import ModuleVideoManager from "../components/ModuleVideoManager";
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
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toasts, showToast: addToast, removeToast } = useToast();
  const isArabic = language === "Arabic";
  const lang = isArabic ? "ar" : "en";
  const t = adminDashboardTranslations[lang];

  const [sound, setSound] = useState<boolean>(() => {
    const s = localStorage.getItem("bh-sound");
    return s ? JSON.parse(s) : true;
  });

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
    status?: string;
  }

  interface Course {
    id: number;
    title: string;
    enrollments: number;
    status: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Learner", status: "Active" });
  const [courseForm, setCourseForm] = useState({ title: "", enrollments: 0, status: "Active" });
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [adminUser, setAdminUser] = useState<{id: number; name: string; email: string; role: string; profile_pic?: string} | null>(null);
  
  interface SupportMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    status: string;
    created_at: string;
  }
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  useEffect(() => {
    fetchData();
    fetchSupportMessages();
    const userData = localStorage.getItem('user');
    if (userData) {
      setAdminUser(JSON.parse(userData));
    }
    

    const handleFocus = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setAdminUser(JSON.parse(updatedUser));
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        addToast(isArabic ? "لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى" : "No authentication token found. Please login again.", "error");
        navigate("/login");
        return;
      }
      
      const [usersRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (usersRes.status === 401) {
        addToast(isArabic ? "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى" : "Session expired. Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        const mentorCount = usersData.filter((u: User) => u.role?.toLowerCase() === 'mentor').length;
        const learnerCount = usersData.filter((u: User) => u.role?.toLowerCase() === 'learner').length;
        setStats(prev => ({ 
          ...prev, 
          totalUsers: usersData.length,
          totalMentors: mentorCount,
          activeLearners: learnerCount
        }));
      }
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const enrollmentsRes = await fetch(`${API_BASE_URL}/api/admin/enrollments`, { headers: { Authorization: `Bearer ${token}` } });
        let enrollmentCounts: Record<number, number> = {};
        if (enrollmentsRes.ok) {
          const enrollments = await enrollmentsRes.json();
          enrollmentCounts = enrollments.reduce((acc: Record<number, number>, e: { course_id: number }) => {
            acc[e.course_id] = (acc[e.course_id] || 0) + 1;
            return acc;
          }, {});
        }
        setCourses(coursesData.map((c: Course) => ({ ...c, enrollments: enrollmentCounts[c.id] || 0, status: "Active" })));
        setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      addToast(isArabic ? "فشل في تحميل البيانات" : "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    console.log("Add User clicked");
    playUiSound(sound);
    setEditingUser(null);
    setUserForm({ name: "", email: "", role: "Learner", status: "Active" });
    setShowUserModal(true);
    console.log("showUserModal set to true");
  };

  const handleEditUser = (user: User) => {
    playUiSound(sound);
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status || "Active" });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    playUiSound(sound);
    if (!userForm.name || !userForm.email) {
      addToast(isArabic ? "الرجاء ملء جميع الحقول" : "Please fill all fields", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (editingUser) {
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(userForm)
        });
        if (res.ok) {
          await fetchData();
          setShowUserModal(false);
          addToast(isArabic ? "تم تحديث المستخدم بنجاح" : "User updated successfully", "success");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userForm, password: "Default123" })
        });
        if (res.ok) {
          await fetchData();
          setShowUserModal(false);
          addToast(isArabic ? "تمت إضافة المستخدم بنجاح" : "User added successfully", "success");
        }
      }
    } catch {
      addToast(isArabic ? "فشل في حفظ المستخدم" : "Failed to save user", "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    playUiSound(sound);
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          await fetchData();
          addToast(isArabic ? "تم حذف المستخدم بنجاح" : "User deleted successfully", "success");
        }
      } catch {
        addToast(isArabic ? "فشل في حذف المستخدم" : "Failed to delete user", "error");
      }
    }
  };

  const handleAddCourse = () => {
    console.log("Add Course clicked");
    playUiSound(sound);
    setEditingCourse(null);
    setCourseForm({ title: "", enrollments: 0, status: "Active" });
    setShowCourseModal(true);
    console.log("showCourseModal set to true");
  };

  const handleEditCourse = (course: Course) => {
    playUiSound(sound);
    setEditingCourse(course);
    setCourseForm({ title: course.title, enrollments: course.enrollments, status: course.status });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    playUiSound(sound);
    if (!courseForm.title) {
      addToast(isArabic ? "الرجاء إدخال عنوان الدورة" : "Please enter course title", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (editingCourse) {
        const res = await fetch(`${API_BASE_URL}/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: courseForm.title, description: "", category: "General", level: "Beginner", duration: "4 weeks", mentor: "Admin" })
        });
        if (res.ok) {
          await fetchData();
          setShowCourseModal(false);
          addToast(isArabic ? "تم تحديث الدورة بنجاح" : "Course updated successfully", "success");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: courseForm.title, description: "", category: "General", level: "Beginner", duration: "4 weeks", mentor: "Admin" })
        });
        if (res.ok) {
          await fetchData();
          setShowCourseModal(false);
          addToast(isArabic ? "تمت إضافة الدورة بنجاح" : "Course added successfully", "success");
        }
      }
    } catch {
      addToast(isArabic ? "فشل في حفظ الدورة" : "Failed to save course", "error");
    }
  };

  const handleDeleteCourse = async (id: number) => {
    playUiSound(sound);
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذه الدورة؟" : "Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          await fetchData();
          addToast(isArabic ? "تم حذف الدورة بنجاح" : "Course deleted successfully", "success");
        }
      } catch {
        addToast(isArabic ? "فشل في حذف الدورة" : "Failed to delete course", "error");
      }
    }
  };

  const fetchSupportMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/support/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSupportMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch support messages", err);
    }
  };

  const handleResolveMessage = async (id: number) => {
    playUiSound(sound);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/support/messages/${id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchSupportMessages();
        addToast(isArabic ? "تم وضع علامة كمحلول" : "Marked as resolved", "success");
      }
    } catch {
      addToast(isArabic ? "فشل في التحديث" : "Failed to update", "error");
    }
  };

  const handleReplyEmail = (email: string) => {
    playUiSound(sound);
    const message = isArabic 
      ? `البريد الإلكتروني للمتعلم:\n\n${email}\n\nانسخ هذا البريد وارسل ردك عبر Gmail أو Outlook`
      : `Learner's Email:\n\n${email}\n\nCopy this email and send your reply via Gmail or Outlook`;
    alert(message);
  };

  if (loading) {
    return <LoadingSpinner size="large" message={isArabic ? "جارٍ التحميل..." : "Loading..."} />;
  }

  return (
    <>
    {toasts.map((toast) => (
      <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
    ))}
    <div className={`admin-dashboard ${isArabic ? "rtl" : ""}`}>
      <header className="admin-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          {adminUser && (
            <img 
              src={adminUser.profile_pic || "/default-profile.png"} 
              alt="Profile" 
              key={adminUser.profile_pic}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #FFD700'
              }}
            />
          )}
          <div>
            <h1 style={{margin: 0}}>{t.title}</h1>
            {adminUser && <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>{adminUser.name}</p>}
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin-reports')} 
          className="btn" 
          style={{
            marginRight: '10px', 
            background: '#FFD700', 
            color: '#4A148C',
            fontWeight: '600',
            border: '2px solid #4A148C'
          }}
        >
          {isArabic ? 'البلاغات' : 'Reports'}
        </button>
        <div className="theme-toggle">
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
        <div className="data-table">
          <table>
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{textAlign: 'center', padding: '40px'}}>
                  <p style={{marginBottom: '20px'}}>{isArabic ? "لا يوجد مستخدمون بعد" : "No users yet"}</p>
                  <button className="btn primary" onClick={handleAddUser}>{isArabic ? "إضافة أول مستخدم" : "Add First User"}</button>
                </td>
              </tr>
            ) : users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status || "Active"}</td>
                <td>
                  <button className="btn-small" onClick={() => handleEditUser(user)}>{t.edit}</button>
                  <button className="btn-small danger" onClick={() => handleDeleteUser(user.id)}>{t.delete}</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="management-section">
        <div className="section-header">
          <h2>{t.courseManagement}</h2>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            <button className="btn primary" onClick={() => navigate('/admin-course-upload')}>
               {isArabic ? 'رفع دورة بالفيديو' : 'Upload Course with Videos'}
            </button>
            <button className="btn primary" onClick={() => setShowVideoManager(true)}>
               {isArabic ? 'إدارة فيديوهات الوحدات' : 'Manage Module Videos'}
            </button>
            <button className="btn primary" onClick={handleAddCourse}>{t.addCourse}</button>
          </div>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>{t.titleCol}</th>
                <th>{t.enrollments}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} style={{textAlign: 'center', padding: '40px'}}>
                  <p style={{marginBottom: '20px'}}>{isArabic ? "لا توجد دورات بعد" : "No courses yet"}</p>
                  <button className="btn primary" onClick={handleAddCourse}>{isArabic ? "إضافة أول دورة" : "Add First Course"}</button>
                </td>
              </tr>
            ) : courses.map((course) => (
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
        </div>
      </section>

      <section className="management-section">
        <div className="section-header">
          <h2>{isArabic ? 'رسائل الدعم' : 'Support Messages'}</h2>
          <span style={{color: '#666', fontSize: '0.9rem'}}>
            {isArabic ? `${toArabicNumerals(supportMessages.filter(m => m.status === 'pending').length)} قيد الانتظار` : `${supportMessages.filter(m => m.status === 'pending').length} Pending`}
          </span>
        </div>
        <div className="data-table">
          {supportMessages.length === 0 ? (
            <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              {isArabic ? 'لا توجد رسائل دعم بعد' : 'No support messages yet'}
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{isArabic ? 'الاسم' : 'Name'}</th>
                  <th>{isArabic ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th>{isArabic ? 'الرسالة' : 'Message'}</th>
                  <th>{isArabic ? 'التاريخ' : 'Date'}</th>
                  <th>{isArabic ? 'الحالة' : 'Status'}</th>
                  <th>{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {supportMessages.map((msg) => (
                  <tr key={msg.id} style={{backgroundColor: msg.status === 'resolved' ? '#f0f0f0' : 'white'}}>
                    <td style={{minWidth: '100px'}}>{msg.name}</td>
                    <td style={{minWidth: '150px'}}>{msg.email}</td>
                    <td style={{maxWidth: '200px', minWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {msg.message}
                    </td>
                    <td style={{minWidth: '100px'}}>{new Date(msg.created_at).toLocaleDateString()}</td>
                    <td style={{minWidth: '80px'}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: msg.status === 'resolved' ? '#4CAF50' : '#FF9800',
                        color: 'white',
                        whiteSpace: 'nowrap'
                      }}>
                        {msg.status === 'resolved' ? (isArabic ? 'محلول' : 'Resolved') : (isArabic ? 'قيد الانتظار' : 'Pending')}
                      </span>
                    </td>
                    <td style={{minWidth: '120px'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <button 
                          className="btn-small" 
                          onClick={() => handleReplyEmail(msg.email)}
                          style={{margin: 0, width: '100%'}}
                        >
                          {isArabic ? 'رد' : 'Reply'}
                        </button>
                        {msg.status === 'pending' && (
                          <button 
                            className="btn-small" 
                            onClick={() => handleResolveMessage(msg.id)}
                            style={{background: '#4CAF50', color: 'white', margin: 0, width: '100%'}}
                          >
                            {isArabic ? 'حل' : 'Resolve'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
    {showUserModal && (
      <div className="modal-overlay" onClick={() => setShowUserModal(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000}}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
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
            <button className="btn primary" onClick={handleSaveUser}>{isArabic ? "حفظ" : "Save"}</button>
            <button className="btn" onClick={() => setShowUserModal(false)}>{isArabic ? "إلغاء" : "Cancel"}</button>
          </div>
        </div>
      </div>
    )}

    {showCourseModal && (
      <div className="modal-overlay" onClick={() => setShowCourseModal(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000}}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
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
            <button className="btn primary" onClick={handleSaveCourse}>{isArabic ? "حفظ" : "Save"}</button>
            <button className="btn" onClick={() => setShowCourseModal(false)}>{isArabic ? "إلغاء" : "Cancel"}</button>
          </div>
        </div>
      </div>
    )}
    
    {showVideoManager && (
      <div className="modal-overlay" onClick={() => setShowVideoManager(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px'}}>
        <div onClick={(e) => e.stopPropagation()} style={{width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto', background: 'white', borderRadius: '12px', padding: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0}}>{isArabic ? 'إدارة فيديوهات الوحدات' : 'Module Video Manager'}</h3>
            <button onClick={() => setShowVideoManager(false)} style={{background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#333'}}>×</button>
          </div>
          <ModuleVideoManager />
        </div>
      </div>
    )}
    </>
  );
};

export default AdminDashboard;
