import React from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/notificationsPanel.css";

interface Notification {
  id: number;
  message: string;
  time: string;
  type?: "info" | "success" | "warning";
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  isOpen,
  onClose,
}) => {
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
              className={`notification-item ${note.type || "info"}`}
            >
              <p>{note.message}</p>
              <span className="notification-time">{note.time}</span>
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
