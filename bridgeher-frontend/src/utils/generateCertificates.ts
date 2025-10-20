import jsPDF from "jspdf";
import type { Language } from "../context/LanguageContext";

export function generateCertificate(
  name: string,
  courseTitle: string,
  language: Language
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const isArabic = language === "Arabic";

  doc.setFillColor("#f3e5f5");
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  if (isArabic) {
   
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#6a1b9a");
    doc.setFontSize(28);
    doc.text("شهادة إتمام دورة من BridgeHer", pageWidth / 2, 80, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor("#4a0072");
    doc.setFontSize(18);
    doc.text("تشهد منصة BridgeHer بأن", pageWidth / 2, 130, { align: "center" });

    doc.setFontSize(32);
    doc.setTextColor("#000");
    doc.text(name, pageWidth / 2, 170, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor("#4a0072");
    doc.text("قد أتم بنجاح الدورة التدريبية بعنوان:", pageWidth / 2, 210, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor("#6a1b9a");
    doc.setFontSize(20);
    doc.text(courseTitle, pageWidth / 2, 240, { align: "center" });

    const date = new Date().toLocaleDateString("ar-EG");
    doc.setFontSize(14);
    doc.setTextColor("#333");
    doc.text(`التاريخ: ${date}`, 80, 300);

    doc.setDrawColor("#4a0072");
    doc.line(320, 300, 500, 300);
    doc.setFont("helvetica", "italic");
    doc.text("أكاديمية BridgeHer", 410, 320, { align: "center" });
  } else {
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#6a1b9a");
    doc.setFontSize(28);
    doc.text("BridgeHer Certificate of Completion", pageWidth / 2, 80, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor("#4a0072");
    doc.setFontSize(18);
    doc.text("This is to certify that", pageWidth / 2, 130, { align: "center" });

    doc.setFontSize(32);
    doc.setTextColor("#000");
    doc.text(name, pageWidth / 2, 170, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor("#4a0072");
    doc.text("has successfully completed the course titled:", pageWidth / 2, 210, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor("#6a1b9a");
    doc.setFontSize(20);
    doc.text(`"${courseTitle}"`, pageWidth / 2, 240, { align: "center" });

    const date = new Date().toLocaleDateString();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.setTextColor("#333");
    doc.text(`Date: ${date}`, 80, 300);

    doc.setDrawColor("#4a0072");
    doc.line(320, 300, 500, 300);
    doc.text("BridgeHer Academy", 410, 320, { align: "center" });
  }

  doc.save(
    `BridgeHer_Certificate_${name.replace(/\s+/g, "_")}_${isArabic ? "AR" : "EN"}.pdf`
  );
}
