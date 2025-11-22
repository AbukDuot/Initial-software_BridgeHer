import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
import { toArabicNumerals } from "../utils/numberUtils";
import { showToast } from "../utils/toast";
import "../styles/mentorDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

type Lang = "en" | "ar";
type Theme = "light" | "dark";

interface Request {
  id: string;
  learner: string;
  course: string;
  status?: "pending" | "accepted" | "declined";
}

interface Learner {
  id: string;
  name: string;
  course: string;
  progress: number;
  status: "ongoing" | "scheduled" | "completed";
}

interface SessionItem {
  id: string;
  learner: string;
  topic: string;
  dateISO: string;
}

const tMap = {
  en: {
    title: "Mentor Dashboard",
    welcome: (name: string) => `Welcome back, ${name}!`,
    langToggle: "Arabic",
    themeToggle: "Dark Mode",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    sessions: "Mentorship Sessions",
    satisfaction: "Learner Satisfaction",
    analytics: "Analytics Overview",
    requests: "Mentor Requests",
    upcoming: "Upcoming Sessions",
    completed: "Completed",
    scheduled: "Scheduled",
    pending: "Pending",
    excellent: "Excellent",
    good: "Good",
    needsWork: "Needs Improvement",
    totalLearners: "Total Learners",
    totalSessions: "Total Sessions",
    avgProgress: "Avg Progress",
    avgRating: "Avg Rating",
    accept: "Accept",
    decline: "Decline",
    noItems: "Nothing here yet.",
    reschedule: "Reschedule",
    learner: "Learner",
    topic: "Topic",
    date: "Date",
    time: "Time",
    save: "Save",
    cancel: "Cancel",
  },
  ar: {
    title: "لوحة المرشد",
    welcome: (name: string) => `مرحبًا بعودتك، ${name}!`,
    langToggle: "English",
    themeToggle: "الوضع الفاتح",
    soundOn: "الصوت مفعل",
    soundOff: "الصوت متوقف",
    sessions: "جلسات الإرشاد",
    satisfaction: "رضا المتعلمين",
    analytics: "نظرة عامة تحليلية",
    requests: "طلبات الإرشاد",
    upcoming: "الجلسات القادمة",
    completed: "مكتملة",
    scheduled: "مجدولة",
    pending: "قيد الانتظار",
    excellent: "ممتاز",
    good: "جيد",
    needsWork: "يحتاج لتحسين",
    totalLearners: "إجمالي المتعلمين",
    totalSessions: "إجمالي الجلسات",
    avgProgress: "متوسط التقدم",
    avgRating: "متوسط التقييم",
    accept: "قبول",
    decline: "رفض",
    noItems: "لا يوجد عناصر بعد.",
    reschedule: "إعادة الجدولة",
    learner: "المتعلم",
    topic: "الموضوع",
    date: "التاريخ",
    time: "الوقت",
    save: "حفظ",
    cancel: "إلغاء",
  },
} as const;

const useCountUp = (target: number, duration = 800): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

const playToastSound = (
  theme: Theme,
  type: "accept" | "decline" | "reschedule",
  soundEnabled: boolean
) => {
  if (!soundEnabled) return;
  try {
    const win = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtor: (typeof AudioContext) | undefined = win.AudioContext || win.webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    let freq = 600;
    if (type === "accept") freq = 750;
    if (type === "decline") freq = 500;
    if (type === "reschedule") freq = 650;
    const isDark = theme === "dark";
    osc.frequency.setValueAtTime(isDark ? freq - 100 : freq + 100, ctx.currentTime);
    gain.gain.setValueAtTime(isDark ? 0.05 : 0.1, ctx.currentTime);
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    // Log error to aid debugging; avoids an empty catch block that many linters disallow
    // Keep this lightweight to not break environments without console
    if (typeof console !== "undefined" && console.error) {
      console.error("playToastSound error:", err);
    }
  }
};

import { useLanguage } from "../hooks/useLanguage";

const MentorDashboard: React.FC = () => {
  const { language: contextLang } = useLanguage();
  const lang: Lang = contextLang === "Arabic" ? "ar" : "en";
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("soundEnabled");
    return saved ? JSON.parse(saved) : true;
  });

  const theme = (document.documentElement.dataset.theme as Theme) || "light";
  const t = tMap[lang];



  useEffect(() => {
    localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const [dashboardData, setDashboardData] = useState<any>({ stats: { totalLearners: 0, activeSessions: 0 }, connections: [] });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setMentorUser(JSON.parse(userData));
    }
    
    // Refresh user data on focus (when returning from settings)
    const handleFocus = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setMentorUser(JSON.parse(updatedUser));
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
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bridgeher-backend.onrender.com'}/api/dashboards/mentor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDashboardData(data);
        
        if (data.connections && Array.isArray(data.connections)) {
          const pending = data.connections.filter((c: any) => c.status === 'pending');
          setRequests(pending.map((c: any) => ({
            id: c.id.toString(),
            learner: c.learner_name,
            course: c.topic,
            status: c.status
          })));
          
          const accepted = data.connections.filter((c: any) => c.status === 'accepted');
          setLearners(accepted.map((c: any) => ({
            id: c.id.toString(),
            name: c.learner_name,
            course: c.topic,
            progress: c.progress || 0,
            status: 'ongoing' as const
          })));
          
          const sessions = accepted.slice(0, 3).map((c: any) => ({
            id: c.id.toString(),
            learner: c.learner_name,
            topic: c.topic,
            dateISO: c.scheduled_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString()
          }));
          setSessions(sessions);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
        setDashboardData({ stats: { totalLearners: 0, activeSessions: 0 }, connections: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  const feedback = dashboardData?.feedback || [];

  const [showModal, setShowModal] = useState(false);
  const [modalSession, setModalSession] = useState<SessionItem | null>(null);
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");
  const [mentorUser, setMentorUser] = useState<any>(null);

  const chartColors = useMemo(
    () => ({
      textColor: theme === "dark" ? "#FFFFFF" : "#333333",
      gridColor: theme === "dark" ? "#555555" : "#E0E0E0",
    }),
    [theme]
  );

  const barData: ChartData<"bar"> = {
    labels: [t.completed, t.scheduled, t.pending],
    datasets: [
      {
        label: t.sessions,
        data: [
          learners.filter((l) => l.status === "completed").length,
          learners.filter((l) => l.status === "ongoing").length,
          requests.length,
        ],
        backgroundColor: ["#4A148C", "#FFD700", "#4A148C"],
        borderRadius: 6,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#fff",
        anchor: "end",
        align: "start",
        font: { weight: "bold" },
      },
    },
    scales: {
      x: { grid: { color: chartColors.gridColor }, ticks: { color: chartColors.textColor } },
      y: {
        beginAtZero: true,
        grid: { color: chartColors.gridColor },
        ticks: { color: chartColors.textColor, stepSize: 1 },
      },
    },
  };

  const pieData: ChartData<"pie"> = {
    labels: [t.excellent, t.good, t.needsWork],
    datasets: [
      {
        data: [
          feedback.filter((f: any) => f.rating >= 5).length,
          feedback.filter((f: any) => f.rating === 3 || f.rating === 4).length,
          feedback.filter((f: any) => f.rating <= 2).length,
        ],
        backgroundColor: ["#4A148C", "#FFD700", "#E53935"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: chartColors.textColor } },
      datalabels: {
        color: "#fff",
        formatter: (value: number) => (value > 0 ? value : ""),
      },
    },
  };


  const handleAccept = async (id: string) => {
    playToastSound(theme, "accept", soundEnabled);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bridgeher-backend.onrender.com'}/api/mentorship/requests/${id}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };
  const handleDecline = async (id: string) => {
    playToastSound(theme, "decline", soundEnabled);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bridgeher-backend.onrender.com'}/api/mentorship/requests/${id}/decline`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to decline request", err);
    }
  };
  const openReschedule = (s: SessionItem) => {
    const dt = new Date(s.dateISO);
    const dateValue = dt.toISOString().slice(0, 10);
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    const timeValue = `${hh}:${mm}`;
    
    setModalDate(dateValue);
    setModalTime(timeValue);
    setModalSession(s);
    
    setTimeout(() => {
      setShowModal(true);
    }, 0);
  };
  const saveReschedule = async () => {
    if (!modalSession) return;
    const [h, m] = modalTime.split(":").map(Number);
    const newDate = new Date(modalDate);
    newDate.setHours(h, m, 0, 0);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bridgeher-backend.onrender.com'}/api/mentorship/${modalSession.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scheduled_at: newDate.toISOString() })
      });
      
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === modalSession.id ? { ...s, dateISO: newDate.toISOString() } : s
          )
        );
        playToastSound(theme, "reschedule", soundEnabled);
        setShowModal(false);
      } else {
        showToast("Failed to reschedule", "error");
      }
    } catch (err) {
      console.error("Failed to reschedule", err);
      showToast("Connection error", "error");
    }
  };

  const totalLearners = learners.length || 0;
  const totalSessions = sessions.length || 0;
  const avgProgress = learners.length > 0 ? Math.round(learners.reduce((sum, l) => sum + (l.progress || 0), 0) / learners.length) : 0;
  const avgRating = feedback.length > 0 ? (feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1) : "0";
  
  const countLearners = useCountUp(totalLearners);
  const countSessions = useCountUp(totalSessions);
  const countProgress = useCountUp(Math.round(avgProgress));
  const countRating = useCountUp(Math.round(Number(avgRating) * 10) / 10);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
    <div className={`mentor-dashboard ${theme}`}>
      <header className="dashboard-header">
        <div className="header-left" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          {mentorUser && (
            mentorUser.profile_pic ? (
              <img 
                src={mentorUser.profile_pic} 
                alt="Profile" 
                key={mentorUser.profile_pic}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #FFD700'
                }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#4A148C',
                color: '#FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '3px solid #FFD700'
              }}>
                {mentorUser.name ? mentorUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
              </div>
            )
          )}
          <div>
            <h1 className="app-title">{t.title}</h1>
            <p className="welcome">{t.welcome(mentorUser?.name || "Mentor")}</p>
          </div>
        </div>
        <div className="header-controls">
          <button className="toggle-btn" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? "🔊 " + t.soundOn : "🔇 " + t.soundOff}
          </button>
        </div>
      </header>

      <section className="charts-grid">
        <div className="chart-box">
          <h2>{t.sessions}</h2>
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="chart-box">
          <h2>{t.satisfaction}</h2>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </section>

      <section className="analytics-section">
        <h2>{t.analytics}</h2>
        <div className="analytics-cards">
          <div className="analytic-card"><h3>{t.totalLearners}</h3><p>{lang === "ar" ? toArabicNumerals(countLearners) : countLearners}</p></div>
          <div className="analytic-card"><h3>{t.totalSessions}</h3><p>{lang === "ar" ? toArabicNumerals(countSessions) : countSessions}</p></div>
          <div className="analytic-card"><h3>{t.avgProgress}</h3><p>{lang === "ar" ? toArabicNumerals(countProgress) : countProgress}%</p></div>
          <div className="analytic-card"><h3>{t.avgRating}</h3><p>{lang === "ar" ? toArabicNumerals(countRating) : countRating}</p></div>
        </div>
      </section>

      <section className="requests-section">
        <h2>{t.requests}</h2>
        {requests.length === 0 ? (
          <p className="muted">{t.noItems}</p>
        ) : (
          <ul className="requests-list">
            {requests.map((r) => (
              <li key={r.id} className="request-card">
                <div className="request-main">
                  <strong>{r.learner}</strong> <span className="req-course">{r.course}</span>
                </div>
                <div className="actions">
                  <button className="btn-accept" onClick={() => handleAccept(r.id)}>{t.accept}</button>
                  <button className="btn-decline" onClick={() => handleDecline(r.id)}>{t.decline}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="upcoming-section">
        <h2>{t.upcoming}</h2>
        {sessions.length === 0 ? (
          <p className="muted">{t.noItems}</p>
        ) : (
          <ul className="sessions-list">
            {sessions.map((s) => {
              const dt = new Date(s.dateISO);
              const dateStr = dt.toLocaleDateString(lang === "ar" ? "ar" : "en", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const timeStr = dt.toLocaleTimeString(lang === "ar" ? "ar" : "en", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={s.id} className="session-card">
                  <div className="session-main">
                    <div className="session-row"><strong>{t.learner}:</strong> <span>{s.learner}</span></div>
                    <div className="session-row"><strong>{t.topic}:</strong> <span>{s.topic}</span></div>
                    <div className="session-row"><strong>{t.date}:</strong> <span>{dateStr}</span></div>
                    <div className="session-row"><strong>{t.time}:</strong> <span>{timeStr}</span></div>
                  </div>
                  <div className="actions">
                    <button className="btn-reschedule" onClick={() => openReschedule(s)}>{t.reschedule}</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '30px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              color: '#333',
              border: '3px solid #4A148C'
            }}
          >
            <h3 style={{ color: '#4A148C', marginBottom: '20px', fontSize: '24px' }}>{t.reschedule}</h3>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <label style={{ display: 'block' }}>
                <strong style={{ display: 'block', marginBottom: '5px', color: '#333' }}>{t.date}</strong>
                <input 
                  type="date" 
                  value={modalDate} 
                  onChange={(e) => setModalDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #4A148C', borderRadius: '5px' }}
                />
              </label>
              <label style={{ display: 'block' }}>
                <strong style={{ display: 'block', marginBottom: '5px', color: '#333' }}>{t.time}</strong>
                <input 
                  type="time" 
                  value={modalTime} 
                  onChange={(e) => setModalTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '2px solid #4A148C', borderRadius: '5px' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={saveReschedule}
                style={{ background: '#4A148C', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
              >{t.save}</button>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: '#E53935', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
              >{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};



export default MentorDashboard;
