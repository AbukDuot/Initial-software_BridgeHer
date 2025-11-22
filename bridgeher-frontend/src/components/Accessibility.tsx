import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface AccessibilityProps {
  onClose: () => void;
}

const Accessibility: React.FC<AccessibilityProps> = ({ onClose }) => {
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
          {isArabic ? 'إمكانية الوصول' : 'Accessibility Statement'}
        </h1>
        
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
          {isArabic ? 'آخر تحديث: ' : 'Last Updated: '}{new Date().toLocaleDateString()}
        </p>

        <div style={{ lineHeight: '1.8', color: '#333', textAlign: isArabic ? 'right' : 'left' }}>
          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'التزامنا' : 'Our Commitment'}
            </h2>
            <p>
              {isArabic 
                ? 'تلتزم BridgeHer بضمان إمكانية الوصول الرقمي للأشخاص ذوي الإعاقة. نحن نعمل باستمرار على تحسين تجربة المستخدم للجميع وتطبيق معايير إمكانية الوصول ذات الصلة.'
                : 'BridgeHer is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.'}
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'معايير الامتثال' : 'Conformance Standards'}
            </h2>
            <p>
              {isArabic 
                ? 'تهدف منصة BridgeHer إلى الامتثال لإرشادات إمكانية الوصول إلى محتوى الويب (WCAG) 2.1 المستوى AA. هذه الإرشادات تشرح كيفية جعل محتوى الويب أكثر سهولة للأشخاص ذوي الإعاقة.'
                : 'The BridgeHer platform aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.'}
            </p>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'ميزات إمكانية الوصول' : 'Accessibility Features'}
            </h2>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>
                <strong>{isArabic ? 'دعم متعدد اللغات:' : 'Multilingual Support:'}</strong>{' '}
                {isArabic ? 'واجهة كاملة باللغتين الإنجليزية والعربية مع تخطيط RTL' : 'Full English and Arabic interface with RTL layout'}
              </li>
              <li>
                <strong>{isArabic ? 'التنقل بلوحة المفاتيح:' : 'Keyboard Navigation:'}</strong>{' '}
                {isArabic ? 'جميع الوظائف متاحة عبر لوحة المفاتيح (Tab، Enter، Escape)' : 'All functionality available via keyboard (Tab, Enter, Escape)'}
              </li>
              <li>
                <strong>{isArabic ? 'نسبة التباين:' : 'Contrast Ratios:'}</strong>{' '}
                {isArabic ? 'تلبي نسب تباين النص والخلفية معايير WCAG AA' : 'Text and background contrast ratios meet WCAG AA standards'}
              </li>
              <li>
                <strong>{isArabic ? 'النص البديل:' : 'Alternative Text:'}</strong>{' '}
                {isArabic ? 'جميع الصور تحتوي على نص بديل وصفي' : 'All images include descriptive alternative text'}
              </li>
              <li>
                <strong>{isArabic ? 'تسميات ARIA:' : 'ARIA Labels:'}</strong>{' '}
                {isArabic ? 'عناصر تفاعلية مع تسميات ARIA مناسبة' : 'Interactive elements with proper ARIA labels'}
              </li>
              <li>
                <strong>{isArabic ? 'حجم الخط القابل للتطوير:' : 'Scalable Font Size:'}</strong>{' '}
                {isArabic ? 'يمكن تكبير النص عبر إعدادات المتصفح' : 'Text can be resized via browser settings'}
              </li>
              <li>
                <strong>{isArabic ? 'التصميم المتجاوب:' : 'Responsive Design:'}</strong>{' '}
                {isArabic ? 'يعمل على الهاتف المحمول والجهاز اللوحي وسطح المكتب' : 'Works on mobile, tablet, and desktop'}
              </li>
              <li>
                <strong>{isArabic ? 'الوضع غير المتصل:' : 'Offline Mode:'}</strong>{' '}
                {isArabic ? 'تنزيل المحتوى للوصول في المناطق منخفضة الاتصال' : 'Download content for access in low-connectivity areas'}
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'التقنيات المساعدة' : 'Assistive Technologies'}
            </h2>
            <p>{isArabic ? 'منصتنا متوافقة مع:' : 'Our platform is compatible with:'}</p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'قارئات الشاشة (JAWS، NVDA، VoiceOver)' : 'Screen readers (JAWS, NVDA, VoiceOver)'}</li>
              <li>{isArabic ? 'برامج التعرف على الصوت' : 'Speech recognition software'}</li>
              <li>{isArabic ? 'مكبرات الشاشة' : 'Screen magnifiers'}</li>
              <li>{isArabic ? 'أدوات التنقل البديلة' : 'Alternative navigation tools'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'المتصفحات المدعومة' : 'Supported Browsers'}
            </h2>
            <p>{isArabic ? 'للحصول على أفضل تجربة، نوصي باستخدام:' : 'For the best experience, we recommend using:'}</p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>Google Chrome (v120+)</li>
              <li>Mozilla Firefox (v121+)</li>
              <li>Microsoft Edge (v120+)</li>
              <li>Safari (v17+)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'القيود المعروفة' : 'Known Limitations'}
            </h2>
            <p>
              {isArabic 
                ? 'نحن ندرك أن بعض أجزاء منصتنا قد لا تكون متاحة بالكامل بعد. نحن نعمل بنشاط على:'
                : 'We are aware that some parts of our platform may not be fully accessible yet. We are actively working on:'}
            </p>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>{isArabic ? 'تحسين دعم قارئ الشاشة لمشغلات الفيديو' : 'Improving screen reader support for video players'}</li>
              <li>{isArabic ? 'إضافة ترجمات للمحتوى المرئي' : 'Adding captions for video content'}</li>
              <li>{isArabic ? 'تعزيز التنقل بلوحة المفاتيح في المنتدى' : 'Enhancing keyboard navigation in the forum'}</li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'نصائح لإمكانية الوصول' : 'Accessibility Tips'}
            </h2>
            <ul style={{ marginTop: '10px', paddingRight: isArabic ? '20px' : '0', paddingLeft: isArabic ? '0' : '20px' }}>
              <li>
                <strong>{isArabic ? 'تكبير النص:' : 'Zoom Text:'}</strong>{' '}
                {isArabic ? 'اضغط Ctrl + (Windows) أو Cmd + (Mac)' : 'Press Ctrl + (Windows) or Cmd + (Mac)'}
              </li>
              <li>
                <strong>{isArabic ? 'وضع التباين العالي:' : 'High Contrast Mode:'}</strong>{' '}
                {isArabic ? 'تمكين في إعدادات نظام التشغيل الخاص بك' : 'Enable in your operating system settings'}
              </li>
              <li>
                <strong>{isArabic ? 'تبديل اللغة:' : 'Language Toggle:'}</strong>{' '}
                {isArabic ? 'استخدم زر اللغة في شريط التنقل' : 'Use the language button in the navigation bar'}
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '25px' }}>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'الملاحظات والدعم' : 'Feedback and Support'}
            </h2>
            <p>
              {isArabic 
                ? 'نرحب بملاحظاتك حول إمكانية الوصول إلى منصتنا. إذا واجهت أي حواجز أو كانت لديك اقتراحات للتحسين، يرجى الاتصال بنا:'
                : 'We welcome your feedback on the accessibility of our platform. If you encounter any barriers or have suggestions for improvement, please contact us:'}
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</strong> abukmayen123@gmail.com<br />
              <strong>{isArabic ? 'الهاتف:' : 'Phone:'}</strong> +250792104849<br />
              <strong>{isArabic ? 'وقت الاستجابة:' : 'Response Time:'}</strong> {isArabic ? '48 ساعة' : '48 hours'}
            </p>
          </section>

          <section>
            <h2 style={{ color: '#4A148C', fontSize: '20px', marginBottom: '10px' }}>
              {isArabic ? 'التحسين المستمر' : 'Continuous Improvement'}
            </h2>
            <p>
              {isArabic 
                ? 'نحن ملتزمون بالتحسين المستمر لإمكانية الوصول إلى منصتنا. نقوم بمراجعة وتحديث ممارسات إمكانية الوصول لدينا بانتظام لضمان أن جميع المستخدمين يمكنهم الاستفادة الكاملة من BridgeHer.'
                : 'We are committed to continuously improving the accessibility of our platform. We regularly review and update our accessibility practices to ensure all users can fully benefit from BridgeHer.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
