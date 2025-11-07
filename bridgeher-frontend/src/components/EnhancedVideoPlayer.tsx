import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import VideoQualitySelector from './VideoQualitySelector';
import '../styles/enhancedVideoPlayer.css';

interface VideoNote {
  id: number;
  timestamp: number;
  note_text: string;
  created_at: string;
}

interface VideoBookmark {
  id: number;
  timestamp: number;
  title: string;
  created_at: string;
}

interface VideoSource {
  quality: string;
  url: string;
  label: string;
}

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  moduleId: number;
  courseId: string;
  title: string;
  videoSources?: VideoSource[];
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  videoUrl,
  moduleId,
  courseId,
  title
}) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  
  const defaultSources: VideoSource[] = [
    { quality: '1080p', url: videoUrl, label: '1080p HD' },
    { quality: '720p', url: videoUrl, label: '720p HD' },
    { quality: '480p', url: videoUrl, label: '480p' },
    { quality: '360p', url: videoUrl, label: '360p' }
  ];
  const [showNotes, setShowNotes] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    loadNotes();
    loadBookmarks();
    loadPlaybackSettings();
  }, [moduleId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const loadNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/video-notes/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/video-bookmarks/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const loadPlaybackSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/modules/${moduleId}/playback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaybackSpeed(data.playback_speed || 1.0);
        if (videoRef.current && data.last_position) {
          videoRef.current.currentTime = data.last_position;
        }
      }
    } catch (error) {
      console.error('Failed to load playback settings:', error);
    }
  };

  const savePlaybackSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/courses/${courseId}/modules/${moduleId}/playback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          playbackSpeed,
          lastPosition: currentTime
        })
      });
    } catch (error) {
      console.error('Failed to save playback settings:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/video-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          moduleId,
          timestamp: Math.floor(currentTime),
          noteText: newNote
        })
      });
      
      if (res.ok) {
        setNewNote('');
        loadNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const addBookmark = async () => {
    if (!newBookmarkTitle.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/video-bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          moduleId,
          timestamp: Math.floor(currentTime),
          title: newBookmarkTitle
        })
      });
      
      if (res.ok) {
        setNewBookmarkTitle('');
        loadBookmarks();
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const jumpToTime = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleQualityChange = (quality: string, url: string) => {
    const currentTime = videoRef.current?.currentTime || 0;
    setCurrentVideoUrl(url);
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
      }
    }, 100);
  };

  const t = {
    speed: isAr ? 'السرعة' : 'Speed',
    notes: isAr ? 'الملاحظات' : 'Notes',
    bookmarks: isAr ? 'العلامات المرجعية' : 'Bookmarks',
    addNote: isAr ? 'إضافة ملاحظة' : 'Add Note',
    addBookmark: isAr ? 'إضافة علامة مرجعية' : 'Add Bookmark',
    noteText: isAr ? 'نص الملاحظة' : 'Note text',
    bookmarkTitle: isAr ? 'عنوان العلامة المرجعية' : 'Bookmark title',
    jumpTo: isAr ? 'انتقل إلى' : 'Jump to',
  };

  return (
    <div className={`enhanced-video-player ${isAr ? 'rtl' : ''}`}>
      <div className="video-container">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={currentVideoUrl}
            controls
            width="100%"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={savePlaybackSettings}
          />
          <div className="video-overlay-controls">
            <VideoQualitySelector
              sources={defaultSources}
              onQualityChange={handleQualityChange}
            />
          </div>
        </div>
        
        <div className="video-controls">
          <div className="speed-control">
            <label>{t.speed}:</label>
            <select 
              value={playbackSpeed} 
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            >
              {speedOptions.map(speed => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
          </div>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      <div className="video-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={showNotes ? 'active' : ''} 
            onClick={() => setShowNotes(!showNotes)}
          >
            📝 {t.notes}
          </button>
          <button 
            className={showBookmarks ? 'active' : ''} 
            onClick={() => setShowBookmarks(!showBookmarks)}
          >
            🔖 {t.bookmarks}
          </button>
        </div>

        {showNotes && (
          <div className="notes-panel">
            <div className="add-note">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t.noteText}
                rows={3}
              />
              <button onClick={addNote} className="btn primary">
                {t.addNote}
              </button>
            </div>
            
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-time" onClick={() => jumpToTime(note.timestamp)}>
                    {formatTime(note.timestamp)}
                  </div>
                  <div className="note-text">{note.note_text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showBookmarks && (
          <div className="bookmarks-panel">
            <div className="add-bookmark">
              <input
                type="text"
                value={newBookmarkTitle}
                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                placeholder={t.bookmarkTitle}
              />
              <button onClick={addBookmark} className="btn primary">
                {t.addBookmark}
              </button>
            </div>
            
            <div className="bookmarks-list">
              {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="bookmark-item">
                  <div className="bookmark-time" onClick={() => jumpToTime(bookmark.timestamp)}>
                    {formatTime(bookmark.timestamp)}
                  </div>
                  <div className="bookmark-title">{bookmark.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;