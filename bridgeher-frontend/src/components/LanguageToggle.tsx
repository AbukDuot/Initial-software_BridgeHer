import React from "react";
import { useLanguage } from "../hooks/useLanguage"; 

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage(); 

  return (
    <button
      onClick={toggleLanguage}
      className="lang-btn"
      style={{
        backgroundColor: "#6a1b9a",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        cursor: "pointer",
      }}
    >
      {language === "English" ? "العربية" : "English"}
    </button>
  );
};

export default LanguageToggle;
