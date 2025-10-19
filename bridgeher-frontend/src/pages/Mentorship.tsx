import React, { useMemo, useState } from "react";
import "../styles/mentorship.css";

import priscillaImg from "../assets/images/priscilla.jpg";
import aguilImg from "../assets/images/aguil.jpg";
import kuirImg from "../assets/images/kuir.jpg";
import abrahamImg from "../assets/images/abraham.jpg";

const translations = {
  en: {
    title: "Mentorship Program",
    desc: "Meet inspiring mentors, watch their stories, and book personalized sessions to grow your skills.",
    search: "Search mentors...",
    allExpertise: "All Expertise",
    available: "Available",
    request: "Request Mentorship",
    view: "View Profile",
    location: "Location",
    badges: "Badges",
    testimonials: "Testimonials",
    calendar: "Available Slots",
    bookWith: "Request Mentorship with",
    messagePH: "Write a short message or your goals…",
    date: "Date",
    time: "Time",
    send: "Confirm Request",
    cancel: "Cancel",
    myRequests: "My Requests",
    none: "No requests yet.",
    videos: "Motivational Videos",
    english: "English",
    arabic: "Arabic",
    light: "Light",
    dark: "Dark",
  },
  ar: {
    title: "برنامج الإرشاد",
    desc: "قابل المرشدين الملهمين، شاهد قصصهم، واحجز جلسات مخصصة لتطوير مهاراتك.",
    search: "ابحث عن المرشدين...",
    allExpertise: "كل التخصصات",
    available: "متاح",
    request: "طلب إرشاد",
    view: "عرض الملف الشخصي",
    location: "الموقع",
    badges: "الشارات",
    testimonials: "آراء المستفيدين",
    calendar: "المواعيد المتاحة",
    bookWith: "طلب إرشاد مع",
    messagePH: "اكتب رسالة قصيرة أو أهدافك…",
    date: "التاريخ",
    time: "الوقت",
    send: "تأكيد الطلب",
    cancel: "إلغاء",
    myRequests: "طلباتي",
    none: "لا توجد طلبات بعد.",
    videos: "مقاطع تحفيزية",
    english: "الإنجليزية",
    arabic: "العربية",
    light: "فاتح",
    dark: "داكن",
  },
};

type Lang = "en" | "ar";
type Theme = "light" | "dark";

type Mentor = {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  available: boolean;
  avatar: string;
  rating: number;
  location: string;
  badges: string[];
  testimonials: { name: string; text: string }[];
  calendar: string[];
  videoIntro: string;
};

const mentors: Mentor[] = [
  {
    id: 1,
    name: "Priscilla Ayuen",
    role: "Startup & Digital Skills",
    expertise: ["Entrepreneurship", "Digital Skills"],
    available: true,
    avatar: priscillaImg,
    rating: 4.8,
    location: "Juba, South Sudan",
    badges: ["Top Mentor", "Startup Expert"],
    testimonials: [
      { name: "Alek", text: "Priscilla helped me launch my business!" },
      { name: "Monica", text: "Great practical advice and motivation!" },
    ],
    calendar: ["2025-10-15 10:00", "2025-10-16 14:00"],
    videoIntro: "https://youtu.be/gFYBqZnFQ6w?si=SCmteBBvj-Eg542M",
  },
  {
    id: 2,
    name: "Aguil Ajang",
    role: "Financial Literacy & Business",
    expertise: ["Finance", "Business Planning"],
    available: true,
    avatar: aguilImg,
    rating: 4.7,
    location: "Bor, South Sudan",
    badges: ["Finance Guru"],
    testimonials: [
      { name: "Abuk", text: "Aguil taught me how to manage my savings better!" },
    ],
    calendar: ["2025-10-17 09:00", "2025-10-18 11:00"],
    videoIntro: "https://youtu.be/xAGyhkWoDX8?si=PVOO9c5M9ikrf87G",
  },
  {
    id: 3,
    name: "Kuir Juach",
    role: "Tech Mentor & Developer",
    expertise: ["Career in Tech"],
    available: true,
    avatar: kuirImg,
    rating: 4.9,
    location: "Juba, South Sudan",
    badges: ["Tech Star"],
    testimonials: [
      { name: "Nya", text: "Kuir made computing fun and approachable!" },
    ],
    calendar: ["2025-10-19 13:00", "2025-10-20 15:30"],
    videoIntro: "https://youtu.be/V3SeLgPPoec?si=XUu5Kq4lmEuG9nas",
  },
  {
    id: 4,
    name: "Abraham Madol",
    role: "Career Coach & Public Speaker",
    expertise: ["CV Writing", "Interview Prep"],
    available: true,
    avatar: abrahamImg,
    rating: 4.6,
    location: "Juba, South Sudan",
    badges: ["Career Coach"],
    testimonials: [
      { name: "Ajok", text: "Abraham’s career tips gave me confidence!" },
    ],
    calendar: ["2025-10-21 10:30", "2025-10-22 16:00"],
    videoIntro: "https://youtu.be/xKZ8hMQZcXQ?si=GMvIcn8uOLslyTaU",
  },
];

const Mentorship: React.FC = () => {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const t = translations[lang];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [modalMentor, setModalMentor] = useState<Mentor | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<
    { mentor: string; date: string; session: string }[]
  >([]);

  const allExpertise = useMemo(
    () => Array.from(new Set(mentors.flatMap((m) => m.expertise))),
    []
  );

  const filtered = mentors.filter((m) => {
    const byName =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    const byTag = filter ? m.expertise.includes(filter) : true;
    return byName && byTag;
  });

  const confirmRequest = () => {
    if (!modalMentor) return;
    const session =
      sessionDate && sessionTime ? `${sessionDate} ${sessionTime}` : "-";
    setRequests((prev) => [
      ...prev,
      { mentor: modalMentor.name, date: new Date().toLocaleString(), session },
    ]);
    setModalMentor(null);
  };

  return (
    <div className={`mentorship-page ${lang === "ar" ? "rtl" : ""} ${theme}`}>
      <header className="mentorship-header">
        <h1>{t.title}</h1>
        <p>{t.desc}</p>
        <div className="controls">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">{t.allExpertise}</option>
            {allExpertise.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")}>
            {lang === "en" ? t.arabic : t.english}
          </button>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? t.dark : t.light}
          </button>
        </div>
      </header>

      <section className="mentors-section">
        <div className="mentors-scroll">
          {filtered.map((m) => (
            <div className="mentor-card" key={m.id}>
              <img src={m.avatar} alt={m.name} className="mentor-avatar" />
              <h3>{m.name}</h3>
              <p className="mentor-role">{m.role}</p>
              <p className="mentor-location">{t.location}: {m.location}</p>
              <div className="mentor-badges">
                {m.badges.map((b) => (
                  <span key={b} className="badge">{b}</span>
                ))}
              </div>
              <div className="mentor-actions">
                <button onClick={() => setModalMentor(m)}>{t.request}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="videos-section">
        <h2>{t.videos}</h2>
        <div className="videos-grid">
          {mentors.map((m) => (
            <div key={m.id} className="video-card">
              <iframe
                src={m.videoIntro}
                title={m.name}
                frameBorder={0}
                allowFullScreen
              ></iframe>
              <h4>{m.name}</h4>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="requests-section">
        <h3>{t.myRequests}</h3>
        {requests.length === 0 ? (
          <p className="empty">{t.none}</p>
        ) : (
          <ul>
            {requests.map((r, i) => (
              <li key={i}>
                {r.mentor} — {r.session} ({r.date})
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalMentor && (
        <div className="modal-overlay" onClick={() => setModalMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalMentor.avatar} alt={modalMentor.name} />
            <h3>{t.bookWith} {modalMentor.name}</h3>
            <p>{modalMentor.role}</p>
            <textarea
              placeholder={t.messagePH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="modal-inputs">
              <label>
                {t.date}
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </label>
              <label>
                {t.time}
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={confirmRequest}>{t.send}</button>
              <button onClick={() => setModalMentor(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
