import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/help.css';

const Help: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === 'Arabic';

  const [activeTab, setActiveTab] = useState('faq');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  const guides = {
    courses: {
      title: isArabic ? 'دليل الدورات' : 'Courses Guide',
      content: isArabic ? [
        '1. انتقل إلى صفحة "الدورات" من القائمة الرئيسية',
        '2. تصفح الدورات المتاحة أو استخدم البحث للعثور على دورة محددة',
        '3. اضغط على "التسجيل في الدورة" للانضمام',
        '4. ابدأ بمشاهدة الوحدات بالترتيب',
        '5. أكمل الاختبارات في نهاية كل وحدة',
        '6. تتبع تقدمك من لوحة التحكم',
        '7. احصل على الشهادة بعد إكمال جميع الوحدات'
      ] : [
        '1. Navigate to "Courses" from the main menu',
        '2. Browse available courses or use search to find specific courses',
        '3. Click "Enroll in Course" to join',
        '4. Start watching modules in order',
        '5. Complete quizzes at the end of each module',
        '6. Track your progress from the dashboard',
        '7. Get your certificate after completing all modules'
      ]
    },
    community: {
      title: isArabic ? 'دليل المجتمع' : 'Community Guide',
      content: isArabic ? [
        '1. انتقل إلى صفحة "المجتمع" من القائمة',
        '2. تصفح المواضيع الموجودة أو ابحث عن موضوع محدد',
        '3. اضغط على "إنشاء موضوع جديد" لبدء نقاش',
        '4. اختر الفئة المناسبة وأضف العلامات',
        '5. اكتب عنوان واضح ومحتوى مفيد',
        '6. تفاعل مع المواضيع الأخرى بالردود والإعجابات',
        '7. احفظ المواضيع المهمة في المفضلة'
      ] : [
        '1. Navigate to "Community" from the menu',
        '2. Browse existing topics or search for specific topics',
        '3. Click "Create New Topic" to start a discussion',
        '4. Choose appropriate category and add tags',
        '5. Write a clear title and helpful content',
        '6. Engage with other topics through replies and likes',
        '7. Bookmark important topics to favorites'
      ]
    },
    mentorship: {
      title: isArabic ? 'دليل الإرشاد' : 'Mentorship Guide',
      content: isArabic ? [
        '1. انتقل إلى صفحة "الإرشاد" من القائمة',
        '2. تصفح قائمة المرشدين المتاحين',
        '3. اقرأ ملفات المرشدين الشخصية ومجالات خبرتهم',
        '4. اضغط على "طلب إرشاد" للمرشد المناسب',
        '5. اكتب رسالة واضحة تشرح احتياجاتك',
        '6. انتظر موافقة المرشد على الطلب',
        '7. احجز جلسات الإرشاد وحضرها في الوقت المحدد'
      ] : [
        '1. Navigate to "Mentorship" from the menu',
        '2. Browse the list of available mentors',
        '3. Read mentor profiles and their areas of expertise',
        '4. Click "Request Mentorship" for suitable mentor',
        '5. Write a clear message explaining your needs',
        '6. Wait for mentor approval of your request',
        '7. Book mentorship sessions and attend them on time'
      ]
    },
    app: {
      title: isArabic ? 'دليل التطبيق' : 'App Guide',
      content: isArabic ? [
        '1. استخدم القائمة العلوية للتنقل بين الصفحات',
        '2. غير اللغة من الزر في أعلى اليمين',
        '3. اضغط على صورتك الشخصية للوصول للإعدادات',
        '4. استخدم لوحة التحكم لمتابعة تقدمك',
        '5. فعل الإشعارات لتلقي التحديثات',
        '6. حمل المحتوى للوصول إليه بدون إنترنت',
        '7. استخدم البحث للعثور على المحتوى بسرعة'
      ] : [
        '1. Use the top navigation menu to move between pages',
        '2. Change language using the button in top right',
        '3. Click your profile picture to access settings',
        '4. Use the dashboard to track your progress',
        '5. Enable notifications to receive updates',
        '6. Download content for offline access',
        '7. Use search to quickly find content'
      ]
    }
  };

  const faqs = [
    {
      question: isArabic ? 'كيف أسجل في المنصة؟' : 'How do I register on the platform?',
      answer: isArabic 
        ? 'يمكنك التسجيل بالنقر على زر "إنشاء حساب" في الصفحة الرئيسية وملء النموذج المطلوب.'
        : 'You can register by clicking the "Register" button on the homepage and filling out the required form.'
    },
    {
      question: isArabic ? 'كيف أتواصل مع المرشدين؟' : 'How do I connect with mentors?',
      answer: isArabic
        ? 'اذهب إلى صفحة الإرشاد، اختر المرشد المناسب، واضغط على "طلب إرشاد" لإرسال طلب.'
        : 'Go to the Mentorship page, choose a suitable mentor, and click "Request Mentorship" to send a request.'
    },
    {
      question: isArabic ? 'كيف أحصل على الشهادات؟' : 'How do I get certificates?',
      answer: isArabic
        ? 'بعد إكمال جميع وحدات الدورة والاختبارات، ستحصل تلقائياً على شهادة إتمام.'
        : 'After completing all course modules and quizzes, you will automatically receive a completion certificate.'
    },
    {
      question: isArabic ? 'هل يمكنني الوصول للمحتوى بدون إنترنت؟' : 'Can I access content offline?',
      answer: isArabic
        ? 'نعم، يمكنك تحميل المحتوى للوصول إليه بدون إنترنت من خلال إعدادات الدورة.'
        : 'Yes, you can download content for offline access through the course settings.'
    }
  ];

  const handleGuideClick = (guideType: string) => {
    setSelectedGuide(guideType);
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const requestData = {
        name: user.name || 'Anonymous',
        email: user.email || '',
        message: supportForm.message,
        subject: supportForm.subject || supportForm.category
      };
      
      console.log('Sending support message:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/support/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Support response:', response.status, response.ok);

      if (response.ok) {
        alert(isArabic ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
        setSupportForm({ subject: '', message: '', category: 'general' });
      } else {
        const error = await response.json();
        alert(isArabic ? `فشل في الإرسال: ${error.error}` : `Failed to send: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      alert(isArabic ? 'فشل في إرسال الرسالة' : 'Failed to send message');
    }
  };

  return (
    <div className={`help-page ${isArabic ? 'rtl' : ''}`}>
      <div className="help-container">
        <div className="help-header">
          <h1>{isArabic ? 'المساعدة والدعم' : 'Help & Support'}</h1>
          <p>{isArabic ? 'نحن هنا لمساعدتك في رحلتك التعليمية' : 'We\'re here to help you on your learning journey'}</p>
        </div>

        <div className="help-tabs">
          <button 
            className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            {isArabic ? 'اتصل بنا' : 'Contact Us'}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            {isArabic ? 'أدلة الاستخدام' : 'User Guides'}
          </button>
        </div>

        <div className="help-content">
          {activeTab === 'faq' && (
            <div className="faq-section">
              <h2>{isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2>{isArabic ? 'اتصل بفريق الدعم' : 'Contact Support Team'}</h2>
              
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon"></span>
                  <div>
                    <h4>{isArabic ? 'البريد الإلكتروني' : 'Email'}</h4>
                    <p>mayenduot2@gmail.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon"></span>
                  <div>
                    <h4>{isArabic ? 'الهاتف' : 'Phone'}</h4>
                    <p>+250 789 101 234</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon"></span>
                  <div>
                    <h4>{isArabic ? 'ساعات العمل' : 'Working Hours'}</h4>
                    <p>{isArabic ? 'الأحد - الخميس: 9:00 - 17:00' : 'Sunday - Thursday: 9:00 AM - 5:00 PM'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSupportSubmit} className="support-form">
                <h3>{isArabic ? 'أرسل رسالة' : 'Send a Message'}</h3>
                
                <div className="form-group">
                  <label>{isArabic ? 'الفئة' : 'Category'}</label>
                  <select 
                    value={supportForm.category}
                    onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                  >
                    <option value="general">{isArabic ? 'عام' : 'General'}</option>
                    <option value="technical">{isArabic ? 'مشكلة تقنية' : 'Technical Issue'}</option>
                    <option value="course">{isArabic ? 'مشكلة في الدورة' : 'Course Issue'}</option>
                    <option value="account">{isArabic ? 'مشكلة في الحساب' : 'Account Issue'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{isArabic ? 'الموضوع' : 'Subject'}</label>
                  <input
                    type="text"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    placeholder={isArabic ? 'اكتب موضوع رسالتك' : 'Enter your message subject'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{isArabic ? 'الرسالة' : 'Message'}</label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="guides-section">
              {!selectedGuide ? (
                <>
                  <h2>{isArabic ? 'أدلة الاستخدام' : 'User Guides'}</h2>
                  <div className="guides-grid">
                    <div className="guide-card" onClick={() => setSelectedGuide('courses')}>
                      <span className="guide-icon"></span>
                      <h3>{isArabic ? 'دليل الدورات' : 'Courses Guide'}</h3>
                      <p>{isArabic ? 'تعلم كيفية التسجيل في الدورات وتتبع تقدمك' : 'Learn how to enroll in courses and track your progress'}</p>
                      <button className="read-guide-btn">{isArabic ? 'اقرأ الدليل' : 'Read Guide'}</button>
                    </div>
                    
                    <div className="guide-card" onClick={() => setSelectedGuide('community')}>
                      <span className="guide-icon"></span>
                      <h3>{isArabic ? 'دليل المجتمع' : 'Community Guide'}</h3>
                      <p>{isArabic ? 'اكتشف كيفية التفاعل مع المجتمع والمشاركة' : 'Discover how to interact with the community and participate'}</p>
                      <button className="read-guide-btn">{isArabic ? 'اقرأ الدليل' : 'Read Guide'}</button>
                    </div>
                    
                    <div className="guide-card" onClick={() => setSelectedGuide('mentorship')}>
                      <span className="guide-icon"></span>
                      <h3>{isArabic ? 'دليل الإرشاد' : 'Mentorship Guide'}</h3>
                      <p>{isArabic ? 'تعرف على كيفية العثور على مرشد والتواصل معه' : 'Learn how to find and connect with mentors'}</p>
                      <button className="read-guide-btn">{isArabic ? 'اقرأ الدليل' : 'Read Guide'}</button>
                    </div>
                    
                    <div className="guide-card" onClick={() => setSelectedGuide('app')}>
                      <span className="guide-icon"></span>
                      <h3>{isArabic ? 'دليل التطبيق' : 'App Guide'}</h3>
                      <p>{isArabic ? 'استكشف جميع ميزات المنصة وكيفية استخدامها' : 'Explore all platform features and how to use them'}</p>
                      <button className="read-guide-btn">{isArabic ? 'اقرأ الدليل' : 'Read Guide'}</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="guide-detail">
                  <button className="back-btn" onClick={() => setSelectedGuide(null)}>
                    {isArabic ? '← العودة إلى الأدلة' : '← Back to Guides'}
                  </button>
                  <h2>{guides[selectedGuide as keyof typeof guides].title}</h2>
                  <div className="guide-steps">
                    {guides[selectedGuide as keyof typeof guides].content.map((step, index) => (
                      <div key={index} className="guide-step">
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;