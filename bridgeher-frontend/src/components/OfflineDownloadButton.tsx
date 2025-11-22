import React, { useState } from 'react';
import { showToast } from '../utils/toast';
import { downloadCourseForOffline } from '../serviceWorker';

interface OfflineDownloadButtonProps {
  courseId: number | string;
  courseName: string;
}

const OfflineDownloadButton: React.FC<OfflineDownloadButtonProps> = ({ courseId, courseName }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    
    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      if (data.type === 'DOWNLOAD_PROGRESS' && String(data.courseId) === String(courseId)) {
        setProgress(data.progress);
      }
      if (data.type === 'DOWNLOAD_COMPLETE' && String(data.courseId) === String(courseId)) {
        setDownloading(false);
        if (data.success) {
          setDownloaded(true);
          showToast(`${courseName} is now available offline! You can now access this course anytime, even without internet.`, 'success');
        } else {
          showToast(`Download failed: ${data.message}`, 'error');
        }
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
     
      if (data.type === 'GET_TOKEN') {
        event.ports[0].postMessage({ token: localStorage.getItem('token') });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    try {
      await downloadCourseForOffline(courseId);
    } catch (error) {
      console.error('Download error:', error);
      setDownloading(false);
      showToast('Download failed. Please try again.', 'error');
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  };

  if (downloaded) {
    return (
      <div style={{ textAlign: 'center' }}>
        <button 
          style={{
            background: '#2E7D32',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'default',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          disabled
        >
          ✓ Available Offline
        </button>
        <small style={{ color: '#2E7D32', marginTop: '5px', display: 'block', fontSize: '12px' }}>
            Access anytime, even without internet
        </small>
      </div>
    );
  }

  if (downloading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <button 
          style={{
            background: '#FFD700',
            color: '#4A148C',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'not-allowed',
            fontWeight: '600',
            width: '100%'
          }}
          disabled
        >
          Downloading... {progress}%
        </button>
        <div style={{
          width: '100%',
          height: '4px',
          background: '#E0E0E0',
          borderRadius: '2px',
          marginTop: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#4A148C',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleDownload}
      style={{
        background: '#4A148C',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#FFD700';
        e.currentTarget.style.color = '#4A148C';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#4A148C';
        e.currentTarget.style.color = 'white';
      }}
    >
      📥 Download for Offline
    </button>
  );
};

export default OfflineDownloadButton;
