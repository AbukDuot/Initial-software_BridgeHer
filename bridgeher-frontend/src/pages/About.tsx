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
          <ul>
            <li><strong>{t.inclusivity}:</strong> {t.inclusivityDesc}</li>
            <li><strong>{t.integrity}:</strong> {t.integrityDesc}</li>
            <li><strong>{t.collaboration}:</strong> {t.collaborationDesc}</li>
            <li><strong>{t.innovation}:</strong> {t.innovationDesc}</li>
            <li><strong>{t.empowerment}:</strong> {t.empowermentDesc}</li>
          </ul>
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
