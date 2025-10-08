import React, { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
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
} from "chart.js";

import "../styles/mentorDashboard.css";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Request {
  id: number;
  learner: string;
  course: string;
}

interface Learner {
  name: string;
  status: string;
}

interface Feedback {
  id: number;
  learner: string;
  rating: number;
  comment: string;
  reply?: string;
}

const MentorDashboard: React.FC = () => {
  const [requests] = useState<Request[]>([
    { id: 1, learner: "Mary A.", course: "Financial Literacy" },
    { id: 2, learner: "Joyce K.", course: "Entrepreneurship" },
  ]);

  const [learners] = useState<Learner[]>([
    { name: "Grace", status: "Ongoing Mentorship" },
    { name: "Nya", status: "Session Scheduled" },
    { name: "Aluel", status: "Completed Session" },
  ]);

  const [feedback, setFeedback] = useState<Feedback[]>([
    {
      id: 1,
      learner: "Mary A.",
      rating: 4,
      comment: "The mentorship session was very helpful. I feel more confident with budgeting now!",
    },
    {
      id: 2,
      learner: "Joyce K.",
      rating: 5,
      comment: "Amazing experience! The mentor explained entrepreneurship concepts so clearly.",
    },
    {
      id: 3,
      learner: "Grace",
      rating: 3,
      comment: "The session was good, but I’d love more examples for digital skills.",
    },
  ]);

  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  // Chart Data
  const sessionsData: ChartData<"bar"> = {
    labels: ["Completed", "Upcoming"],
    datasets: [
      {
        label: "Mentorship Sessions",
        data: [8, 3],
        backgroundColor: ["#6a1b9a", "#ff9800"],
      },
    ],
  };

  const satisfactionData: ChartData<"doughnut"> = {
    labels: ["Excellent", "Good", "Needs Work"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#4caf50", "#2196f3", "#f44336"],
      },
    ],
  };

  // andle Reply Submission
  const handleReply = (id: number) => {
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, reply: replyText[id] || "" } : f
      )
    );
    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="mentor-dashboard">
      <h2> Mentor Dashboard</h2>

      {/* Mentorship Requests */}
      <section className="requests">
        <h3>Mentorship Requests</h3>
        <ul>
          {requests.map((req) => (
            <li key={req.id} className="request-card">
              <strong>{req.learner}</strong> ({req.course})
              <div className="actions">
                <button className="accept">Accept</button>
                <button className="decline">Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* My Learners */}
      <section className="my-learners">
        <h3>My Learners</h3>
        {learners.map((learner, idx) => (
          <div key={idx} className="learner-card">
            <h4>{learner.name}</h4>
            <p>{learner.status}</p>
            <button className="message">Message</button>
          </div>
        ))}
      </section>

      {/* Schedule */}
      <section className="schedule">
        <h3>Upcoming Sessions</h3>
        <div className="session-card">
          <p>
            <strong>Wed, 3 PM</strong> with <strong>Mary</strong>
          </p>
          <button className="reschedule">Reschedule</button>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-grid">
        <div className="chart-box">
          <h3>Mentorship Sessions</h3>
          <Bar data={sessionsData} />
        </div>
        <div className="chart-box">
          <h3>Learner Satisfaction</h3>
          <Doughnut data={satisfactionData} />
        </div>
      </section>

      {/* Ratings & Comments */}
      <section className="feedback">
        <h3>Learner Feedback</h3>
        <div className="feedback-list">
          {feedback.map((f) => (
            <div key={f.id} className="feedback-card">
              <p>
                <strong>{f.learner}</strong>{" "}
                {"⭐".repeat(f.rating)}{" "}
                {"☆".repeat(5 - f.rating)}
              </p>
              <p>"{f.comment}"</p>

              {f.reply && (
                <div className="mentor-reply">
                  <p><strong>Reply:</strong> {f.reply}</p>
                </div>
              )}

              <div className="reply-box">
                <textarea
                  placeholder="Write a reply..."
                  value={replyText[f.id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [f.id]: e.target.value })
                  }
                />
                <button onClick={() => handleReply(f.id)}>Reply</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MentorDashboard;
