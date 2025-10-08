import React from "react";
import "../styles/modules.css";

interface NotesCardProps {
  notes: string[];
  language: string;
}

const NotesCard: React.FC<NotesCardProps> = ({ notes, language }) => {
  const isArabic = language === "Arabic";

  const downloadNotes = () => {
    const text = notes.join("\n- ");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = isArabic ? "ملاحظات_الدورة.txt" : "Course_Notes.txt";
    link.click();
  };

  return (
    <div className={`notes-card ${isArabic ? "rtl" : ""}`}>
      <h4>{isArabic ? "ملاحظات الدورة" : "Course Notes"}</h4>
      <ul>
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
      <button className="btn secondary" onClick={downloadNotes}>
        {isArabic ? "تحميل الملاحظات" : "Download Notes"}
      </button>
    </div>
  );
};

export default NotesCard;
