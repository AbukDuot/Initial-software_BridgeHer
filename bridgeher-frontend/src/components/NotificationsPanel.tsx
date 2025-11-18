import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import api from "../config/api";
import "../styles/notificationsPanel.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  sent_via_email: boolean;
  sent_via_sms: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications: initialNotifications,
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const response = await api.get(`/api/notifications?userId=${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className={`notifications-panel ${isOpen ? "open" : ""}`}>
      <div className="panel-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </div>

      <div className="panel-content">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`notification-item ${note.type || "info"} ${note.read ? 'read' : 'unread'}`}
              onClick={() => !note.read && markAsRead(note.id)}
            >
              <h4>{note.title}</h4>
              <p>{note.message}</p>
              <div className="notification-meta">
                <span className="notification-time">{new Date(note.created_at).toLocaleString()}</span>
                {note.sent_via_email && <span className="badge">📧 Email</span>}
                {note.sent_via_sms && <span className="badge">📱 SMS</span>}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No notifications yet 🎉</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;