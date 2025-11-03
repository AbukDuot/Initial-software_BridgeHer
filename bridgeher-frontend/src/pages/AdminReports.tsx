import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { API_BASE_URL } from "../config/api";
import "../styles/adminReports.css";

interface Report {
  id: number;
  content_type: string;
  content_id: number;
  reason: string;
  reporter_name: string;
  content_preview: string;
  status: string;
  created_at: string;
}

const AdminReports: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "Arabic";

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/community/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const viewContent = (report: Report) => {
    if (report.content_type === "topic") {
      navigate(`/community/topic/${report.content_id}`);
    }
  };

  if (loading) return <div className="loading">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className={`admin-reports ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="reports-container">
        <header className="reports-header">
          <h1>{isArabic ? "البلاغات المرسلة" : "Content Reports"}</h1>
          <button onClick={() => navigate("/admin-dashboard")} className="back-btn">
            ← {isArabic ? "العودة" : "Back"}
          </button>
        </header>

        {reports.length === 0 ? (
          <div className="empty-state">
            <p>{isArabic ? "لا توجد بلاغات" : "No reports"}</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <span className="report-type">
                    {report.content_type === "topic" ? "📝" : "💬"} {report.content_type}
                  </span>
                  <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="report-body">
                  <p><strong>{isArabic ? "المبلغ:" : "Reporter:"}</strong> {report.reporter_name}</p>
                  <p><strong>{isArabic ? "السبب:" : "Reason:"}</strong> {report.reason}</p>
                  <p><strong>{isArabic ? "المحتوى:" : "Content:"}</strong> {report.content_preview?.substring(0, 100)}...</p>
                </div>
                <div className="report-actions">
                  <button onClick={() => viewContent(report)} className="btn-view">
                    {isArabic ? "عرض المحتوى" : "View Content"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
