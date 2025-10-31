import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
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
      alert('Course downloaded successfully for offline access!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download course. Please try again.');
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
    if (!confirm('Delete offline course? You will need internet to re-download.')) return;

    try {
      await deleteOfflineCourse(courseId);
      setIsDownloaded(false);
      alert('Offline course deleted successfully!');
      checkStorage();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete offline course.');
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
          <button className="btn delete-btn" onClick={handleDelete}>
            🗑️ Delete Offline Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineDownload;
