import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useUser } from '../hooks/useUser';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useUser();
  const isArabic = language === 'Arabic';

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handlePrivacyChange = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className={`settings-page ${isArabic ? 'rtl' : ''}`}>
      <div className="settings-container">
        <div className="settings-header">
          <h1>{isArabic ? 'الإعدادات' : 'Settings'}</h1>
          <p>{isArabic ? 'إدارة تفضيلات حسابك' : 'Manage your account preferences'}</p>
        </div>

        <div className="settings-content">
          {/* Language Settings */}
          <div className="settings-section">
            <h3>{isArabic ? 'اللغة' : 'Language'}</h3>
            <div className="setting-item">
              <label>{isArabic ? 'لغة التطبيق' : 'App Language'}</label>
              <select 
                value={language} 
                onChange={toggleLanguage}
                className="settings-select"
              >
                <option value="English">English</option>
                <option value="Arabic">العربية</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h3>{isArabic ? 'الإشعارات' : 'Notifications'}</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</label>
                <p>{isArabic ? 'تلقي إشعارات عبر البريد الإلكتروني' : 'Receive notifications via email'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</label>
                <p>{isArabic ? 'تلقي إشعارات عبر الرسائل النصية' : 'Receive notifications via SMS'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'الإشعارات الفورية' : 'Push Notifications'}</label>
                <p>{isArabic ? 'تلقي إشعارات فورية في المتصفح' : 'Receive push notifications in browser'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'إشعارات التسويق' : 'Marketing Notifications'}</label>
                <p>{isArabic ? 'تلقي عروض وأخبار المنصة' : 'Receive platform offers and news'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={() => handleNotificationChange('marketing')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <h3>{isArabic ? 'الخصوصية' : 'Privacy'}</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'الملف الشخصي مرئي' : 'Profile Visible'}</label>
                <p>{isArabic ? 'السماح للآخرين برؤية ملفك الشخصي' : 'Allow others to view your profile'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={() => handlePrivacyChange('profileVisible')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'إظهار البريد الإلكتروني' : 'Show Email'}</label>
                <p>{isArabic ? 'إظهار بريدك الإلكتروني في الملف الشخصي' : 'Display your email in profile'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={() => handlePrivacyChange('showEmail')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{isArabic ? 'إظهار رقم الهاتف' : 'Show Phone'}</label>
                <p>{isArabic ? 'إظهار رقم هاتفك في الملف الشخصي' : 'Display your phone in profile'}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={() => handlePrivacyChange('showPhone')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Account Actions */}
          <div className="settings-section">
            <h3>{isArabic ? 'إجراءات الحساب' : 'Account Actions'}</h3>
            
            <div className="action-buttons">
              <button className="btn secondary short">
                {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
              </button>
              
              <button className="btn danger short">
                {isArabic ? 'حذف الحساب' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;