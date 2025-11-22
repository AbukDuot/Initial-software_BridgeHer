import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { showToast } from '../utils/toast';
import { downloadCourseOffline, isCourseDownloaded, deleteOfflineCourse, getStorageUsage } from '../utils/offlineStorage';

interface OfflineDownloadProps {
  courseId: number;
}

interface Module {
  video_url?: string;
  pdf_url?: string;
}

const OfflineDownload: React.FC<OfflineDownloadProps> = ({ courseId }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [storage, setStorage] = useState({ used: 0, quota: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    checkDownloadStatus();
    checkStorage();
  }, [courseId]);

  const checkDownloadStatus = async () => {
    const downloaded = await isCourseDownloaded(courseId);
    setIsDownloaded(downloaded);
  };

  const checkStorage = async () => {
    const usage = await getStorageUsage();
    setStorage(usage);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    try {
      const token = localStorage.getItem('token');
      
      // Fetch course modules
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch modules');

      const modules = await response.json();
      
      // Download course with progress tracking
      const totalModules = modules.length;
      let completed = 0;

      for (const module of modules) {
        await downloadModuleContent(module);
        completed++;
        setProgress(Math.floor((completed / totalModules) * 100));
      }

      await downloadCourseOffline(courseId, modules);
      
      setIsDownloaded(true);
      showToast('Course downloaded successfully for offline access!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download course. Please try again.', 'error');
    } finally {
      setDownloading(false);
      setProgress(0);
      checkStorage();
    }
  };

  const downloadModuleContent = async (module: Module) => {
    const token = localStorage.getItem('token');

    // Download video
    if (module.video_url && !module.video_url.startsWith('http')) {
      await fetch(`${API_BASE_URL}${module.video_url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // Download PDF
    if (module.pdf_url && !module.pdf_url.startsWith('http')) {
      await fetch(`${API_BASE_URL}${module.pdf_url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOfflineCourse(courseId);
      setIsDownloaded(false);
      setShowDeleteModal(false);
      showToast('Offline course deleted successfully!', 'success');
      checkStorage();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete offline course.', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="offline-download">
      <div className="storage-info">
        <small>
          Storage: {formatBytes(storage.used)} / {formatBytes(storage.quota)}
        </small>
      </div>

      {!isDownloaded ? (
        <button
          className="btn download-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              📥 Downloading... {progress}%
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            '📥 Download for Offline'
          )}
        </button>
      ) : (
        <div className="offline-actions">
          <span className="downloaded-badge">✅ Available Offline</span>
          <button className="btn delete-btn" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete Offline Copy
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', textAlign: 'center'}}>
            <h3 style={{marginBottom: '15px'}}>Delete Offline Course?</h3>
            <p style={{marginBottom: '20px', color: '#666'}}>You will need internet to re-download.</p>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
              <button onClick={handleDelete} style={{background: '#E53935', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}>
                Delete
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{background: '#ccc', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineDownload;
