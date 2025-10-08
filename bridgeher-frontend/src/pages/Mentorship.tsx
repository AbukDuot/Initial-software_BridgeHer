import React, { useState } from "react";
import "../styles/mentorship.css";

interface Mentor {
  id: number;
  name: string;
  expertise: string;
  available: boolean;
}

const Mentorship: React.FC = () => {
  const [mentors] = useState<Mentor[]>([
    { id: 1, name: "Joseph Deng", expertise: "Digital Skills", available: true },
    { id: 2, name: "Mary Aluel", expertise: "Financial Literacy", available: true },
    { id: 3, name: "Achol Williams", expertise: "Leadership", available: false },
  ]);

  const [requests, setRequests] = useState<string[]>([]);

  const sendRequest = (mentor: Mentor) => {
    setRequests((prev) => [...prev, mentor.name]);
    alert(`Mentorship request sent to ${mentor.name}`);
  };

  return (
    <div className="mentorship-page">
      <h2>Mentorship Program</h2>
      <p>Find mentors who match your goals and start your journey.</p>

      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div className="mentor-card" key={mentor.id}>
            <h3>{mentor.name}</h3>
            <p>Expertise: {mentor.expertise}</p>
            <p>Status: {mentor.available ? "Available" : "❌ Unavailable"}</p>
            {mentor.available && (
              <button onClick={() => sendRequest(mentor)}>Request Mentorship</button>
            )}
          </div>
        ))}
      </div>

      <h3>My Requests</h3>
      <ul>
        {requests.map((req, i) => (
          <li key={i}>📩 Request to {req}</li>
        ))}
      </ul>
    </div>
  );
};

export default Mentorship;
