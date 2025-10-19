import React, { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import "../styles/notification.css";

interface Notification {
  id: number;
  message: string;
  read?: boolean;
}

interface NotificationBellProps {
  notifications: Notification[];
  onOpenPanel?: () => void; 
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onOpenPanel,
}) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-icon"
        onClick={() => {
          setOpen(!open);
          if (onOpenPanel) onOpenPanel();
        }}
        aria-label="Notifications"
      >
        <FaBell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length > 0 ? (
            notifications.map((note) => (
              <p key={note.id} className="notification-item">
                {note.message}
              </p>
            ))
          ) : (
            <p className="no-notifications">No new notifications</p>
          )}
          <button
            className="view-all-btn"
            onClick={onOpenPanel}
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
