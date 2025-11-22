import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const isArabic = language === 'Arabic';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '10px', maxWidth: '800px', width: '100%',
        maxHeight: '90vh', overflow: 'auto', padding: '30px', position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: isArabic ? 'auto' : '15px', left: isArabic ? '15px' : 'auto',
            background: '#E53935', color: 'white', border: 'none', borderRadius: '50%',
            width: '35px', height: '35px', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          ×
        </button>

        <h1 style={{ color: '#4A148C', marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
          {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
          {isArabic ? 'آخر تحديث: ' : 'Last Updated: '}{new Date().toLocaleDateString()}
        </p>

        <div style={{ lineHeight: '1.8', color: '#333', textAlign: isArabic ? 'right' : 'left' }}>
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '1. المعلومات التي نجمعها' : '1. Information We Collect'}
            </h2>
            <p>
              {isArabic 
                ? 'نجمع المعلومات التالية عند استخدامك لمنصة BridgeHer:'
                : 'We collect the following information when you use the BridgeHer platform:'}
            </p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)' : 'Account Information: Name, email, phone number (optional)'}</li>
              <li>{isArabic ? 'بيانات التعلم: تقدم الدورة، نتائج الاختبارات، الشهادات' : 'Learning Data: Course progress, quiz results, certificates'}</li>
              <li>{isArabic ? 'بيانات الاستخدام: سجلات النشاط، تفضيلات اللغة' : 'Usage Data: Activity logs, language preferences'}</li>
              <li>{isArabic ? 'المحتوى المقدم من المستخدم: منشورات المنتدى، التعليقات، الرسائل' : 'User-Generated Content: Forum posts, comments, messages'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '2. كيفية استخدام معلوماتك' : '2. How We Use Your Information'}
            </h2>
            <p>{isArabic ? 'نستخدم معلوماتك من أجل:' : 'We use your information to:'}</p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'توفير وتحسين خدمات التعلم لدينا' : 'Provide and improve our learning services'}</li>
              <li>{isArabic ? 'تتبع تقدمك ومنح الشهادات' : 'Track your progress and award certificates'}</li>
              <li>{isArabic ? 'إرسال إشعارات مهمة (البريد الإلكتروني/الرسائل النصية)' : 'Send important notifications (email/SMS)'}</li>
              <li>{isArabic ? 'ربط المتعلمين بالموجهين' : 'Connect learners with mentors'}</li>
              <li>{isArabic ? 'تحليل استخدام المنصة لتحسين التجربة' : 'Analyze platform usage to improve experience'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '3. مشاركة البيانات' : '3. Data Sharing'}
            </h2>
            <p>
              {isArabic 
                ? 'نحن لا نبيع معلوماتك الشخصية. قد نشارك البيانات مع:'
                : 'We do not sell your personal information. We may share data with:'}
            </p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'الموجهين (الاسم والملف الشخصي فقط)' : 'Mentors (name and profile only)'}</li>
              <li>{isArabic ? 'مقدمي الخدمات (Cloudinary للوسائط، Twilio للرسائل النصية)' : 'Service providers (Cloudinary for media, Twilio for SMS)'}</li>
              <li>{isArabic ? 'السلطات القانونية عند الطلب' : 'Legal authorities when required'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '4. أمن البيانات' : '4. Data Security'}
            </h2>
            <p>
              {isArabic 
                ? 'نحمي بياناتك باستخدام:'
                : 'We protect your data using:'}
            </p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'تشفير كلمات المرور (bcrypt)' : 'Password encryption (bcrypt)'}</li>
              <li>{isArabic ? 'مصادقة JWT الآمنة' : 'Secure JWT authentication'}</li>
              <li>{isArabic ? 'اتصالات HTTPS' : 'HTTPS connections'}</li>
              <li>{isArabic ? 'نسخ احتياطية منتظمة للبيانات' : 'Regular data backups'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '5. حقوقك' : '5. Your Rights'}
            </h2>
            <p>{isArabic ? 'لديك الحق في:' : 'You have the right to:'}</p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'الوصول إلى بياناتك الشخصية' : 'Access your personal data'}</li>
              <li>{isArabic ? 'تصحيح المعلومات غير الدقيقة' : 'Correct inaccurate information'}</li>
              <li>{isArabic ? 'طلب حذف الحساب' : 'Request account deletion'}</li>
              <li>{isArabic ? 'إلغاء الاشتراك في الإشعارات' : 'Opt-out of notifications'}</li>
              <li>{isArabic ? 'تصدير بياناتك' : 'Export your data'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '6. ملفات تعريف الارتباط' : '6. Cookies'}
            </h2>
            <p>
              {isArabic 
                ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك، بما في ذلك تفضيلات اللغة وحالة تسجيل الدخول.'
                : 'We use cookies to enhance your experience, including language preferences and login status.'}
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '7. خصوصية الأطفال' : '7. Children\'s Privacy'}
            </h2>
            <p>
              {isArabic 
                ? 'منصتنا مخصصة للمستخدمين الذين تبلغ أعمارهم 13 عامًا فما فوق. نحن لا نجمع عن قصد معلومات من الأطفال دون سن 13 عامًا.'
                : 'Our platform is intended for users aged 13 and above. We do not knowingly collect information from children under 13.'}
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '8. التغييرات على هذه السياسة' : '8. Changes to This Policy'}
            </h2>
            <p>
              {isArabic 
                ? 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات عبر البريد الإلكتروني أو إشعار على المنصة.'
                : 'We may update this Privacy Policy from time to time. We will notify you of any changes via email or platform notification.'}
            </p>
          </section>

          <section>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? '9. اتصل بنا' : '9. Contact Us'}
            </h2>
            <p>
              {isArabic 
                ? 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:'
                : 'If you have questions about this Privacy Policy, please contact us:'}
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</strong> abukmayen123@gmail.com<br />
              <strong>{isArabic ? 'الهاتف:' : 'Phone:'}</strong> +250792104849
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
