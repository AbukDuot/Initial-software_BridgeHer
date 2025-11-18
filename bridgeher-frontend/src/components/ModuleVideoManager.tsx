import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/moduleVideoManager.css';

interface ModuleWithoutVideo {
  id: number;
  title: string;
  course_id: number;
  course_title: string;
}

const ModuleVideoManager: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [modules, setModules] = useState<ModuleWithoutVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadModulesWithoutVideos();
  }, []);

  const loadModulesWithoutVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/module-videos/missing-videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignVideos = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/module-videos/auto-assign-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(`✅ ${result.message}`);
        loadModulesWithoutVideos(); 
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error || 'Failed to auto-assign videos'}`);
      }
    } catch (err) {
      console.error('Auto-assign error:', err);
      alert('❌ Failed to auto-assign videos');
    } finally {
      setUpdating(false);
    }
  };

  const setupComputerCourses = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/setup/setup-computer-courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const result = await res.json();
        const totalModules = result.courses.reduce((sum: number, course: { modulesAdded: number }) => sum + course.modulesAdded, 0);
        alert(` Computer courses setup complete! Added ${totalModules} modules to ${result.courses.length} courses.`);
        loadModulesWithoutVideos(); 
      }
    } catch {
      alert(' Failed to setup Computer courses');
    } finally {
      setUpdating(false);
    }
  };

  const addVideoToModule = async (moduleId: number, videoUrl: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/module-videos/${moduleId}/video`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          video_url: videoUrl,
          duration: 15
        })
      });
      
      if (res.ok) {
        alert(' Video added successfully!');
        loadModulesWithoutVideos(); 
      }
    } catch {
      alert(' Failed to add video');
    }
  };

  const handleVideoUrlSubmit = (moduleId: number) => {
    const videoUrl = prompt('Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID):');
    if (videoUrl) {
      
      let embedUrl = videoUrl;
      if (videoUrl.includes('watch?v=')) {
        const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      addVideoToModule(moduleId, embedUrl);
    }
  };

  const t = {
    title: isAr ? 'إدارة فيديوهات الوحدات' : 'Module Video Manager',
    modulesWithoutVideos: isAr ? 'الوحدات بدون فيديوهات' : 'Modules Without Videos',
    autoAssign: isAr ? 'تعيين تلقائي للفيديوهات' : 'Auto-Assign Videos',
    addVideo: isAr ? 'إضافة فيديو' : 'Add Video',
    course: isAr ? 'الدورة' : 'Course',
    module: isAr ? 'الوحدة' : 'Module',
    noModules: isAr ? 'جميع الوحدات لديها فيديوهات!' : 'All modules have videos!',
    loading: isAr ? 'جارٍ التحميل...' : 'Loading...',
  };

  if (loading) {
    return <div className="video-manager-loading">{t.loading}</div>;
  }

  return (
    <div className={`module-video-manager ${isAr ? 'rtl' : ''}`}>
      <div className="manager-header">
        <h2>{t.title}</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <button 
            onClick={setupComputerCourses}
            disabled={updating}
            className="auto-assign-btn"
            style={{background: '#2196F3'}}
          >
            {updating ? '' : ''} {isAr ? 'إعداد دورات الحاسوب' : 'Setup Computer Courses'}
          </button>
          <button 
            onClick={autoAssignVideos}
            disabled={updating || modules.length === 0}
            className="auto-assign-btn"
          >
            {updating ? '' : ''} {t.autoAssign}
          </button>
        </div>
      </div>

      <div className="modules-count">
        {t.modulesWithoutVideos}: {modules.length}
      </div>

      {modules.length === 0 ? (
        <div className="no-modules">
           {t.noModules}
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="module-info">
                <h4>{module.title}</h4>
                <p className="course-name">{t.course}: {module.course_title}</p>
              </div>
              <button
                onClick={() => handleVideoUrlSubmit(module.id)}
                className="add-video-btn"
              >
                 {t.addVideo}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleVideoManager;
