import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/helpFAQ.css';

const HelpFAQ: React.FC = () => {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const faqs = [
    {
      question: language === 'Arabic' ? 'كيف أسجل في BridgeHer؟' : 'How do I register on BridgeHer?',
      answer: language === 'Arabic'
        ? 'انقر على زر "تسجيل" في الصفحة الرئيسية، املأ النموذج بمعلوماتك، واختر دورك (متعلم أو مرشد). ستتلقى بريداً إلكترونياً للتأكيد.'
        : 'Click the "Register" button on the homepage, fill in your details, and choose your role (Learner or Mentor). You\'ll receive a confirmation email.'
    },
    {
      question: language === 'Arabic' ? 'هل BridgeHer مجاني؟' : 'Is BridgeHer free?',
      answer: language === 'Arabic'
        ? 'نعم! جميع الدورات الأساسية مجانية. نقدم أيضاً دورات متقدمة مدفوعة مع شهادات معتمدة.'
        : 'Yes! All basic courses are free. We also offer premium courses with certified certificates.'
    },
    {
      question: language === 'Arabic' ? 'كيف يمكنني التواصل مع مرشد؟' : 'How can I connect with a mentor?',
      answer: language === 'Arabic'
        ? 'انتقل إلى صفحة "المرشدون"، تصفح الملفات الشخصية، وانقر على "طلب إرشاد". سيتلقى المرشد طلبك ويمكنه قبوله.'
        : 'Go to the "Mentors" page, browse profiles, and click "Request Mentorship". The mentor will receive your request and can accept it.'
    },
    {
      question: language === 'Arabic' ? 'هل يمكنني تحميل الدورات للتعلم دون اتصال؟' : 'Can I download courses for offline learning?',
      answer: language === 'Arabic'
        ? 'نعم! انقر على زر "تحميل" في صفحة الدورة. يمكنك الوصول إلى المحتوى دون اتصال بالإنترنت.'
        : 'Yes! Click the "Download" button on the course page. You can access the content offline anytime.'
    },
    {
      question: language === 'Arabic' ? 'كيف أحصل على شهادة؟' : 'How do I get a certificate?',
      answer: language === 'Arabic'
        ? 'أكمل جميع وحدات الدورة واجتاز الاختبار النهائي بنسبة 70٪ أو أعلى. ستتلقى شهادة قابلة للتحميل.'
        : 'Complete all course modules and pass the final quiz with 70% or higher. You\'ll receive a downloadable certificate.'
    },
    {
      question: language === 'Arabic' ? 'هل يمكنني تبديل اللغة؟' : 'Can I switch languages?',
      answer: language === 'Arabic'
        ? 'نعم! استخدم زر تبديل اللغة في شريط التنقل للتبديل بين الإنجليزية والعربية.'
        : 'Yes! Use the language toggle button in the navbar to switch between English and Arabic.'
    },
    {
      question: language === 'Arabic' ? 'ماذا لو نسيت كلمة المرور؟' : 'What if I forget my password?',
      answer: language === 'Arabic'
        ? 'انقر على "نسيت كلمة المرور؟" في صفحة تسجيل الدخول. أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
        : 'Click "Forgot Password?" on the login page. Enter your email and we\'ll send you a reset link.'
    },
    {
      question: language === 'Arabic' ? 'كيف يمكنني تتبع تقدمي؟' : 'How do I track my progress?',
      answer: language === 'Arabic'
        ? 'انتقل إلى لوحة التحكم الخاصة بك لرؤية الدورات المسجلة، معدل الإكمال، والنقاط المكتسبة.'
        : 'Go to your dashboard to see enrolled courses, completion rate, and points earned.'
    }
  ];



  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('${API_BASE_URL}/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      if (res.ok) {
        alert(language === 'Arabic' 
          ? 'شكراً لك! سنتواصل معك قريباً.'
          : 'Thank you! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        alert(language === 'Arabic' ? 'فشل الإرسال' : 'Failed to send');
      }
    } catch (err) {
      alert(language === 'Arabic' ? 'خطأ في الاتصال' : 'Connection error');
    }
  };

  return (
    <div className="help-faq-page">
      <div className="help-header">
        <h1>{language === 'Arabic' ? 'مركز المساعدة' : 'Help Center'}</h1>
        <p>{language === 'Arabic' 
          ? 'ابحث عن إجابات للأسئلة الشائعة وتعلم كيفية استخدام BridgeHer'
          : 'Find answers to common questions and learn how to use BridgeHer'}</p>
      </div>

      <div className="faq-section">
        <h2>{language === 'Arabic' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                <span className="faq-icon">{activeIndex === index ? '−' : '+'}</span>
              </button>
              {activeIndex === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="contact-support-section">
        <h2>{language === 'Arabic' ? 'اتصل بالدعم' : 'Contact Support'}</h2>
        <p>{language === 'Arabic' 
          ? 'لم تجد ما تبحث عنه؟ أرسل لنا رسالة وسنساعدك!'
          : 'Didn\'t find what you\'re looking for? Send us a message and we\'ll help!'}</p>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={language === 'Arabic' ? 'الاسم' : 'Name'}
            value={contactForm.name}
            onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder={language === 'Arabic' ? 'البريد الإلكتروني' : 'Email'}
            value={contactForm.email}
            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
            required
          />
          <textarea
            placeholder={language === 'Arabic' ? 'رسالتك' : 'Your Message'}
            value={contactForm.message}
            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
            rows={5}
            required
          />
          <button type="submit" className="submit-btn">
            {language === 'Arabic' ? 'إرسال' : 'Send Message'}
          </button>
        </form>

        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>abukmayen@gmail.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <span>+250 789 101 234</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;
