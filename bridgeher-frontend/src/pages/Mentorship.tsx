import React, { useMemo, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
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
    light: "فاتح",
    dark: "داكن",
  },
};

type Lang = "en" | "ar";

interface VideoCardProps {
  mentor: {
    id: number;
    name: string;
    role: string;
    videoIntro: string;
  };
}

const VideoCard: React.FC<VideoCardProps> = ({ mentor }) => {
  const [videoError, setVideoError] = useState(false);
  
  console.log('Rendering video for:', mentor.name, 'URL:', mentor.videoIntro);
  
  return (
    <div className="video-card">
      {!videoError ? (
        <iframe
          src={mentor.videoIntro}
          title={`${mentor.name} - Motivational Video`}
          width="100%"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={(e) => {
            console.error('Video iframe error for', mentor.name, ':', e);
            console.error('Failed URL:', mentor.videoIntro);
            setVideoError(true);
          }}
          onLoad={() => console.log('Video loaded successfully for:', mentor.name)}
        ></iframe>
      ) : (
        <div style={{
          height: '200px',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>Video failed to load</p>
          <small style={{ color: '#999', wordBreak: 'break-all' }}>{mentor.videoIntro}</small>
          <button 
            onClick={() => setVideoError(false)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#4A148C',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      <h4>{mentor.name}</h4>
      <p>{mentor.role}</p>
    </div>
  );
};

const Mentorship: React.FC = () => {
  const { language } = useLanguage();
  const lang: Lang = language === "Arabic" ? "ar" : "en";
  const t = translations[lang];
  interface Mentor {
    id: number;
    name: string;
    role: string;
    expertise: string[];
    location: string;
    badges: string[];
    avatar: string;
    rating: number;
    available: boolean;
    calendar: string[];
    videoIntro: string;
  }
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/mentors`);
        if (!res.ok) {
          console.error('Mentors API error:', res.status);
          setMentors([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.error) {
          console.error('Mentors API error:', data.error);
          setMentors([]);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const avatarMap: Record<string, string> = {
            "Priscilla Ayuen": priscillaImg,
            "Aguil Ajang": aguilImg,
            "Aguil": aguilImg,
            "Kuir juach": kuirImg,
            "Kuir Juach": kuirImg,
            "Abraham Madol": abrahamImg,
            "Abuk Debby": priscillaImg
          };
          const mapped = data.map((m: { id: number; name: string; video_intro?: string; expertise?: string; expertise_ar?: string; location?: string; badges?: string; avatar_url?: string; profile_pic?: string; rating?: number }) => {
            let videoUrl = "";
            if (m.video_intro && m.video_intro.trim()) {
              const rawUrl = m.video_intro.trim();
              console.log('🎥 Processing video URL for', m.name, ':', rawUrl);
              
              if (rawUrl.includes("youtu.be/")) {
                const videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0]?.split("/")[0];
                videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
              } else if (rawUrl.includes("youtube.com/watch?v=")) {
                const videoId = rawUrl.split("v=")[1]?.split("&")[0];
                videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
              } else if (rawUrl.includes("youtube.com/embed/")) {
                videoUrl = rawUrl.includes('?') ? `${rawUrl}&modestbranding=1` : `${rawUrl}?rel=0&modestbranding=1`;
              } else if (rawUrl.includes("youtube.com/shorts/")) {
                const videoId = rawUrl.split("shorts/")[1]?.split("?")[0];
                videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
              }
              
              console.log('🎥 Generated embed URL for', m.name, ':', videoUrl);
              
              // Additional validation
              if (!videoUrl) {
                console.warn('⚠️ No valid video URL generated for', m.name, 'from:', rawUrl);
              }
            }
            const expertiseMap: Record<string, string> = {
              'ENTREPRENEURSHIP_AR': 'ريادة الأعمال',
              'DIGITAL_SKILLS_AR': 'المهارات الرقمية',
              'FINANCE_AR': 'التمويل',
              'BUSINESS_PLANNING_AR': 'تخطيط الأعمال',
              'TECH_CAREER_AR': 'مسيرة مهنية في التكنولوجيا',
              'CV_WRITING_AR': 'كتابة السيرة الذاتية',
              'INTERVIEW_PREP_AR': 'التحضير للمقابلات'
            };
            
            let expertiseText = m.expertise;
            let expertiseArray = [];
            
            if (lang === "ar" && m.expertise_ar) {
              expertiseArray = m.expertise_ar.split(",").map((e: string) => {
                const code = e.trim();
                return expertiseMap[code] || code;
              });
              expertiseText = expertiseArray.join("، ");
            } else {
              expertiseArray = m.expertise ? m.expertise.split(",").map((e: string) => e.trim()) : ["General"];
              expertiseText = m.expertise || "Mentor";
            }
            
            const mapped = {
              id: m.id,
              name: m.name,
              role: expertiseText,
              expertise: expertiseArray,
              location: m.location || "Juba, South Sudan",
              badges: (m.badges && typeof m.badges === 'string') ? m.badges.split(",").map((b: string) => b.trim()) : (Array.isArray(m.badges) ? m.badges : ["Mentor"]),
              avatar: m.profile_pic || m.avatar_url || avatarMap[m.name] || priscillaImg,
              rating: m.rating || 4.8,
              available: true,
              calendar: [],
              videoIntro: videoUrl && videoUrl.trim() !== '' ? videoUrl : ''
            };
            
            console.log('Final mentor object for', m.name, ':', {
              id: mapped.id,
              name: mapped.name,
              videoIntro: mapped.videoIntro
            });
            
            return mapped;
          });
          setMentors(mapped);
        } else {
          setMentors([]);
        }
      } catch (err) {
        console.error("Failed to fetch mentors:", err);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, [lang]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [modalMentor, setModalMentor] = useState<typeof mentors[0] | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<
    { id: number; mentor: string; mentor_id: number; date: string; session: string; status: string }[]
  >([]);
  const [feedbackModal, setFeedbackModal] = useState<{ id: number; mentor: string; mentor_id: number; date: string; session: string; status: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/mentorship`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((r: { id: number; mentor_name?: string; mentor_id: number; created_at: string; scheduled_at?: string; status: string }) => ({
            id: r.id,
            mentor: r.mentor_name || 'Mentor',
            mentor_id: r.mentor_id,
            date: new Date(r.created_at).toLocaleString(),
            session: r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '-',
            status: r.status
          }));
          setRequests(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };
    fetchRequests();
  }, []);

  const allExpertise = useMemo(
    () => Array.from(new Set(mentors.flatMap((m) => m.expertise))),
    [mentors]
  );

  const filtered = mentors.filter((m) => {
    const byName =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    const byTag = filter ? m.expertise.includes(filter) : true;
    return byName && byTag;
  });

  const openFeedbackModal = (req: { id: number; mentor: string; mentor_id: number; date: string; session: string; status: string }) => {
    setFeedbackModal(req);
    setRating(5);
    setComment("");
  };

  const submitFeedback = async () => {
    if (!feedbackModal) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/mentorship/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentor_id: feedbackModal.mentor_id,
          rating,
          comment
        })
      });
      if (res.ok) {
        alert(lang === "ar" ? "شكراً لتقييمك!" : "Thank you for your feedback!");
        setFeedbackModal(null);
      } else {
        alert(lang === "ar" ? "فشل الإرسال" : "Failed to submit");
      }
    } catch {
      alert(lang === "ar" ? "خطأ في الاتصال" : "Connection error");
    }
  };

  const confirmRequest = async () => {
    if (!modalMentor) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert(lang === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      return;
    }
    
    console.log('🔍 Before request - User in localStorage:', JSON.parse(localStorage.getItem("user") || '{}'));
    
    const requestData = {
      mentor_id: modalMentor.id,
      topic: modalMentor.role,
      message: message || "Mentorship request"
    };
    
    if (!navigator.onLine) {
      const { queueOfflineAction } = await import("../utils/offline");
      queueOfflineAction({
        type: 'MENTORSHIP_REQUEST',
        data: { ...requestData, mentorName: modalMentor.name },
        timestamp: new Date().toISOString()
      });
      alert(lang === "ar" ? " تم حفظ الطلب. سيتم إرساله عند الاتصال بالإنترنت." : " Request queued. Will send when online.");
      setModalMentor(null);
      return;
    }
    
    try {
      console.log('📤 Sending mentorship request:', requestData);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch(`${API_BASE_URL}/api/mentorship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('📥 Response status:', res.status);
      
      if (res.ok) {
        const newRequest = await res.json();
        console.log('✅ Request created:', newRequest);
        
        const session = sessionDate && sessionTime ? `${sessionDate} ${sessionTime}` : "-";
        setRequests((prev) => [
          ...prev,
          { id: newRequest.id, mentor: modalMentor.name, mentor_id: modalMentor.id, date: new Date().toLocaleString(), session, status: 'pending' },
        ]);
        alert(lang === "ar" ? "تم إرسال الطلب بنجاح!" : "Request sent successfully!");
        setModalMentor(null);
        setMessage("");
        setSessionDate("");
        setSessionTime("");
      } else {
        const error = await res.json();
        console.error('❌ Request failed:', error);
        alert(lang === "ar" ? `فشل الإرسال: ${error.error || 'خطأ'}` : `Failed to send: ${error.error || 'Error'}`);
      }
    } catch (err) {
      console.error("❌ Request error:", err);
      alert(lang === "ar" ? "خطأ في الاتصال" : "Connection error");
    }
  };

  if (loading) return <div className="loading">Loading mentors...</div>;

  return (
    <div className={`mentorship-page ${lang === "ar" ? "rtl" : ""}`}>
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
                {m.badges.map((b: string, idx: number) => (
                  <span key={idx} className="badge">{b}</span>
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
        {mentors.filter(m => m.videoIntro && m.videoIntro.trim() !== '').length === 0 ? (
          <div style={{textAlign: 'center', color: '#888'}}>
            <p>No videos available yet.</p>
          </div>
        ) : (
          <div className="videos-grid">
            {mentors.filter(m => m.videoIntro && m.videoIntro.trim() !== '').map((m) => (
              <VideoCard key={m.id} mentor={m} />
            ))}
          </div>
        )}
        
        {/* Test video section - for debugging */}
        {mentors.filter(m => m.videoIntro && m.videoIntro.trim() !== '').length === 0 && mentors.length > 0 && (
          <div style={{marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7'}}>
            <h4 style={{color: '#856404', marginBottom: '10px'}}>No Mentor Videos Found</h4>
            <p style={{color: '#856404', fontSize: '14px', marginBottom: '15px'}}>Click the button below to add sample videos to mentors:</p>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${API_BASE_URL}/api/admin/add-mentor-videos`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (res.ok) {
                    const result = await res.json();
                    alert(`✅ ${result.message}`);
                    // Refresh the page to load new videos
                    window.location.reload();
                  } else {
                    const error = await res.json();
                    alert(`❌ Error: ${error.error}`);
                  }
                } catch (err) {
                  console.error('Error adding videos:', err);
                  alert('❌ Failed to add videos');
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#4A148C',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              🎥 Add Sample Videos to Mentors
            </button>
            
            <div className="video-card" style={{maxWidth: '400px'}}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                title="Test Video"
                width="100%"
                height="200"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
              <h4>Test Video (Verify Player Works)</h4>
              <p>This test video confirms the video player is functional</p>
            </div>
          </div>
        )}
        

      </section>

      <section className="requests-section">
        <h3>{t.myRequests}</h3>
        {requests.length === 0 ? (
          <p className="empty">{t.none}</p>
        ) : (
          <ul>
            {requests.map((r) => (
              <li key={r.id} style={{marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '5px'}}>
                <strong>{r.mentor}</strong> — {r.session}<br/>
                <small>Requested: {r.date}</small><br/>
                <span style={{color: r.status === 'accepted' ? 'green' : r.status === 'declined' ? 'red' : 'orange'}}>
                  Status: {r.status}
                </span>
                {(r.status === 'accepted' || r.status === 'pending') && (
                  <button onClick={() => openFeedbackModal(r)} style={{marginLeft: '10px', padding: '5px 10px', background: '#4A148C', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>Rate Mentor</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
            <h3>Rate {feedbackModal.mentor}</h3>
            <label style={{display: 'block', marginBottom: '10px'}}>
              Rating (1-5):
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{marginLeft: '10px', padding: '5px'}}>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </label>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{width: '100%', minHeight: '80px', marginBottom: '10px', padding: '8px'}}
            />
            <div className="modal-actions">
              <button onClick={submitFeedback}>Submit</button>
              <button onClick={() => setFeedbackModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
