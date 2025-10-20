import React from "react";
import "../styles/about.css";

const teamMembers = [
  {
    img: "/images/abuk.jpg",
    alt: "Abuk Mayen Duot",
    name: "Abuk Mayen Duot",
    role: "Founder & Project Lead",
    bio: "Abuk leads the vision and strategy of BridgeHer, ensuring every aspect of the project empowers young women to thrive.",
  },
  {
    img: "/images/Priscilla.jpg",
    alt: "Priscilla Ayuen",
    name: "Adhel Priscilla Ayuen",
    role: "Advisor",
    bio: "Priscilla provides strategic guidance, drawing on her experience in women’s empowerment and community development.",
  },
  {
    img: "/images/Aguil.jpg",
    alt: "Aguil Ajang Dau",
    name: "Aguil Ajang Dau",
    role: "Mentorship Coordinator",
    bio: "Aguil designs and manages the mentorship program, connecting learners with experienced role models and mentors.",
  },
  {
    img: "/images/Monica.jpg",
    alt: "AkoI Dau Ahol",
    name: "AkoI Dau Ahol",
    role: "Technical Lead",
    bio: "Akoi leads the technical team, ensuring the platform is secure, scalable, and functional even in offline settings.",
  },
  {
    img: "/images/Ajok.jpg",
    alt: "Ajok Atem Beek",
    name: "Ajok Atem Beek",
    role: "UI/UX Designer",
    bio: "Ajok designs user-friendly interfaces that make the platform accessible to users with different levels of digital literacy.",
  },
  {
    img: "/images/Alek.jpg",
    alt: "Alek Paul Mayen",
    name: "Alek Paul Mayen",
    role: "Community Engagement Officer",
    bio: "Alek builds relationships with communities and ensures that feedback from users is at the heart of BridgeHer’s growth.",
  },
  {
    img: "/images/Dorcus.jpg",
    alt: "Adich Dorcus Alier",
    name: "Adich Dorcus Alier",
    role: "Content Development Lead",
    bio: "Dorcus curates and develops learning content in English and Arabic, making it practical and culturally relevant.",
  },
  {
    img: "/images/Achol.jpg",
    alt: "Achol Williams Ater",
    name: "Achol Williams Ater",
    role: "Training & Evaluation Specialist",
    bio: "Achol evaluates training outcomes, monitors progress, and ensures that BridgeHer achieves real impact for learners.",
  },
];

const About: React.FC = () => {
  return (
    <section className="about">
      <div className="container">
        {/* Introduction */}
        <h2>About Us</h2>
        <p>
          BridgeHer is an inclusive digital learning and mentorship platform dedicated to
          empowering young women in South Sudan and beyond. Our mission is to break down
          barriers to education by offering offline-first, multilingual, and accessible
          tools for learning.
        </p>
        <p>
          We believe that when women gain access to knowledge and mentorship, they not only
          improve their own lives but also uplift their families and communities. BridgeHer
          provides practical courses in financial literacy, entrepreneurship, digital skills,
          and leadership, all designed to match the realities of low-connectivity environments.
        </p>
        <p>
          By combining innovative technology with a strong support system of mentors,
          educators, and partners, we are building a community where every learner has the
          opportunity to thrive, gain confidence, and become a leader of change.
        </p>

        {/* Mission */}
        <div className="mission">
          <h3>Our Mission</h3>
          <p>
            To empower women by providing offline-first, inclusive, and engaging
            learning opportunities that combine financial literacy, entrepreneurship,
            digital skills, and mentorship.
          </p>
        </div>

        {/* Core Values */}
        <div className="core-values">
          <h3>Our Core Values</h3>
          <ul>
            <li><strong>Inclusivity:</strong> We welcome every learner and remove barriers to access.</li>
            <li><strong>Integrity:</strong> We are transparent, honest, and accountable.</li>
            <li><strong>Collaboration:</strong> Learners, mentors, and partners grow together.</li>
            <li><strong>Innovation:</strong> We design offline-first, practical tech for real contexts.</li>
            <li><strong>Empowerment:</strong> Skills that build confidence, income, and leadership.</li>
          </ul>
        </div>

        {/* Meet Our Team */}
        <div className="team">
          <h3>Meet Our Team</h3>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="member" key={member.name}>
                <img src={member.img} alt={member.alt} />
                <h4>{member.name}</h4>
                <p>{member.role}</p>
                <p className="bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;