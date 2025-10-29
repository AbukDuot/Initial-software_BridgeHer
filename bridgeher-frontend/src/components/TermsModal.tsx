import React from "react";
import "../styles/terms-modal.css";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  language: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, language }) => {
  const isArabic = language === "Arabic";

  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay">
      <div className={`terms-modal ${isArabic ? "rtl" : ""}`}>
        <div className="terms-header">
          <h2>{isArabic ? "الشروط والأحكام" : "Terms & Conditions"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="terms-content">
          {/* Privacy Policy */}
          <section>
            <h3>{isArabic ? "سياسة الخصوصية" : "Privacy Policy"}</h3>
            <p>
              {isArabic
                ? "نحن في BridgeHer نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. نقوم بجمع المعلومات التالية:"
                : "At BridgeHer, we respect your privacy and are committed to protecting your personal data. We collect the following information:"}
            </p>
            <ul>
              <li>{isArabic ? "الاسم والبريد الإلكتروني" : "Name and email address"}</li>
              <li>{isArabic ? "معلومات الدورات والتقدم" : "Course enrollment and progress"}</li>
              <li>{isArabic ? "بيانات الاستخدام والتفاعل" : "Usage and interaction data"}</li>
            </ul>
            <p>
              {isArabic
                ? "لن نشارك بياناتك مع أطراف ثالثة دون موافقتك الصريحة."
                : "We will not share your data with third parties without your explicit consent."}
            </p>
          </section>

          {/* Terms of Use */}
          <section>
            <h3>{isArabic ? "شروط الاستخدام" : "Terms of Use"}</h3>
            <p>
              {isArabic
                ? "باستخدام منصة BridgeHer، فإنك توافق على:"
                : "By using the BridgeHer platform, you agree to:"}
            </p>
            <ul>
              <li>{isArabic ? "استخدام المنصة للأغراض التعليمية فقط" : "Use the platform for educational purposes only"}</li>
              <li>{isArabic ? "احترام حقوق الملكية الفكرية" : "Respect intellectual property rights"}</li>
              <li>{isArabic ? "عدم مشاركة حسابك مع الآخرين" : "Not share your account with others"}</li>
              <li>{isArabic ? "التصرف بأدب واحترام مع المستخدمين الآخرين" : "Behave respectfully towards other users"}</li>
            </ul>
            <p>
              {isArabic
                ? "نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط."
                : "We reserve the right to suspend or terminate accounts that violate these terms."}
            </p>
          </section>

          {/* Cookie Policy */}
          <section>
            <h3>{isArabic ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}</h3>
            <p>
              {isArabic
                ? "نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على المنصة:"
                : "We use cookies to improve your experience on the platform:"}
            </p>
            <ul>
              <li>{isArabic ? "ملفات تعريف الارتباط الأساسية: للحفاظ على جلستك" : "Essential cookies: To maintain your session"}</li>
              <li>{isArabic ? "ملفات تعريف الارتباط التحليلية: لفهم كيفية استخدامك للمنصة" : "Analytics cookies: To understand how you use the platform"}</li>
              <li>{isArabic ? "ملفات تعريف الارتباط الوظيفية: لحفظ تفضيلاتك" : "Functional cookies: To save your preferences"}</li>
            </ul>
            <p>
              {isArabic
                ? "يمكنك إدارة ملفات تعريف الارتباط من إعدادات المتصفح الخاص بك."
                : "You can manage cookies through your browser settings."}
            </p>
          </section>

          {/* Data Rights */}
          <section>
            <h3>{isArabic ? "حقوقك" : "Your Rights"}</h3>
            <p>
              {isArabic
                ? "لديك الحق في:"
                : "You have the right to:"}
            </p>
            <ul>
              <li>{isArabic ? "الوصول إلى بياناتك الشخصية" : "Access your personal data"}</li>
              <li>{isArabic ? "تصحيح البيانات غير الدقيقة" : "Correct inaccurate data"}</li>
              <li>{isArabic ? "حذف حسابك وبياناتك" : "Delete your account and data"}</li>
              <li>{isArabic ? "الاعتراض على معالجة بياناتك" : "Object to data processing"}</li>
            </ul>
            <p>
              {isArabic
                ? "للاستفسارات، تواصل معنا على: abukmayen@gmail.com"
                : "For inquiries, contact us at: abukmayen@gmail.com"}
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <button className="btn secondary" onClick={onClose}>
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button className="btn primary" onClick={onAccept}>
            {isArabic ? "أوافق على الشروط" : "I Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
