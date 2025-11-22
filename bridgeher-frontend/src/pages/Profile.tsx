import React, { useState, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import { showToast } from '../utils/toast';
import '../styles/profile.css';

const Profile: React.FC = () => {
  const { user, setUser } = useUser();
  const { language } = useLanguage();
  const isArabic = language === 'Arabic';

  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('💾 Saving profile:', formData);
      
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Profile updated:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditing(false);
        showToast(isArabic ? 'تم حفظ التغييرات بنجاح' : 'Profile updated successfully', 'success');
      } else {
        const error = await response.json();
        console.error('❌ Update failed:', error);
        showToast(isArabic ? `فشل: ${error.error || 'خطأ'}` : `Failed: ${error.error || 'Error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      showToast(isArabic ? 'فشل في حفظ التغييرات' : 'Failed to update profile', 'error');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast(isArabic ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(isArabic ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'Image size too large (max 5MB)', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      console.log('Uploading to:', `${API_BASE_URL}/api/profile/upload-image`);
      console.log('Token exists:', !!token);
      console.log('File size:', file.size);
      
      const response = await fetch(`${API_BASE_URL}/api/profile/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        const updatedUser = { ...user, profile_pic: result.imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast(isArabic ? 'تم تحديث الصورة بنجاح' : 'Profile image updated successfully', 'success');
        
        // Trigger navbar refresh
        window.dispatchEvent(new Event('storage'));
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
        showToast(isArabic ? `فشل في رفع الصورة: ${errorMessage}` : `Failed to upload image: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      showToast(isArabic ? `فشل في رفع الصورة: ${errorMessage}` : `Failed to upload image: ${errorMessage}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };



  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className={`profile-page ${isArabic ? 'rtl' : ''}`}>
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-container">
            {user.profile_pic ? (
              <img 
                src={user.profile_pic} 
                alt={user.name}
                className="avatar-large"
                onClick={triggerImageUpload}
              />
            ) : (
              <div className="avatar-large" onClick={triggerImageUpload}>
                {getInitials(user.name)}
              </div>
            )}
            <div className="avatar-overlay" onClick={triggerImageUpload}>
              {uploading ? (
                <span>...</span>
              ) : (
                <span>+</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-title">
            <h1>{isArabic ? 'الملف الشخصي' : 'My Profile'}</h1>
            <p>{user.role}</p>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setEditing(!editing)}
          >
            {editing 
              ? (isArabic ? 'إلغاء' : 'Cancel')
              : (isArabic ? 'تعديل' : 'Edit')
            }
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</h3>
            
            <div className="form-group">
              <label>{isArabic ? 'الاسم' : 'Name'}</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{user.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{user.email}</p>
              )}
            </div>

            <div className="form-group">
              <label>{isArabic ? 'رقم الهاتف' : 'Phone'}</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                />
              ) : (
                <p>{formData.phone || (isArabic ? 'غير محدد' : 'Not specified')}</p>
              )}
            </div>

            <div className="form-group">
              <label>{isArabic ? 'الموقع' : 'Location'}</label>
              {editing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={isArabic ? 'أدخل الموقع' : 'Enter location'}
                />
              ) : (
                <p>{formData.location || (isArabic ? 'غير محدد' : 'Not specified')}</p>
              )}
            </div>

            <div className="form-group">
              <label>{isArabic ? 'نبذة عني' : 'Bio'}</label>
              {editing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={isArabic ? 'اكتب نبذة عنك' : 'Tell us about yourself'}
                  rows={4}
                />
              ) : (
                <p>{formData.bio || (isArabic ? 'لا توجد نبذة' : 'No bio available')}</p>
              )}
            </div>

            <div className="form-actions">
              {editing && (
                <button className="save-btn" onClick={handleSave}>
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Profile;