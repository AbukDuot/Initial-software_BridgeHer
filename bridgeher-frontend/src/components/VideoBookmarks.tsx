import { useState, useEffect } from 'react';
import '../styles/videoBookmarks.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Bookmark {
  id: number;
  timestamp: number;
  title: string;
  created_at: string;
}

interface VideoBookmarksProps {
  moduleId: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function VideoBookmarks({ moduleId, currentTime, onSeek }: VideoBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [moduleId]);

  const fetchBookmarks = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/video-bookmarks/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarks(data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleAddBookmark = async () => {
    if (!title.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/video-bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module_id: moduleId, timestamp: Math.floor(currentTime), title })
      });
      setTitle('');
      fetchBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/video-bookmarks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-bookmarks">
      <h4>Bookmarks</h4>
      <div className="add-bookmark">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bookmark title..." />
        <button onClick={handleAddBookmark}>Add Bookmark</button>
      </div>
      <div className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="bookmark-item">
            <span className="bookmark-time" onClick={() => onSeek(bookmark.timestamp)}>{formatTime(bookmark.timestamp)}</span>
            <span className="bookmark-title">{bookmark.title}</span>
            <button onClick={() => handleDelete(bookmark.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
