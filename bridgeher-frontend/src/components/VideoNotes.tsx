import { useState, useEffect } from 'react';
import '../styles/videoNotes.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bridgeher-backend.onrender.com';

interface Note {
  id: number;
  timestamp: number;
  note_text: string;
  created_at: string;
}

interface VideoNotesProps {
  moduleId: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function VideoNotes({ moduleId, currentTime, onSeek }: VideoNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [moduleId]);

  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/video-notes/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/video-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ module_id: moduleId, timestamp: Math.floor(currentTime), note_text: noteText })
      });
      setNoteText('');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/video-notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-notes">
      <h4>Notes</h4>
      <div className="add-note">
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note at current time..." />
        <button onClick={handleAddNote}>Add Note</button>
      </div>
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-item">
            <span className="note-time" onClick={() => onSeek(note.timestamp)}>{formatTime(note.timestamp)}</span>
            <p>{note.note_text}</p>
            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
