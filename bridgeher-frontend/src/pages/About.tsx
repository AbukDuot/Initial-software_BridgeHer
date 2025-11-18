import React from "react";
import { useLanguage } from "../hooks/useLanguage";
import aboutTranslations from "../i18n/aboutTranslations";
import "../styles/about.css";

const teamMembers = [
  { img: "/images/abuk.jpg", alt: "Abuk Mayen Duot", name: "Abuk Mayen Duot", roleKey: "founder", bioKey: "abuk" },
  { img: "/images/Priscilla.jpg", alt: "Priscilla Ayuen", name: "Adhel Priscilla Ayuen", roleKey: "advisor", bioKey: "priscilla" },
  { img: "/images/Aguil.jpg", alt: "Aguil Ajang Dau", name: "Aguil Ajang Dau", roleKey: "mentorshipCoordinator", bioKey: "aguil" },
  { img: "/images/Monica.jpg", alt: "AkoI Dau Ahol", name: "AkoI Dau Ahol", roleKey: "technicalLead", bioKey: "akoi" },
  { img: "/images/Ajok.jpg", alt: "Ajok Atem Beek", name: "Ajok Atem Beek", roleKey: "uiuxDesigner", bioKey: "ajok" },
  { img: "/images/Alek.jpg", alt: "Alek Paul Mayen", name: "Alek Paul Mayen", roleKey: "communityEngagement", bioKey: "alek" },
  { img: "/images/Dorcus.jpg", alt: "Adich Dorcus Alier", name: "Adich Dorcus Alier", roleKey: "contentLead", bioKey: "dorcus" },
  { img: "/images/Achol.jpg", alt: "Achol Williams Ater", name: "Achol Williams Ater", roleKey: "trainingSpecialist", bioKey: "achol" },
];

const About: React.FC = () => {
  const { language } = useLanguage();
  const t = aboutTranslations[language];
  const isArabic = language === "Arabic";

  return (
    <section className={`about ${isArabic ? "rtl" : ""}`}>
      <div className="container">
        <h2>{t.title}</h2>
        <p>{t.intro1}</p>
        <p>{t.intro2}</p>
        <p>{t.intro3}</p>

        <div className="mission">
          <h3>{t.missionTitle}</h3>
          <p>{t.missionText}</p>
        </div>

        <div className="core-values">
          <h3>{t.valuesTitle}</h3>
          <div className="values-grid">
            <div className="value-card">
              <h4>{t.inclusivity}</h4>
              <p>{t.inclusivityDesc}</p>
            </div>
            <div className="value-card">
              <h4>{t.integrity}</h4>
              <p>{t.integrityDesc}</p>
            </div>
            <div className="value-card">
              <h4>{t.collaboration}</h4>
              <p>{t.collaborationDesc}</p>
            </div>
            <div className="value-card">
              <h4>{t.innovation}</h4>
              <p>{t.innovationDesc}</p>
            </div>
            <div className="value-card">
              <h4>{t.empowerment}</h4>
              <p>{t.empowermentDesc}</p>
            </div>
          </div>
        </div>

        <div className="goals">
          <h3>{t.goalsTitle}</h3>
          <div className="goals-grid">
            <div className="goal-card">
              <h4>{t.goals.accessibility}</h4>
              <p>{t.goals.accessibilityDesc}</p>
            </div>
            <div className="goal-card">
              <h4>{t.goals.skills}</h4>
              <p>{t.goals.skillsDesc}</p>
            </div>
            <div className="goal-card">
              <h4>{t.goals.mentorship}</h4>
              <p>{t.goals.mentorshipDesc}</p>
            </div>
            <div className="goal-card">
              <h4>{t.goals.community}</h4>
              <p>{t.goals.communityDesc}</p>
            </div>
            <div className="goal-card">
              <h4>{t.goals.sustainability}</h4>
              <p>{t.goals.sustainabilityDesc}</p>
            </div>
          </div>
        </div>

        <div className="team">
          <h3>{t.teamTitle}</h3>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="member" key={member.name}>
                <img src={member.img} alt={member.alt} />
                <h4>{member.name}</h4>
                <p>{t.roles[member.roleKey as keyof typeof t.roles]}</p>
                <p className="bio">{t.bios[member.bioKey as keyof typeof t.bios]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
