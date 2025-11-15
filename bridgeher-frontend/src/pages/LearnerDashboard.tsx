import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useLanguage } from "../hooks/useLanguage";
import { toArabicNumerals } from "../utils/numberUtils";
import { API_BASE_URL } from "../config/api";
import "../styles/learnerdashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const tMap = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      courses: "Courses",
      mentorship: "Mentorship",
      certificates: "Certificates",
      settings: "Settings",
    },
    header: {
      welcome: "Welcome back,",
      sub: "Keep learning and growing with purpose.",
      light: "Light",
      dark: "Dark",
      soundOn: "Sound On",
      soundOff: "Sound Off",
    },
    stats: { streak: "Day Streak", xp: "XP Points", level: "Current Level" },
    analytics: {
      title: "Learning Analytics",
      weekly: "Weekly Learning Hours",
      completion: "Course Completion",
      completed: "Completed",
      remaining: "Remaining",
    },
    reminders: {
      title: "Reminders",
      add: "Add Reminder",
      placeholder: "Enter a new reminder...",
      done: "Done",
      remove: "Remove",
      empty: "No reminders yet — add one below!",
    },
    calendar: {
      title: "Your Google Calendar",
      desc: "View your upcoming sessions and course events.",
      note: "You can sync this calendar with your Google Account for automatic updates.",
    },
    quotes: [
      "Small steps every day lead to big change.",
      "Learning is a journey, not a race.",
      "Consistency beats intensity.",
      "Your future is built by what you do today.",
    ],
  },
  ar: {
    sidebar: {
      dashboard: "لوحة التحكم",
      courses: "الدورات",
      mentorship: "الإرشاد",
      certificates: "الشهادات",
      settings: "الإعدادات",
    },
    header: {
      welcome: "مرحباً بعودتكِ،",
      sub: "واصلي التعلم والنمو بثقة وتميّز.",
      light: "فاتح",
      dark: "داكن",
      soundOn: "الصوت مفعل",
      soundOff: "الصوت متوقف",
    },
    stats: {
      streak: "السلسلة المتتالية",
      xp: "نقاط الخبرة",
      level: "المستوى الحالي",
    },
    analytics: {
      title: "تحليلات التعلم",
      weekly: "ساعات التعلم الأسبوعية",
      completion: "معدل الإكمال",
      completed: "مكتمل",
      remaining: "متبقي",
    },
    reminders: {
      title: "التذكيرات",
      add: "إضافة تذكير",
      placeholder: "أدخل تذكيراً جديداً...",
      done: "تم",
      remove: "حذف",
      empty: "لا توجد تذكيرات بعد — أضيفي واحدة أدناه!",
    },
    calendar: {
      title: "التقويم الخاص بكِ",
      desc: "شاهدي مواعيد جلساتك ودوراتك.",
      note: "يمكنك ربط هذا التقويم بحسابك في Google لمزامنة الجلسات تلقائيًا.",
    },
    quotes: [
      "خطوة صغيرة كل يوم تصنع فرقًا كبيرًا.",
      "التعلُّم رحلة وليست سباقًا.",
      "الثبات يتفوق على الحِدّة.",
      "مستقبلك يُبنى بما تفعلينه اليوم.",
    ],
  },
};

const playUiSound = (enabled: boolean, tone: "tap" | "success" = "tap") => {
  if (!enabled) return;
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = tone === "success" ? 650 : 540;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (err) {
    console.warn("playUiSound failed:", err);
  }
};

const LearnerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === "Arabic";
  const t = isAr ? tMap.ar : tMap.en;

  const [sound, setSound] = useState<boolean>(() => {
    const s = localStorage.getItem("bh-sound");
    return s ? JSON.parse(s) : true;
  });

  const theme = (document.documentElement.dataset.theme as "light" | "dark") || "light";

  useEffect(() => {
    localStorage.setItem("bh-sound", JSON.stringify(sound));
  }, [sound]);

  interface DashboardData {
    user?: { email: string; name?: string; calendar_id?: string };
    stats?: Record<string, number>;
    completion?: { completed: number; remaining: number };
    dailyQuote?: { en: string; ar: string };
    weeklyHours?: number[];
  }

  interface LearnerUser {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_pic?: string;
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<{ id: number; reminder_text: string; done: boolean; isNew?: boolean; reminder_time?: string }[]>([]);
  const [input, setInput] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [learnerUser, setLearnerUser] = useState<LearnerUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setLearnerUser(JSON.parse(userData));
    }
    
    // Refresh user data on focus (when returning from settings)
    const handleFocus = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setLearnerUser(JSON.parse(updatedUser));
      }
    };
    window.addEventListener('focus', handleFocus);
    
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/dashboards/learner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        console.log('📊 Learner Dashboard Data:', data);
        console.log('📊 Weekly Hours:', data.weeklyHours);
        console.log('📊 Calendar ID:', data.user?.calendar_id);
        
        // Verify the user data matches the logged-in user
        const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
        console.log('📊 Stored user:', storedUser);
        console.log('📊 API returned user:', data.user);
        
        if (data.user && storedUser.email && data.user.email !== storedUser.email) {
          console.error('⚠️ User mismatch! Stored:', storedUser.email, 'API returned:', data.user.email);
          alert('Session error detected. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/reminders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReminders(data);
        }
      } catch (err) {
        console.error("Failed to fetch reminders", err);
      }
    };
    fetchReminders();
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(r => {
        if (!r.done && r.reminder_time) {
          const reminderDate = new Date(r.reminder_time);
          const diff = reminderDate.getTime() - now.getTime();
          if (diff > 0 && diff < 60000) {
            if (Notification.permission === 'granted') {
              new Notification('BridgeHer Reminder', {
                body: r.reminder_text,
                icon: '/logo.png'
              });
            }
            playUiSound(sound, 'success');
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders, sound]);

  const { user, stats = {}, completion = { completed: 0, remaining: 100 }, dailyQuote = { en: "", ar: "" } } = dashboardData || {};
  
  // Always use the stored user as the source of truth for display
  const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
  const userName = storedUser?.name || user?.name || "User";
  const { streak = 0, xp = 0, level = 1 } = stats;

  const chartTextColor = theme === "dark" ? "#FFFFFF" : "#333333";
  const chartGridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const weeklyHours = dashboardData?.weeklyHours || [0, 0, 0, 0, 0, 0, 0];
  
  const weeklyData = useMemo(
    () => ({
      labels: isAr
        ? ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: t.analytics.weekly,
          data: weeklyHours,
          backgroundColor: "#4A148C",
        },
      ],
    }),
    [isAr, t.analytics.weekly, weeklyHours]
  );

  const completionData = useMemo(
    () => ({
      labels: [t.analytics.completed, t.analytics.remaining],
      datasets: [
        {
          data: [completion.completed, completion.remaining],
          backgroundColor: ["#6A1B9A", "#FFD700"],
          cutout: "75%",
        },
      ],
    }),
    [t.analytics.completed, t.analytics.remaining, completion]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { labels: { color: chartTextColor } },
        title: { color: chartTextColor },
      },
      scales: {
        x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
        y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
      },
    }),
    [chartTextColor, chartGridColor]
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (!dashboardData) return <div className="error">Failed to load dashboard</div>;

  const addReminder = async () => {
    if (!input.trim()) return;
    playUiSound(sound);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: input, reminderTime: reminderTime || null })
      });
      if (res.ok) {
        const newReminder = await res.json();
        setReminders((prev) => [{ ...newReminder, isNew: true }, ...prev]);
        setInput("");
        setReminderTime("");
      }
    } catch (err) {
      console.error("Failed to add reminder", err);
    }
  };

  const toggleDone = async (id: number) => {
    playUiSound(sound, "success");
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ done: !reminder.done })
      });
      if (res.ok) {
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
      }
    } catch (err) {
      console.error("Failed to update reminder", (err as Error).message);
    }
  };

  const remove = async (id: number) => {
    playUiSound(sound);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete reminder", (err as Error).message);
    }
  };



  return (
    <div className={`learner-dashboard ${isAr ? "rtl" : ""}`}>
      <aside className="sidebar">
        <div className="user-section">
          <img 
            src={learnerUser?.profile_pic || "/default-profile.png"} 
            alt="Profile" 
            className="user-avatar"
            key={learnerUser?.profile_pic}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #FFD700'
            }}
          />
          <div>
            <h3>{userName}</h3>
            <p>{isAr ? "متعلمة متميزة" : "Star Learner"}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/learner-dashboard" className="nav-item active">
            {t.sidebar.dashboard}
          </Link>
          <Link to="/courses" className="nav-item">
            {t.sidebar.courses}
          </Link>
          <Link to="/mentorship" className="nav-item">
            {t.sidebar.mentorship}
          </Link>
          <Link to="/my-certificates" className="nav-item">
            {t.sidebar.certificates}
          </Link>
          <Link to="/settings" className="nav-item">
            {t.sidebar.settings}
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>
              {t.header.welcome} <span className="highlight">{userName}</span>
            </h1>
            <p>{t.header.sub}</p>
          </div>
          <div className="theme-toggle">
            <button
              onClick={() => {
                playUiSound(sound);
                setSound((s) => !s);
              }}
            >
              {sound ? "🔊 " + t.header.soundOn : "🔇 " + t.header.soundOff}
            </button>
          </div>
        </header>

        {dailyQuote && (
          <section className="card">
            <strong>{isAr ? dailyQuote.ar : dailyQuote.en}</strong>
          </section>
        )}

        <section className="stats-section">
          <div className="stat-card">
            <h3>{isAr ? toArabicNumerals(streak) : streak}</h3>
            <p>{t.stats.streak}</p>
          </div>
          <div className="stat-card">
            <h3>{isAr ? toArabicNumerals(xp) : xp}</h3>
            <p>{t.stats.xp}</p>
          </div>
          <div className="stat-card">
            <h3>{isAr ? `${toArabicNumerals(level)} Lv` : `Lv ${level}`}</h3>
            <p>{t.stats.level}</p>
          </div>
        </section>

        <section className="analytics-section">
          <h2>{t.analytics.title}</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <h4>{t.analytics.weekly}</h4>
              <Bar data={weeklyData} options={chartOptions} />
            </div>
            <div className="chart-card">
              <h4>{t.analytics.completion}</h4>
              <Doughnut data={completionData} options={chartOptions} />
            </div>
          </div>
        </section>

        <section className="reminders-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <h2>{t.reminders.title}</h2>
            <button 
              className="btn-small" 
              onClick={() => {
                console.log('Notification button clicked');
                if (!('Notification' in window)) {
                  alert(isAr ? 'المتصفح لا يدعم التنبيهات' : 'Browser does not support notifications');
                  return;
                }
                
                console.log('Current permission:', Notification.permission);
                
                if (Notification.permission === 'granted') {
                  try {
                    new Notification('BridgeHer', {
                      body: isAr ? 'التنبيهات مفعلة بالفعل!' : 'Notifications already enabled!',
                      icon: '/logo.png'
                    });
                    playUiSound(sound, 'success');
                  } catch (err) {
                    console.error('Notification error:', err);
                    alert('Notification failed: ' + (err as Error).message);
                  }
                } else if (Notification.permission === 'denied') {
                  alert(isAr ? 'التنبيهات محظورة. يرجى تفعيلها من إعدادات المتصفح' : 'Notifications blocked. Please enable in browser settings');
                } else {
                  Notification.requestPermission().then(permission => {
                    console.log('Permission result:', permission);
                    if (permission === 'granted') {
                      try {
                        new Notification('BridgeHer', {
                          body: isAr ? 'تم تفعيل التنبيهات بنجاح!' : 'Notifications enabled!',
                          icon: '/logo.png'
                        });
                        playUiSound(sound, 'success');
                      } catch (err) {
                        console.error('Notification error:', err);
                        alert('Notification failed: ' + (err as Error).message);
                      }
                    } else {
                      alert(isAr ? 'تم رفض التنبيهات' : 'Notification permission denied');
                    }
                  }).catch(err => {
                    console.error('Permission error:', err);
                    alert('Error: ' + (err as Error).message);
                  });
                }
              }}
              style={{fontSize: '0.85rem', padding: '6px 12px'}}
            >
              🔔 {isAr ? 'تفعيل التنبيهات' : 'Enable Notifications'}
            </button>
          </div>
          {reminders.length === 0 ? (
            <p className="muted">{t.reminders.empty}</p>
          ) : (
            <ul className="reminder-list">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className={`reminder-item ${r.done ? "done" : ""} ${r.isNew ? "new" : ""}`}
                  onAnimationEnd={() =>
                    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, isNew: false } : x)))
                  }
                >
                  <div>
                    <span>{r.reminder_text}</span>
                    {r.reminder_time && <small style={{display: 'block', color: '#888', fontSize: '0.85em', marginTop: '4px'}}>
                      {new Date(r.reminder_time).toLocaleString()}
                    </small>}
                  </div>
                  <div className="reminder-actions">
                    <button className="btn-small" onClick={() => toggleDone(r.id)}>
                      {t.reminders.done}
                    </button>
                    <button className="btn-small danger" onClick={() => remove(r.id)}>
                      {t.reminders.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="add-reminder">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={t.reminders.placeholder}
              onKeyPress={(e) => e.key === 'Enter' && addReminder()}
            />
            <input 
              type="datetime-local" 
              value={reminderTime} 
              onChange={(e) => setReminderTime(e.target.value)}
              style={{marginTop: '8px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%'}}
              placeholder={isAr ? 'اختر الوقت (اختياري)' : 'Select time (optional)'}
            />
            <button className="btn-primary" onClick={addReminder} style={{marginTop: '8px'}}>
              {t.reminders.add}
            </button>
          </div>
        </section>


      </main>
    </div>
  );
};

export default LearnerDashboard;