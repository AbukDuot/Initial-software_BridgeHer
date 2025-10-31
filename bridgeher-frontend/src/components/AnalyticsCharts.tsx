import React from "react";
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
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "../styles/analyticsCharts.css";

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

interface AnalyticsChartsProps {
  isAr?: boolean;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ isAr }) => {
  const weeklyLearningData = {
    labels: isAr
      ? ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: isAr ? "ساعات التعلم" : "Learning Hours",
        data: [2, 3, 1.5, 2, 4, 2.5, 3],
        backgroundColor: "#4A148C",
        borderRadius: 6,
      },
    ],
  };

  const completionData = {
    labels: [isAr ? "مكتمل" : "Completed", isAr ? "متبقي" : "Remaining"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#4A148C", "#E0E0E0"],
        cutout: "75%",
      },
    ],
  };

  const mentorshipTrendData = {
    labels: isAr ? ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4"] : ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: isAr ? "جلسات الإرشاد" : "Mentorship Sessions",
        data: [1, 2, 3, 4],
        fill: false,
        borderColor: "#4A148C",
        tension: 0.3,
      },
    ],
  };

  return (
    <section className="analytics-section">
      <h2>{isAr ? "تحليلات التعلم" : "Learning Analytics"}</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h4>{isAr ? "ساعات الأسبوع" : "Weekly Learning Hours"}</h4>
          <Bar data={weeklyLearningData} />
        </div>
        <div className="chart-card">
          <h4>{isAr ? "تقدم الدورات" : "Course Completion"}</h4>
          <Doughnut data={completionData} />
        </div>
        <div className="chart-card">
          <h4>{isAr ? "جلسات الإرشاد" : "Mentorship Sessions"}</h4>
          <Line data={mentorshipTrendData} />
        </div>
      </div>
    </section>
  );
};

export default AnalyticsCharts;
